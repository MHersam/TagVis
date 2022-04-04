const Documents = require('../models/document.js');
const Users = require('../models/user.js');
var Bottleneck = require('bottleneck');
const limiter = new Bottleneck({
    minTime: 10,
    maxConcurrent: 100
});
const semanticScholarDocumentService = require('./semantic_scholar_document.js');
const axios = require('axios')
const config = require('../../config.json');

// service that outputs an array of graph nodes for a given array of documents
getNodes = async (docs, userId, addTopics) => {
    var user;
    if (userId && userId.length > 0) { user = await Users.findById(userId, { library_embedding: 1, library_clusters: 1 }) }
    return new Promise(function (resolve, reject) {
        var nodes = Array(docs.length);
        var promises = [];
        var docsToEmbed = [];
        for (let i = 0; i < docs.length; i++) {
            //let docs = docs[i];
            promises.push(new Promise(async (resolve, reject) => {
                // it's important too keep the index as const here, to ensure that a node has the same index as the corresponding document in its array. Positions would be mixed up by waiting for promises, which leads to links connecting the wrong nodes.
                const index = i;

                //build the node
                var entry = {};
                entry.id = docs[index]._id;
                entry.type = "circle";
                entry.tags = docs[index].tags ? docs[index].tags : [];
                entry.authors = docs[index].authors;
                entry.title = docs[index].title;
                entry.year = docs[index].year;
                entry.abstract = docs[index].abstract;
                entry.source = docs[index].source;
                entry.authorsString = docs[index].authorsString;
                entry.identifiers = docs[index].identifiers ? docs[index].identifiers : {}
                if (docs[index].identifiers && docs[index].identifiers.doi) { entry.doi = docs[index].identifiers.doi }
                if (docs[index].identifiers && docs[index].identifiers.arxiv) { entry.arxiv = docs[index].identifiers.arxiv }
                entry.citationCount = 0;
                entry.librarySimilarity = 0;
                docs[index].user ? entry.user = docs[index].user : null;
                // prepare an identifier string for paper lookup on semantic scholar
                if (docs[index].identifiers) {
                    var identifiers = Object.keys(docs[index].identifiers)
                    var identifier = '';
                    for (var j = 0; j < identifiers.length; j++) {
                        switch (identifiers[j]) {
                            case 'doi':
                                identifier = encodeURI(docs[index].identifiers.doi)
                                break;
                            case 'arxiv':
                                identifier = 'arXiv:' + docs[index].identifiers.arxiv
                                break;
                            case 'pmid':
                                identifier = 'PMID:' + docs[index].identifiers.pmid
                                break;
                            case 'acl':
                                identifier = 'ACL:' + docs[index].identifiers.acl
                                break;
                            case 'mag':
                                identifier = 'MAG:' + docs[index].identifiers.mag
                                break;
                            case 'paperId':
                                identifier = docs[index].identifiers.paperId
                                break;
                        }
                        if (identifier != '') { break; }
                    }
                    if (identifier != '') {
                        // lookup semantic scholar doc in db or try to retrieve it from semantic scholar
                        limiter.schedule(() => semanticScholarDocumentService.getSemanticScholarDocument(identifier, docs[index]))
                            .then((res) => {
                                // set values from found semantic scholar document
                                if (res.citationCount) { entry.citationCount = res.citationCount } else if (res.numCitedBy) { entry.citationCount = res.numCitedBy } else { entry.citationCount = 0 }
                                entry.identifiers.paperId = res.paperId;
                                if (addTopics && res.topics.length > 0) entry.tags = [...new Set(entry.tags.concat(res.topics.map(a => a.topic)))];
                                if (!entry.abstract && res.abstract) entry.abstract = res.abstract;
                                if (!entry.source && res.venue.length > 0) entry.source = res.venue;
                                if (!docs[index].abstract && res.abstract) docs[index].abstract = res.abstract;
                                docs[index].semanticScholarDocument = res;
                            })
                            .catch((error) => {
                                console.log(error)
                                //TODO: retry with other identifier if error.response.status == 404 (Paper not found)
                                entry.citationCount = 0;
                            }).finally(() => {
                                // if doc is not in our db it has no _id
                                if (entry.librarySimilarity == 0 && docs[index]._id && user) {
                                    Documents.findOne({ _id: docs[index]._id }, { embedding: 1 }).then(d => {
                                        if (d.embedding && d.embedding.length > 0 && user.library_embedding) {
                                            entry.librarySimilarity = librarySimilarity(d.embedding, user)
                                            console.log(entry.librarySimilarity + " " + entry.title)
                                        }
                                        addNode();
                                    })
                                } else if (user && entry.librarySimilarity == 0 && docs[index].semanticScholarDocument && docs[index].semanticScholarDocument.embedding && docs[index].semanticScholarDocument.embedding.length > 0) {
                                    // the attached semantic scholar document already has an embedding
                                    entry.librarySimilarity = librarySimilarity(docs[index].semanticScholarDocument.embedding, user)
                                    console.log(entry.librarySimilarity + " " + entry.title)
                                    addNode();
                                } else if (entry.librarySimilarity == 0 && user && docs[index].identifiers.paperId) {
                                    // we have no embedding of this doc, so we need to calculate it
                                    docsToEmbed.push(entry)
                                    addNode();
                                } else {
                                    addNode();
                                }
                            })
                    } else {
                        addNode();
                    }
                } else {
                    addNode();
                }
                function addNode() {
                    // TODO: avoid duplicates, don't add node if there already is a node with the same identifiers.paperId
                    nodes[index] = entry
                    resolve()
                }
            }))
        };
        Promise.all(promises).then(() => {
            // embed unembedded docs if there are any and resolve final nodes array
            var data = {};
            docsToEmbed.forEach(doc => {
                data[doc.identifiers.paperId] = { "title": doc.title ? doc.title : "", "abstract": doc.abstract ? doc.abstract : "", "paper_id": doc.identifiers.paperId }
            });
            if (Object.keys(data).length > 0) {
                axios.post(config.specter.serverurl + "?priority=1", data).then((res) => {
                    res.data.forEach(r => {
                        var jr = JSON.parse(r)
                        var n = nodes.find(n => n.identifiers.paperId == jr.paper_id)
                        n.librarySimilarity = librarySimilarity(jr.embedding, user)
                        console.log(n.librarySimilarity + " " + n.title)
                    });
                }).finally(() => { resolve(nodes) })
            } else { resolve(nodes); }
        })
    })

    // returns the similarity to the user's library cluster with the highest similarity
    function librarySimilarity(embedding, user) {
        var clusters = user.library_clusters;
        var librarySimilarity = 0;
        clusters.forEach(cluster => {
            let sim = cosinesim(embedding, cluster.centroid)
            librarySimilarity = Math.max(sim, librarySimilarity)
        });
        return librarySimilarity;
    }

    // cosine similarity between two vectors A and B
    function cosinesim(A, B) {
        var dotproduct = 0;
        var mA = 0;
        var mB = 0;
        for (i = 0; i < A.length; i++) {
            dotproduct += (A[i] * B[i]);
            mA += (A[i] * A[i]);
            mB += (B[i] * B[i]);
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        var similarity = (dotproduct) / ((mA) * (mB))
        return similarity;
    }
}
exports.getNodes = getNodes;

getLinks = async (nodes) => {
    return new Promise(async function (resolve, reject) {
        console.log("LINKS")
        resolve()
    })
}
module.exports.getLinks = getLinks;
