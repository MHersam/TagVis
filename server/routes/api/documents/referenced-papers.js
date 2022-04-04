var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const SemanticScholarDocument = require('../../../models/semantic_scholar_document.js');

// returns an array with the given semantic_scholar_document and all referenced papers in document notation
router.get('/', (req, res) => {
    console.log(req.headers._id)
    SemanticScholarDocument.findOne({ _id: req.headers._id }).then(ssd => {
        var docs = []
        docs.push(ssd)
        docs = docs.concat(ssd.references)
        var documents = [];
        docs.forEach(doc => {
            var d = {}
            d.title = doc.title;
            d.source = doc.venue;
            d.year = doc.year;
            d.user = { display_name: "Referenced Papers", photo: null, _id: -1 }
            d.authors = []
            d.authorsString = ""
            doc.authors.forEach((author) => {
                d.authorsString = d.authorsString.concat(author.name + ", ");
                var arr = author.name.split(" ");
                var firstName = arr[0];
                for (var i = 1; i < arr.length - 1; i++) {
                    firstName = firstName.concat(" " + arr[i]);
                }
                d.authors.push({
                    first_name: firstName,
                    last_name: arr[arr.length - 1],
                });
            });
            if (d.authorsString.length > 0) d.authorsString = d.authorsString.substring(0, d.authorsString.length - 2);
            d.identifiers = {}
            if (doc.doi) {
                d.identifiers.doi = doc.doi;
            }
            if (doc.arxiv) {
                d.identifiers.arxiv = doc.arxiv;
            }
            if (doc.paperId) {
                d.identifiers.paperId = doc.paperId;
            }
            documents.push(d)
        });
        documents[0].user = { display_name: "Seed Paper", photo: null, _id: -2 }
        res.send(documents)
    })
})
module.exports = router;
