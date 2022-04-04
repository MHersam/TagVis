const SemanticScholarDocument = require('../models/semantic_scholar_document.js');
const Documents = require('../models/document.js');
const config = require('../../config.json');
const APIkey = config.semanticscholar.apikey
const axios = require('axios')
var Bottleneck = require('bottleneck');
const limiter = new Bottleneck({
    minTime: 10,
    maxConcurrent: 100
});
const refreshInterval = parseInt(config.semanticscholar.refreshinterval);

// Lookup a document on Semantic Scholar and save it to DB, returns the Semantic Scholar document
findAndSave = (document) => {
    return new Promise(function (resolve, reject) {
        var identifier = '';
        if (document.identifiers) {
            var identifiers = Object.keys(document.identifiers)
            for (var i = 0; i < identifiers.length; i++) {
                if (identifiers[i] == "doi" && document.identifiers.doi) {
                    identifier = encodeURI(document.identifiers.doi);
                } else if (identifiers[i] == "arxiv" && document.identifiers.arxiv) {
                    identifier = "arXiv:" + document.identifiers.arxiv;
                } else if (identifiers[i] == "pmid" && document.identifiers.pmid) {
                    identifier = "PMID:" + document.identifiers.pmid;
                } else if (identifiers[i] == "acl" && document.identifiers.acl) {
                    identifier = "ACL:" + document.identifiers.acl;
                } else if (identifiers[i] == "mag" && document.identifiers.mag) {
                    identifier = "MAG:" + document.identifiers.mag;
                } else if (identifiers[i] == "paperId" && document.identifiers.paperId) {
                    identifier = document.identifiers.paperId;
                }

                if (identifier != '') { break; }
            }
        }
        if (identifier != '') {
            limiter.schedule(() => requestDoc()).then(function (response) {
                var update = response.data;
                update.accessed = Date.now()
                update.citationCount = response.data.numCitedBy
                SemanticScholarDocument.findOneAndUpdate({ paperId: response.data.paperId }, update, { upsert: true, new: true }).then(ssd => {
                    if (document._id) {
                        Documents.findOneAndUpdate({ _id: document._id }, { semantic_scholar_document: ssd._id }).then(() => {
                            resolve(ssd)
                        })
                    } else {
                        resolve(ssd)
                    }
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            }).catch(err => {
                console.log(err)
                reject()
            })
            function requestDoc() {
                return axios.get('https://partner.semanticscholar.org/v1/paper/' + identifier, {
                    headers: {
                        'x-api-key': APIkey
                    }
                })
            }
        } else {
            reject()
        }
    })
}
exports.findAndSave = findAndSave;

//get detailed information about a paper's citations or references. The paper is specified by paperId
// method needs to be "citations" or "references"
getCitationsOrReferences = (paperId, method) => {
    return new Promise(async (resolve, reject) => {
        var offset = 0;
        var hasNext = true;
        var SSDs = [];
        while (hasNext) {
            await limiter.schedule(() => request()).then(res => {
                if (res.data.next) { offset = res.data.next } else { hasNext = false }
                res.data.data.forEach(entry => {
                    if (method == "citations" && entry.citingPaper.paperId) {
                        SSDs.push(entry.citingPaper)
                    } else if (method == "references" && entry.citedPaper.paperId) {
                        SSDs.push(entry.citedPaper)
                    }
                });
            });
            if (!hasNext) resolve(SSDs)
        }
        function request() {
            return axios.get('https://api.semanticscholar.org/graph/v1/paper/' + paperId + "/" + method + "?fields=citationCount,title,abstract,venue,year,authors&offset=" + offset + "&limit=1000", {
                headers: {
                    'x-api-key': config.semanticscholar.apikey
                }
            })
        }
    })
}
exports.getCitationsOrReferences = getCitationsOrReferences;

getSemanticScholarDocument = (id, document) => {
    return new Promise((resolve, reject) => {
        //console.log(document._id)
        if (document._id) {
            Documents.findById(document._id).then((doc) => {
                //console.log(doc)
                if (doc.semantic_scholar_document) {
                    SemanticScholarDocument.findOne({ _id: doc.semantic_scholar_document }).then((ssd) => {
                        console.log(ssd.accessed)
                        //if found doc older than defined in config request a new one
                        if (!ssd.accessed || new Date(ssd.accessed) < (Date.now() - refreshInterval)) {
                            console.log("request new one")
                            requestAndUpdate(id, doc).then((d) => { resolve(d) }).catch((err) => { reject(err) })
                        } else {
                            console.log("keeping old one")
                            resolve(ssd)
                        }

                    }).catch((err) => {
                        requestSemanticScholarDocumment(id, doc).then((d) => { resolve(d) }).catch((err) => { reject(err) })
                    })


                } else {
                    findSemanticScholarDocumentInDbByIdentifier(id, doc).then(ssd => { resolve(ssd) }).catch(err => {
                        requestSemanticScholarDocumment(id, doc).then((ssd) => { resolve(ssd) }).catch((err) => { reject(err) })
                    })
                }
            }).catch((err) => {
                console.log(err)
                reject(err)
            })
        } else {
            findSemanticScholarDocumentInDbByIdentifier(id, document).then(ssd => { resolve(ssd) }).catch(err => {
                requestSemanticScholarDocumment(id, document).then((ssd) => { resolve(ssd) }).catch((err) => { reject(err) })
            })
        }
        function requestSemanticScholarDocumment(id, doc) {
            //return axios.get('https://partner.semanticscholar.org/v1/paper/' + id + '?include_unknown_references=true', {
            return axios.get('https://partner.semanticscholar.org/v1/paper/' + id, {
                headers: {
                    'x-api-key': APIkey
                }
            }).then(function (response) {
                SemanticScholarDocument.where({ paperId: response.data.paperId }).findOne(function (err, ssd) {
                    if (ssd == null) {
                        const ssdnew = new SemanticScholarDocument(response.data);
                        ssdnew.accessed = Date.now()
                        ssdnew.citationCount = response.data.numCitedBy
                        ssdnew.save().then((d1) => {
                            console.log('saved')
                            if (doc && doc._id) {
                                doc.semantic_scholar_document = d1._id;
                                doc.save()
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    } else {
                        if (doc && doc._id) {
                            doc.semantic_scholar_document = ssd._id;
                            doc.save()
                        }
                    }
                })
                resolve(response.data)
            }).catch(function (error) {
                reject(error);
            })
        }

        function requestAndUpdate(id, doc) {
            return new Promise((resolve, reject) => {
                //return axios.get('https://partner.semanticscholar.org/v1/paper/' + id + '?include_unknown_references=true', {
                axios.get('https://partner.semanticscholar.org/v1/paper/' + id, {
                    headers: {
                        'x-api-key': APIkey
                    }
                }).then(function (response) {
                    SemanticScholarDocument.findOne({ paperId: response.data.paperId }).then((ssd) => {
                        if (ssd == null) {
                            const ssdnew = new SemanticScholarDocument(response.data);
                            ssdnew.accessed = Date.now()
                            ssdnew.citationCount = response.data.numCitedBy
                            ssdnew.save().then((d1) => {
                                console.log('saved')
                                if (doc && doc._id) {
                                    doc.semantic_scholar_document = d1._id;
                                    doc.save()
                                }
                                resolve(d1)
                            }).catch(function (error) {
                                console.log(error);
                            });
                        } else {
                            if (doc && doc._id) {
                                doc.semantic_scholar_document = ssd._id;
                                doc.save()
                            }
                            var update = response.data;
                            update.accessed = Date.now();
                            update.citationCount = response.data.numCitedBy;
                            SemanticScholarDocument.findOneAndUpdate({ _id: ssd._id }, update, {
                                new: true
                            }).then(d => {
                                resolve(d)
                            })
                        }
                    })
                }).catch(function (error) {
                    console.log(error)
                    reject(error);
                })
            })
        }
        function findSemanticScholarDocumentInDbByIdentifier(id, doc) {
            return new Promise(async (resolve, reject) => {
                var foundSSD;
                if (doc.identifiers.paperId) {
                    await SemanticScholarDocument.findOne({ paperId: doc.identifiers.paperId }).then(ssd => { foundSSD = ssd }).catch(err => { console.log(err); reject(); })
                }
                // Probably not performant enough for doi and arxiv when they're not indexed. (O(n) instead of O(1) which becomes a serious issue when semantic_scholar_documents collection is large)
                /*
                else if (doc.identifiers.doi) {
                    await SemanticScholarDocument.findOne({ doi: doc.identifiers.doi }).then(ssd => { foundSSD = ssd }).catch(err => { console.log(err); reject(); })
                } else if (doc.identifiers.arxiv) {
                    await SemanticScholarDocument.findOne({ arxivId: doc.identifiers.arxiv }).then(ssd => { foundSSD = ssd }).catch(err => { console.log(err); reject(); })
                } 
                */
                else {
                    reject()
                }

                if (foundSSD != null) {
                    if (!foundSSD.accessed || new Date(foundSSD.accessed) < (Date.now() - refreshInterval)) {
                        console.log("request new one")
                        requestAndUpdate(id, doc).then((d) => { resolve(d) }).catch((err) => { reject(err) })
                    } else {
                        console.log("keeping old one")
                        resolve(foundSSD)
                    }
                } else {
                    reject()
                }
            })
        }
    })
}
exports.getSemanticScholarDocument = getSemanticScholarDocument;