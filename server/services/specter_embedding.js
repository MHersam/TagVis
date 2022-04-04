const axios = require('axios');
const config = require('../../config.json');
const Documents = require('../models/document.js');
const SemanticScholarDocument = require('../models/semantic_scholar_document');
const SemanticScholarDocuments = require('../models/semantic_scholar_document');
const Users = require('../models/user.js');
const meanShiftService = require('../services/mean_shift.js')
const semanticScholarDocumentService = require('../services/semantic_scholar_document')


embedDocuments = (dbDocs) => {
    var data = {}
    dbDocs.forEach(doc => {
        data[doc._id] = { "title": doc.title, "abstract": doc.abstract, "paper_id": doc._id }
    });
    axios.post(config.specter.serverurl + "?priority=2", data).then((res) => {
        var promises = [];
        res.data.forEach(r => {
            var jr = JSON.parse(r)
            promises.push(Documents.findOneAndUpdate({ _id: jr.paper_id }, { embedding: jr.embedding }, { new: true }).then().catch(err => console.log(err)))
        });
        console.log(res.data.length)
        //update library embedding of the user
        Promise.allSettled(promises).then(() => {
            // assumes all docs belong to the same user
            if (dbDocs.length > 0) {
                Users.findOne({ _id: dbDocs[0].user }).then(u => {
                    updateLibraryEmbeddingAndClusters(u)
                })
            }
        })
    }).catch(err => {
        console.log(err)
    })
}
exports.embedDocuments = embedDocuments;

embedCitedAndReferencedDocuments = (dbDocs) => {
    return new Promise((resolve, reject) => {
        var promises = [];
        dbDocs.forEach(doc => {
            promises.push(semanticScholarDocumentService.findAndSave(doc))
        });
        var SSDs = [];
        Promise.allSettled(promises).then(async res => {
            res.forEach(promise => {
                if (promise.status == 'fulfilled') SSDs.push(promise.value)
            });
            promises = [];
            var docsToEmbed = [];

            SSDs.forEach(SSD => {
                docsToEmbed.push({ title: SSD.title, abstract: SSD.abstract, paperId: SSD.paperId })
                promises.push(semanticScholarDocumentService.getCitationsOrReferences(SSD.paperId, "citations").then(r => docsToEmbed = docsToEmbed.concat(r)))
                promises.push(semanticScholarDocumentService.getCitationsOrReferences(SSD.paperId, "references").then(r => docsToEmbed = docsToEmbed.concat(r)))
            })
            Promise.allSettled(promises).then(async () => {
                promises = [];
                var chunkedData = [];
                //remove duplicates
                docsToEmbed = docsToEmbed.filter((v, i, a) => a.findIndex(t => (t.paperId === v.paperId)) === i)

                //remove docs where we already got the embedding
                var minDocsToEmbed = JSON.parse(JSON.stringify(docsToEmbed))
                for (let i = 0; i < docsToEmbed.length; i = i + 5000) {
                    var ssds = await SemanticScholarDocument.find({
                        'paperId': { $in: docsToEmbed.slice(i, i + 5000).map(d => d.paperId) }
                    }, { paperId: 1, embedding: 1 });
                    ssds.forEach(ssd => {
                        if (ssd.embedding && ssd.embedding.length > 0) {
                            minDocsToEmbed = minDocsToEmbed.filter(d => d.paperId != ssd.paperId)
                        }
                    });
                }
                console.log("Embedding " + minDocsToEmbed.length + " cited or referenced docs")
                docsToEmbed = minDocsToEmbed
                var chunkIndex = -1;
                // 5000 was tested and worked too, but smaller chunk size results in shorter response times for requests with higher priority
                const chunkSize = 200;
                for (let i = 0; i < docsToEmbed.length; i++) {
                    if ((i % (chunkSize - 1)) == 0) {
                        chunkedData.push({})
                        chunkIndex++;
                    }
                    chunkedData[chunkIndex][docsToEmbed[i].paperId] = { "title": docsToEmbed[i].title, "abstract": docsToEmbed[i].abstract, "paper_id": docsToEmbed[i].paperId }
                }

                for (let i = 0; i < chunkedData.length; i++) {
                    promises.push(new Promise((resolve, reject) => {
                        axios.post(config.specter.serverurl + "?priority=3", chunkedData[i]).then((res) => {
                            docsToSave = [];
                            res.data.forEach(r => {
                                var jr = JSON.parse(r)
                                var ssd = docsToEmbed.find(d => d.paperId == jr.paper_id)
                                ssd.embedding = jr.embedding
                                docsToSave.push(ssd)
                            });
                            SemanticScholarDocuments.bulkWrite(
                                docsToSave.map((doc) =>
                                ({
                                    updateOne: {
                                        filter: { paperId: doc.paperId },
                                        update: { $set: doc },
                                        upsert: true
                                    }
                                })
                                )
                            ).then(() => { resolve(); }).catch(err => { console.log(err); reject(); })
                        }).catch(err => { console.log(err); reject() })
                    }))
                }
                Promise.allSettled(promises).then(() => { resolve(); })
            })
        })
    })
}
exports.embedCitedAndReferencedDocument = embedCitedAndReferencedDocuments;

updateLibraryEmbeddingAndClusters = (user) => {
    return new Promise((resolve, reject) => {
        Documents.find({ user: user._id }, { embedding: 1 }).then(docs => {

            var libraryEmbedding = [];
            var clusters = [];

            if (docs.length > 0) {
                //calculate library embedding
                libraryEmbedding = JSON.parse(JSON.stringify(docs[0].embedding));
                // add all document embeddings up
                for (let i = 1; i < docs.length; i++) {
                    for (let j = 0; j < libraryEmbedding.length; j++) {
                        libraryEmbedding[j] += docs[i].embedding[j];
                    }
                }
                // normalize library embedding
                libraryEmbedding = normalizeVector(libraryEmbedding);

                //cluster user library with mean shift algorithm
                var ms = new meanShiftService
                var vectors = [];
                docs.forEach(doc => {
                    if (doc.embedding && doc.embedding.length > 0) {
                        vectors.push(doc.embedding)
                    }
                });
                // the second parameter is the kernel bandwidth, a higher number results in fewer, but more general clusters. This number can be tweaked to adjust cluster sizes.
                var results = ms.cluster(vectors, 4.2, null)
                // number of docs in each cluster by cluster id
                const counts = {};
                for (const num of results.clusterIndices) {
                    counts[num] = counts[num] ? counts[num] + 1 : 1;
                }

                for (let i = 0; i <= Math.max(...results.clusterIndices); i++) {
                    var cluster = {};
                    //let index = results.clusterIndices.indexOf(i);
                    cluster.id = i;
                    cluster.numberOfDocuments = counts[i];
                    cluster.documents = [];

                    //indices of the documents contained in this cluster in the result arrays (originalPoints, shiftedPoints, clusterIndices)
                    var indices = [];
                    var idx = results.clusterIndices.indexOf(i);
                    while (idx != -1) {
                        indices.push(idx);
                        idx = results.clusterIndices.indexOf(i, idx + 1);
                    }

                    //calculate centroid of each cluster
                    for (let j = 0; j < counts[i]; j++) {
                        if (j == 0) {
                            cluster.centroid = results.originalPoints[indices[0]]
                        } else {
                            for (let k = 0; k < cluster.centroid.length; k++) {
                                cluster.centroid[k] += results.originalPoints[indices[j]][k]
                            }
                        }
                        // add document id to documents array of the cluster
                        cluster.documents.push(docs[indices[j]])
                    }
                    //normalize centroid
                    cluster.centroid = normalizeVector(cluster.centroid)

                    clusters.push(cluster)
                }

                function normalizeVector(vector) {
                    var magnitude = 0;
                    vector.forEach(entry => {
                        magnitude += Math.pow(entry, 2);
                    });
                    magnitude = Math.sqrt(magnitude);
                    for (let i = 0; i < vector.length; i++) {
                        vector[i] = vector[i] / magnitude;
                    }
                    return vector
                }
            }
            // save library embedding and clusters to user
            Users.findOneAndUpdate({ _id: user._id }, { library_embedding: libraryEmbedding, library_clusters: clusters }).then(() => { console.log("clusters and embedding updated"); resolve() }).catch(err => console.log(err))
        })
    })
}
exports.updateLibraryEmbeddingAndClusters = updateLibraryEmbeddingAndClusters;