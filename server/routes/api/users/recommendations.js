var router = require('express').Router()
var express = require('express')
router.use(express.json({ limit: '50mb' }));
const config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const User = require('../../../models/user.js');
const SemanticScholarDocument = require('../../../models/semantic_scholar_document.js');

// get a page from a user's recommendation list
router.get('/', (req, res) => {
    var paperIds = []
    var result = null
    User.findOne({ _id: req.headers.user_id }, { "library_ranked_recommendations.list": 1 }).select({ 'library_ranked_recommendations.list': { '$slice': [Number(req.query.page) * Number(req.query.limit), Number(req.query.limit)] } }).then(user => {
        paperIds = user.library_ranked_recommendations.list.map(r => r.paperId)
        SemanticScholarDocument.find({ paperId: paperIds }, { embedding: 0 }).then(ssds => {
            result = { numberOfPages: Math.ceil(user.library_ranked_recommendations.length / req.query.limit), recommendations: ssds }
            res.send(result)
        }).catch(err => { console.log(err); res.sendStatus(404) })
    }).catch(err => { console.log(err); res.sendStatus(404) })
});

// remove a given item from a user's recommendation list (if it's included) and add it to the user's blacklist
router.post('/blacklist', async (req, res) => {
    User.findOne({ _id: req.body.user_id }, { library_ranked_recommendations: 1, library_recommendation_blacklist: 1 }).then((user) => {
        var paperIds = user.library_ranked_recommendations.list.map(d => d.paperId)
        req.body.documents.forEach(doc => {
            var index = paperIds.indexOf(doc.paperId)
            user.library_ranked_recommendations.list.splice(index, 1)
            user.library_ranked_recommendations.length--
            user.library_recommendation_blacklist.push({ paperId: doc.paperId })
        });
        user.save().then(() => { res.sendStatus(200) })
    }).catch(err => res.sendStatus(404))
});

// get the papers from the users recommendation list, that match the given documents best
router.post('/selection', (req, res) => {
    console.log(req.query.limit)
    console.log(req.body.data)
    var embeddings = [];
    var selectionEmbedding = [];
    var paperIds = [];
    req.body.data.documents.forEach(doc => {
        if (doc.identifiers && doc.identifiers.paperId) paperIds.push(doc.identifiers.paperId)
    });
    SemanticScholarDocument.find({ 'paperId': { $in: paperIds } }, { embedding: 1 }).then((ssds) => {
        ssds.forEach(ssd => {
            if (ssd.embedding) embeddings.push(ssd.embedding)
        });
        if (embeddings.length > 0) {
            //calculate the combined embedding of the given documents by adding up the individual embeddings and then dividing by the vector magnitude
            selectionEmbedding = embeddings[0];
            // add all document embeddings up
            for (let i = 1; i < embeddings.length; i++) {
                for (let j = 0; j < selectionEmbedding.length; j++) {
                    selectionEmbedding[j] += embeddings[i][j];
                }
            }
            selectionEmbedding = normalizeVector(selectionEmbedding);
            User.findOne({ _id: req.body.data.user_id }, {
                "library_ranked_recommendations.list": 1
            }).then(user => {
                var paperIds = user.library_ranked_recommendations.list.map(d => d.paperId)
                console.log(paperIds.length)
                var recommendations = []
                SemanticScholarDocument.find({ 'paperId': { $in: paperIds } }, { paperId: 1, embedding: 1, year: 1, citationCount: 1 }).then((ssds) => {
                    ssds.forEach(ssd => {
                        var similarityScore = cosinesim(selectionEmbedding, ssd.embedding);
                        var ageInYears = ssd.year ? Math.min(new Date().getFullYear() - ssd.year, 10) : 10
                        var recencyScore = 1 - ageInYears / 10
                        var impactScore = Math.min(Math.log10(ssd.citationCount + 1), 4) / 4;
                        var relevance = similarityScore * 0.8 + recencyScore * 0.1 + impactScore * 0.1;
                        recommendations.push({ similarity: relevance, paperId: ssd.paperId })
                    });
                    //sort descending by similarity
                    recommendations.sort(function (a, b) { return (a.similarity < b.similarity) ? 1 : ((b.similarity < a.similarity) ? -1 : 0); })
                    var topRecommendations = recommendations.slice(0, req.query.limit)
                    console.log(topRecommendations)
                    SemanticScholarDocument.find({ 'paperId': { $in: topRecommendations.map(d => d.paperId) } }, { embedding: 0, citations: 0, references: 0 }).then((ssds) => {
                        res.send(ssds);
                    })
                })
            })

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
        } else {
            // no embeddings available for this selection of papers, default to the user's recommendation list
            User.findOne({ _id: req.body.data.user_id }, { "library_ranked_recommendations.list": 1 }).select({ 'library_ranked_recommendations.list': { '$slice': [0, Number(req.query.limit)] } }).then(user => {
                paperIds = user.library_ranked_recommendations.list.map(r => r.paperId)
                SemanticScholarDocument.find({ paperId: paperIds }, { embedding: 0 }).then(ssds => {
                    res.send(ssds)
                }).catch(err => { console.log(err); res.sendStatus(404) })
            }).catch(err => { console.log(err); res.sendStatus(404) })
        }
    })
});
module.exports = router;
