var router = require('express').Router();
const axios = require('axios');
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Documents = require('../../../models/document.js');
const User = require('../../../models/user.js');
const Group = require('../../../models/group.js');
const { default: zoteroAPI } = require('zotero-api-client');
const groupsService = require('../../../services/groups.js')
const specterEmbeddingService = require('../../../services/specter_embedding.js')
const recommendationService = require('../../../services/recommendations.js')

// returns all documents in a users personal library
router.get('/', (req, res) => {
    // response data
    var documents = [];
    // link for next page of documents
    var next = "";
    // number of docs in the library
    var mendeleyCount = 0;

    User.findOne({ auth_token: req.headers.access_token }).then(u => {
        switch (u.account_type) {
            case "TagVis":
                sendTagVisLibrary(u)
                break;
            case "Mendeley":
                fetchAndSaveMendeleyLibrary(u)
                break;
            case "Zotero":
                fetchAndSaveZoteroLibrary(u)
                break;
            default:
                res.sendStatus(404)
                break;
        }
    })

    function sendTagVisLibrary(user) {
        Documents.find({ user: user._id }, { embedding: 0 }).then((docs) => {
            res.send(docs)
        })
    }

    async function fetchAndSaveZoteroLibrary(user) {
        try {
            var data = [];
            const apiResponse = await zoteroAPI(user.zotero.oauth_token_secret)
                .library('user', user.zotero.id)
                .items()
                .get({ limit: 100 });
            var docs = [];
            var hasNext = apiResponse.response.headers.get('link').includes('rel="next"');
            var startIndex = 100;
            var nextURL = "https://api.zotero.org/users/" + user.zotero.id + "/items?limit=100&start=" + startIndex;
            data = [].concat(apiResponse.getData(), data);
            console.log(apiResponse.response.headers.get("last-modified-version"))
            user.zotero.library_version = apiResponse.response.headers.get("last-modified-version")
            await user.save();

            //Iterate over paginated responses to get all documents in the user's library
            while (hasNext) {
                await axios.get(nextURL, {
                    headers: {
                        Authorization: 'Bearer ' + user.zotero.oauth_token_secret,
                    }
                }).then(function (response) {
                    startIndex += 100;
                    var d = [];
                    response.data.forEach(el => {
                        d.push(el.data)
                    });
                    data = [].concat(d, data);
                    hasNext = response.headers.link.includes('rel="next"');
                    if (hasNext) nextURL = "https://api.zotero.org/users/" + user.zotero.id + "/items?limit=100&start=" + startIndex;
                }).catch(err => {
                    console.log(err)
                })
            }
            data.forEach(doc => {
                const newdoc = {};
                // map zotero document notation to our own notation
                newdoc.title = doc.title;
                newdoc.user = user._id;
                newdoc.origin = "zotero"
                newdoc.tags = [];
                doc.tags.forEach(tag => {
                    newdoc.tags.push(tag.tag)
                });
                if (doc.date) newdoc.year = doc.date.split(/-|\s/)[0]
                newdoc.zotero_id = doc.key;
                newdoc.abstract = doc.abstractNote;
                newdoc.created = doc.dateAdded;
                newdoc.authors = [];
                newdoc.identifiers = {}
                if (doc.creators) {
                    doc.creators.forEach(author => {
                        var a = {};
                        if (author.firstName || author.lastName) {
                            a.first_name = author.firstName ? author.firstName : "";
                            a.last_name = author.lastName ? author.lastName : "";
                        } else if (author.name) {
                            a.first_name = "";
                            a.last_name = author.name;
                        } else {
                            a.first_name = "";
                            a.last_name = "";
                        }
                        newdoc.authors.push(a)
                    });
                }
                if (doc.DOI) newdoc.identifiers.doi = doc.DOI;
                if (doc.ISSN) newdoc.identifiers.issn = doc.ISSN;
                if (doc.ISBN) newdoc.identifiers.isbn = doc.ISBN;
                if (doc.extra) {
                    if (doc.extra.includes('arXiv:')) newdoc.identifiers.arxiv = doc.extra.substring(doc.extra.indexOf(' ') + 1)
                    if (doc.extra.includes('PMID:')) newdoc.identifiers.pmid = doc.extra.substring(doc.extra.indexOf(' ') + 1)
                }
                if (doc.itemType == "journalArticle") newdoc.source = doc.publicationTitle ? doc.publicationTitle : "";
                if (doc.itemType == "book") newdoc.source = doc.publisher ? doc.publisher : "";
                if (doc.itemType == "conferencePaper") newdoc.source = doc.conferenceName ? doc.conferenceName : "";
                newdoc.version = doc.version;
                docs.push(newdoc)
            });
            var resDocs = [];
            // save/update docs in our DB
            var promises = [];
            var groupsToUpdate = [];
            var docsToEmbed = [];
            docs.forEach(d => {
                promises.push(new Promise((resolve, reject) => {
                    // find existing doc in db
                    promises.push(Documents.findOne({ zotero_id: d.zotero_id }).then(existingDoc => {
                        if (existingDoc && existingDoc.identifiers && existingDoc.identifiers.paperId) d.identifiers.paperId = existingDoc.identifiers.paperId;
                        // update/save doc in our db with data from Zotero
                        promises.push(Documents.findOneAndUpdate({ zotero_id: d.zotero_id }, d, { upsert: true, new: true, rawResult: true, fields: { embedding: 0 } }).then((raw) => {
                            resDocs.push(raw.value);
                            if (!raw.lastErrorObject.updatedExisting) { docsToEmbed.push(raw.value) }
                            resolve()
                        }));
                        if (existingDoc && !arraysEqual(existingDoc.tags, d.tags)) {
                            // Tags of this doc were updated in Zotero -> find the groups that include this document to update group card tag overview
                            promises.push(Group.find({ documents: mongoose.Types.ObjectId(existingDoc._id) }).then((groups) => {
                                groups.forEach(group => {
                                    groupsToUpdate.push(group._id)
                                });
                            }))
                        }
                    }).catch(err => {
                        console.log(err)
                        reject()
                    }))
                }))
            })
            Promise.allSettled(promises).then(async () => {
                // Send documents with our MongoDB ObjectID
                res.send(resDocs)
                updateTagOverview(groupsToUpdate)
                //TODO: Remove removed docs from groups and update group tag overview. Also for Mendeley
                //await Documents.deleteMany({ user: user._id, zotero_id: { "$nin": resDocs.map(f => f.zotero_id) } })
                Documents.updateMany({ user: user._id, zotero_id: { "$nin": resDocs.map(f => f.zotero_id) } }, { user: null }).then(r => {
                    if (docsToEmbed.length > 0) {
                        specterEmbeddingService.embedDocuments(docsToEmbed)
                        specterEmbeddingService.embedCitedAndReferencedDocument(docsToEmbed).then(() => {
                            recommendationService.updateRecommendations(user)
                        })
                    } else if (r.nModified > 0) {
                        specterEmbeddingService.updateLibraryEmbeddingAndClusters(user).then(() => {
                            recommendationService.updateRecommendations(user)
                        })
                    }
                })
            }).catch(err => {
                console.log(err)
            })
        } catch (e) {
            console.error("Error has occurred:", e);
            if (e.response.status == 403) {
                res.sendStatus(403)
            } else {
                res.sendStatus(500)
            }
        }
    }

    function fetchAndSaveMendeleyLibrary(user) {
        // TODO: rewrite, I think there are also bugs here, when more than 500 docs
        // TODO: generate and save authorsString here instead of in tables components
        var groupsToUpdate = [];
        var docsToEmbed = [];
        axios.get('https://api.mendeley.com/documents?limit=500&view=all', {
            headers: {
                Authorization: 'Bearer ' + req.headers.access_token,
                Accept: 'application/vnd.mendeley-document.1+json'
            }
        }).then(function (response) {
            mendeleyCount = response.headers['mendeley-count'];
            documents = documents.concat(response.data);
            if (mendeleyCount > 500) {
                next = response.headers.link.toString().split(">")[0].substring(1);
                fetchAllPages(next).then(function () {
                    saveDocuments(req.headers.access_token).then(() => {
                        Documents.updateMany({ user: user._id, mendeley_id: { "$nin": documents.map(f => f.id) } }, { user: null }).then(r => {
                            if (docsToEmbed.length > 0) {
                                specterEmbeddingService.embedDocuments(docsToEmbed)
                                specterEmbeddingService.embedCitedAndReferencedDocument(docsToEmbed).then(() => {
                                    recommendationService.updateRecommendations(user)
                                })
                            } else if (r.nModified > 0) {
                                specterEmbeddingService.updateLibraryEmbeddingAndClusters(user).then(() => {
                                    recommendationService.updateRecommendations(user)
                                })
                            }
                            Documents.find({ user: user._id }, { embedding: 0 }).then((docs) => {
                                res.send(docs)
                                updateTagOverview(groupsToUpdate);
                            })
                        })
                    })
                }).catch(function (error) {
                    console.log(error)
                    res.send(error)
                })
            } else {
                documents.forEach(doc => {
                    doc.origin = "mendeley"
                    doc.mendeley_id = doc.id
                });
                saveDocuments(req.headers.access_token).then(() => {
                    Documents.updateMany({ user: user._id, mendeley_id: { "$nin": documents.map(f => f.id) } }, { user: null }).then(r => {
                        if (docsToEmbed.length > 0) {
                            specterEmbeddingService.embedDocuments(docsToEmbed)
                            specterEmbeddingService.embedCitedAndReferencedDocument(docsToEmbed).then(() => {
                                recommendationService.updateRecommendations(user)
                            })
                        } else if (r.nModified > 0) {
                            specterEmbeddingService.updateLibraryEmbeddingAndClusters(user).then(() => {
                                recommendationService.updateRecommendations(user)
                            })
                        }
                        Documents.find({ user: user._id }, { embedding: 0 }).then((docs) => {
                            res.send(docs)
                            updateTagOverview(groupsToUpdate);
                        })
                    })
                }).catch(err => {
                    console.log(err)
                    res.send(documents)
                })
            }

        }).catch(function (error) {
            res.send(error);
        })


        function fetchAllPages(link) {
            return new Promise((resolve, reject) => {
                iterateAllPages(link).then(function () {
                    resolve();
                }).catch(function (error) {
                    reject(error);
                })
            })
        }

        async function iterateAllPages() {
            for (var i = 500; i < mendeleyCount; i = i + 500) {
                await fetchNextPage();
            }
        }

        function fetchNextPage() {
            return new Promise((resolve, reject) => {
                axios.get(next, {
                    headers: {
                        Authorization: 'Bearer ' + req.headers.access_token,
                        Accept: 'application/vnd.mendeley-document.1+json'
                    }
                }).then(function (response1) {
                    next = response1.headers.link.toString().split(">")[0].substring(1);
                    documents = documents.concat(response1.data);
                    resolve(response1);
                }).catch(function (error) {
                    console.log(error);
                    reject(error);
                })
            })
        }

        function saveDocuments(auth_token) {
            return new Promise((resolve, reject) => {
                var userId = null
                User.find({ "auth_token": auth_token }).then(users => {
                    userId = users[0]._id
                    var promises = [];
                    for (var i = 0; i < documents.length; i++) {
                        promises.push(saveDocument(documents[i], i, userId))
                    }
                    Promise.all(promises).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }).catch((err) => {
                console.log(err)
            })
            function saveDocument(doc, index, userId) {
                return new Promise((resolve, reject) => {
                    Documents.findOne({ mendeley_id: doc.mendeley_id }).then(d => {
                        if (d == null) {
                            const newdoc = new Documents(doc);
                            newdoc.user = userId;
                            newdoc.save().then((d1) => {
                                documents[index]._id = d1._id
                                docsToEmbed.push(d1);
                                resolve(d1)
                            }).catch(function (error) {
                                console.log(error);
                                reject(error)
                            });
                        } else {
                            if (!doc.tags) doc.tags = [];
                            Documents.findOneAndUpdate({ mendeley_id: doc.mendeley_id }, doc, { upsert: true, new: true }).then((dbDoc) => {
                                if (!arraysEqual(doc.tags, d.tags)) {
                                    // Tags of this doc were updated in Mendeley -> find the groups that include this document to update group card tag overview
                                    Group.find({ documents: mongoose.Types.ObjectId(dbDoc._id) }).then((groups) => {
                                        groups.forEach(group => {
                                            groupsToUpdate.push(group._id)
                                        });
                                        resolve(dbDoc)
                                    })
                                } else {
                                    resolve(dbDoc)
                                }
                            });
                        }
                    }).catch(err => {
                        console.log(err)
                        reject(err)
                    })
                })
            }
        }
    }
    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function updateTagOverview(groupsToUpdate) {
        // update tag overview of our group cards
        groupsToUpdate = [...new Set(groupsToUpdate)]
        groupsToUpdate.forEach(group => {
            groupsService.updateTags(group._id)
        });
    }
})
module.exports = router;
