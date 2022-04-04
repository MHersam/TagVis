var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Documents = require('../../../models/document.js');
const User = require('../../../models/user.js');
const { default: zoteroAPI } = require('zotero-api-client');
const zoteroDocumentsService = require('../../../services/zotero_documents.js')
const specterEmbeddingService = require('../../../services/specter_embedding.js')
const recommendationService = require('../../../services/recommendations.js')

// add documents to a personal library
router.post('/', (req, res) => {
    var insert = []
    req.body.documents.forEach(doc => {
        doc.user = req.body.user;
        doc.origin = "tagvis";
        doc.created = new Date();
        insert.push({ insertOne: doc })
    });
    //Documents.bulkWrite(insert)
    Documents.insertMany(req.body.documents).then((dbDocs) => {
        // embed documents and update them in DB
        specterEmbeddingService.embedDocuments(dbDocs)
        specterEmbeddingService.embedCitedAndReferencedDocument(dbDocs).then(()=>{
            recommendationService.updateRecommendations(req.body.user)
        })

        User.findOne({ _id: req.body.user }).then(user => {
            if (user.zotero.id) {
                var docs = []
                dbDocs.forEach(doc => {
                    docs.push(docToZoteroNotation(doc))
                });
                //console.log(docs)
                zoteroDocumentsService.postDocumentsToZotero(user, docs, dbDocs).then((r) => {
                    res.send(dbNotationToClientDocument(r, user))
                }).catch(err => {
                    if (err == 403) {
                        res.sendStatus(403)
                    } else {
                        res.sendStatus(500)
                    }
                })
                function docToZoteroNotation(doc) {
                    var d = {};
                    //if (doc._id) { d._id = doc._id }
                    if (doc.title) { d.title = doc.title }
                    if (doc.abstract) { d.abstractNote = doc.abstract }
                    if (doc.year) { d.date = doc.year }
                    if (doc.identifiers) {
                        if (doc.identifiers.doi) { d.DOI = doc.identifiers.doi }
                        if (doc.identifiers.isbn) { d.ISBN = doc.identifiers.isbn }
                        if (doc.identifiers.issn) { d.ISSN = doc.identifiers.issn }
                        // TODO: I have no idea how zotero handles multiple extras, like is it even allowed and whats the delimiter?
                        if (doc.identifiers.pmid) { d.extra = "PMID: " + doc.identifiers.pmid }
                        if (doc.identifiers.arxiv) { d.extra = "arXiv: " + doc.identifiers.arxiv }
                    }
                    if (doc.type == ("book" || "book_section")) {
                        if (doc.type == "book") { d.itemType = "book"; } else {
                            d.itemType = "bookSection";
                        }
                        delete d.ISSN
                        if (doc.source) d.publisher = doc.source;
                    } else if (doc.type == ("inproceedings" || "conference_proceedings")) {
                        d.itemType = "conferencePaper";
                        delete d.ISSN
                        if (doc.source) d.conferenceName = doc.source;
                    } else {
                        // default
                        if (doc.identifiers.isbn) {
                            d.itemType = "conferencePaper";
                            delete d.ISSN
                            if (doc.source) d.conferenceName = doc.source;
                        } else {
                            d.itemType = "journalArticle";
                            delete d.ISBN
                            if (doc.source) d.publicationTitle = doc.source;
                        }
                    }
                    if (doc.authors) {
                        d.creators = [];
                        doc.authors.forEach(author => {
                            d.creators.push({ creatorType: "author", firstName: author.first_name ? author.first_name : "", lastName: author.last_name ? author.last_name : "" })
                        });
                    }
                    if (doc.url) { d.url = doc.url };
                    if (doc.pages) { d.pages = doc.pages };
                    if (doc.volume) { d.volume = doc.volume };
                    if (doc.number) { d.issue = doc.number };

                    if (doc.tags) {
                        d.tags = [];
                        doc.tags.forEach(tag => {
                            d.tags.push({ tag: tag, type: 1 })
                        });
                    }
                    //if (doc.keywords) { d.keywords = doc.keywords }
                    return d;
                }
            }
            else if (user.mendeley.id) {
                var promises = []
                const headers = {
                    Authorization: 'Bearer ' + req.body.auth_token,
                    'Content-Type': 'application/vnd.mendeley-document.1+json',
                    'Accept': 'application/vnd.mendeley-document.1+json'
                }
                dbDocs.forEach(doc => {
                    var d = {}
                    if (doc.title) { d.title = doc.title }
                    if (doc.abstract) { d.abstract = doc.abstract }
                    if (doc.year) { d.year = doc.year }
                    if (doc.identifiers) {
                        d.identifiers = {}
                        if (doc.identifiers.doi) { d.identifiers.doi = doc.identifiers.doi }
                        if (doc.identifiers.arxiv) { d.identifiers.arxiv = doc.identifiers.arxiv }
                        if (doc.identifiers.isbn) { d.identifiers.isbn = doc.identifiers.isbn }
                        if (doc.identifiers.issn) { d.identifiers.issn = doc.identifiers.issn }
                        if (doc.identifiers.pmid) { d.identifiers.pmid = doc.identifiers.pmid }
                    }
                    if (doc.type) {
                        //default to journal
                        d.type = "journal"
                        if (doc.type == "misc") d.type = "generic";
                        if (doc.type == "book") d.type = "book";
                        if (doc.type == "book_section") d.type = "book_section";
                        if (doc.type == "inproceedings") d.type = "conference_proceedings";
                    }
                    if (doc.authors) { d.authors = doc.authors }
                    if (doc.source) { d.source = doc.source }
                    if (doc.tags) { d.tags = doc.tags }
                    if (doc.keywords) { d.keywords = doc.keywords }
                    if (doc.url) { d.url = doc.url };
                    if (doc.pages) { d.pages = doc.pages };
                    if (doc.volume) { d.volume = doc.volume };
                    if (doc.number) { d.number = doc.number };
                    promises.push(axios.post('https://api.mendeley.com/documents/', d, {
                        headers: headers
                    }).then((r) => {
                        doc.mendeley_id = r.data.id
                        doc.save()
                    }).catch(err => {
                        console.log(err)
                    }))
                });
                Promise.allSettled(promises).then(() => {
                    res.send(dbNotationToClientDocument(dbDocs, user))
                }).catch(err => {
                    console.log(err)
                    res.sendStatus(500)
                })
            } else {
                res.send(dbNotationToClientDocument(dbDocs, user))
            }
        })

    })
    // transform notation so that sent documents can directly be displayed in a table on client
    function dbNotationToClientDocument(docs, user) {
        var docs = JSON.parse(JSON.stringify(docs))
        docs.forEach(doc => {
            let authorString = "";
            if ("authors" in doc) {
                doc.authors.forEach((author) => {
                    authorString +=
                        author.first_name + " " + author.last_name + ", ";
                });
            }
            doc.authorsString = authorString.substring(
                0,
                authorString.length - 2
            );

            const created = new Date(doc.created);
            let month = "" + (created.getMonth() + 1);
            let day = "" + created.getDate();
            if (month.length < 2) {
                month = "0" + month;
            }
            if (day.length < 2) {
                day = "0" + day;
            }
            doc.created = created.getFullYear() + "-" + month + "-" + day;
            doc.user = {};
            doc.user.photo = null;
            if (user.account_type == "Mendeley") {
                doc.user.photo = user.photo
            } else {
                doc.user.photo = req.protocol + "://" + req.get('host') + '/api/users/photo?userid=' + user._id;
            }
            doc.user._id = user._id;
            doc.user.display_name = user.display_name;
        });
        return docs;
    }
})
module.exports = router;
