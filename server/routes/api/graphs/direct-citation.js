var router = require('express').Router()
var express = require('express')
router.use(express.json({ limit: '50mb' }));
const config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const graphService = require('../../../services/graphs.js');

// generate a graph based on direct citation
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

    // compute links
    var links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const ssdi = documents[i].semanticScholarDocument;
            const ssdj = documents[j].semanticScholarDocument;
            if (ssdi && ssdj) {
                var BreakException = {};
                try {
                    ssdi.references.forEach(reference => {
                        if (reference.paperId == ssdj.paperId) {
                            var entry = {};
                            entry.source = i;
                            entry.target = j;
                            entry.id = "l" + count;
                            //entry.correspondenceRatio = reference.isInfluential ? 1 : 0.5;
                            entry.correspondenceRatio = 1;
                            entry.distance = reference.isInfluential ? 25 : 50;
                            links.push(entry)
                            count++;
                            throw BreakException;
                        }
                    });
                    ssdj.references.forEach(reference => {
                        if (reference.paperId == ssdi.paperId) {
                            var entry = {};
                            entry.source = j;
                            entry.target = i;
                            entry.id = "l" + count;
                            //entry.correspondenceRatio = reference.isInfluential ? 1 : 0.5;
                            entry.correspondenceRatio = 1;
                            entry.distance = reference.isInfluential ? 25 : 50;
                            links.push(entry)
                            count++;
                            throw BreakException;
                        }
                    });
                } catch (error) {
                    if (error !== BreakException) throw error;
                }
            }
        }
    }
    output.links = links;
    output.nodes = nodes;
    output.directed = false;
    output.multigraph = false;
    res.send(JSON.stringify(output))
})
module.exports = router;
