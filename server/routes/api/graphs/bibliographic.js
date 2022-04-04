var router = require('express').Router()
var express = require('express')
router.use(express.json({ limit: '50mb' }));
const config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const workerpool = require('workerpool');
const pool = workerpool.pool(__dirname + '/workers/bibliographic.js');
const graphService = require('../../../services/graphs.js');

// generate a graph based on bibliographic correlations
router.post('/', async (req, res) => {
    var documents = JSON.parse(req.body.documents).docs;
    var output = {};
    output.type = req.body.type
    output.graph = [];

    //get graph nodes
    const nodes = await graphService.getNodes(documents, req.body.userId, req.body.addTopics)

    // calculate list of uniqe tags for tagPreferences panel in client vis view
    var uniqueTags = []
    for (var node of nodes) {
        if (node.tags) {
            for (var tag of node.tags) {
                if (!uniqueTags.includes(tag)) {
                    uniqueTags.push(tag)
                }
            }
        }
    }
    uniqueTags.sort()
    output.uniqueTags = uniqueTags;

    count = 0;
    // compute links concurrently with workers
    var links = [];
    var BreakException = {};
    var workerPromises = []
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const ssdi = documents[i].semanticScholarDocument;
            const ssdj = documents[j].semanticScholarDocument;
            if (ssdi && ssdi.references && ssdj && ssdj.references) {
                workerPromises.push(pool.exec('distance', [ssdi, ssdj, i, j]))
            }
        }
    }
    Promise.all(workerPromises).then((results) => {
        results.forEach(d => {
            if (d.dist >= 0) {
                var entry = {};
                entry.id = "l" + count;
                entry.source = d.i;
                entry.target = d.j;
                //entry.correspondenceRatio = (coCitationSimilarity+bibliographicCouplingSimilarity)/2;
                entry.correspondenceRatio = d.dist;
                entry.distance = 200 * (1 - entry.correspondenceRatio);
                //console.log("combined score: " + entry.correspondenceRatio + "; dist: " + entry.distance + "; citation strength: " + citationStrength + "; citation similarity: " + coCitationSimilarity + "; coupling strength: " + couplingStrength + "; coupling similarity: " + bibliographicCouplingSimilarity)
                //entry.correspondenceRatio > 0.5 ? links.push(entry) : null;
                links.push(entry)
                count++;
            }
        })
        links.sort(function (a, b) { return a.correspondenceRatio - b.correspondenceRatio })
        output.links = links;
        output.nodes = nodes;
        output.directed = false;
        output.multigraph = false;
        res.send(JSON.stringify(output))
    }).then(() => {
        pool.terminate()
    })
})
module.exports = router;
