var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const semanticScholarDocumentService = require('../../../services/semantic_scholar_document.js')

// lookup a paper on semantic scholar. returns the DB document without citations and references!
router.get('/', (req, res) => {
    semanticScholarDocumentService.findAndSave(JSON.parse(req.headers.document)).then(r => {
        r.citations = null;
        r.references = null;
        res.send(r)
    }).catch(err => {
        console.log(err)
        res.sendStatus(404)
    })
})
module.exports = router;
