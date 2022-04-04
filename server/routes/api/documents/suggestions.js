var router = require('express').Router();
const axios = require('axios');
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Documents = require('../../../models/document.js');
const User = require('../../../models/user.js');
const semanticScholarDocumentService = require('../../../services/semantic_scholar_document.js')

// get tag suggestions for a paper
router.get('/', (req, res) => {
    Documents.findById(req.headers.id).populate({ path: "semantic_scholar_document", model: 'Semantic_Scholar_Document' }).then(doc => {
        var suggestions = doc.keywords ? doc.keywords : [];
        if (doc.semantic_scholar_document) {
            doc.semantic_scholar_document.topics.forEach(t => {
                suggestions.push(t.topic)
            });
            res.send([...new Set(suggestions)])
        } else {
            //try to get semantic scholar document
            semanticScholarDocumentService.findAndSave(doc).then(d => {
                d.topics.forEach(t => {
                    suggestions.push(t.topic)
                })
                res.send([...new Set(suggestions)])
            }).catch(err => {
                // send only keywords
                res.send([...new Set(suggestions)])
            })
        }
    }).catch(err => {
        console.log(err)
        res.sendStatus(404)
    })
})
module.exports = router;
