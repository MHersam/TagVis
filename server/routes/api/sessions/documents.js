var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Session = require('../../../models/session.js');
const Document = require('../../../models/document.js');

// get the documents that were included in a session
router.get('/', (req, res) => {
    if (req.headers.id != '') {
        Session.findOne({ _id: req.headers.id }).then((session) => {
            var documents = []
            session.graph.nodes.forEach(node => {
                node.id ? documents.push(mongoose.Types.ObjectId(node.id)) : null
            });
            Document.find({
                '_id': {
                    $in: documents
                }
            }).then(docs => {
                res.send(docs)
            })
        }).catch(err => {
            res.send(err)
        });
    } else {
        res.sendStatus(404)
    }

})
module.exports = router;
