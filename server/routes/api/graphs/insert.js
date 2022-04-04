var router = require('express').Router()
var express = require('express')
router.use(express.json({ limit: '50mb' }));
const config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const graphService = require('../../../services/graphs.js');
const axios = require('axios')

// insert given documents into a given graph
router.post('/', async (req, res) => {
    var newNodes = await graphService.getNodes(req.body.documents, req.body.user_id, req.body.add_topics)
    newNodes.forEach(node => {
        node.user = { _id: -3, display_name: "Inserted Papers" }
    });
    //TODO: it is possible here to only calculate the missing edges instead of calculating the entire graph from scratch. That would be more efficient
    var route = req.protocol + "://" + req.hostname + ":" + (process.env.PORT || 3000) + "/api/graphs/";
    switch (req.body.graph.type) {
        case "Tags":
            route += "tags";
            break;
        case "Bibliographic Correlations":
            route += "bibliographic";
            break;
        case "Direct Citation":
            route += "direct-citation";
            break;
    }
    var docs = req.body.graph.nodes.concat(newNodes)
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
    });
    axios
        .post(route, {
            type: req.body.graph.type,
            documents: JSON.stringify({ docs: docs }),
            addTopics: req.body.add_topics,
            userId: req.body.user_id,
        }).then(r => { console.log(r.data); res.send(r.data) }).catch(err => { console.log(err); res.send(err) })
    //console.log(graphService.getLinks(req.body.documents.concat(req.body.graph.nodes)))
    //req.body.graph.nodes = req.body.graph.nodes.concat(newNodes)
    //res.send(req.body.graph)
})
module.exports = router;