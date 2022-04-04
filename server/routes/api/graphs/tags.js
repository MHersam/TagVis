var router = require('express').Router()
var express = require('express')
router.use(express.json({ limit: '50mb' }));
const config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const graphService = require('../../../services/graphs.js');

// generate a graph based on tags
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
            linkTags = [];
            nodes[i].tags.forEach(t1 => {
                if (nodes[j].tags.includes(t1)) {
                    linkTags.push(t1)
                }
            });
            if (linkTags.length > 0) {
                var entry = {};
                entry.id = "l" + count;
                entry.source = i;
                entry.target = j;
                entry.distance = 100;
                entry.tags = linkTags;

                tagUnion = new Set();
                nodes[i].tags.forEach(tagUnion.add, tagUnion)
                nodes[j].tags.forEach(tagUnion.add, tagUnion)

                entry.correspondenceRatio = linkTags.length / tagUnion.size;
                links.push(entry);
                count++;
            } else {
                //experimental
                /*
                var entry = {};
                entry.id = "l"+count;
                entry.source = i;
                entry.target = j;
                entry.distance = 400;
                entry.tags = [];
                entry.correspondenceRatio = 0;
                links.push(entry);
                count++;
                */
            }
        }
    }
    links.sort(function (a, b) { return a.correspondenceRatio - b.correspondenceRatio })

    output.links = links;
    output.nodes = nodes;
    output.directed = false;
    output.multigraph = false;
    res.send(JSON.stringify(output))
})
module.exports = router;
