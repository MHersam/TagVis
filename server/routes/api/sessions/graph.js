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

// get the saved graph of a session
router.get('/', (req, res) => {
    Session.findOneAndUpdate({ _id: req.headers.id }, { $inc: { 'views': 1 } }).then((session) => {
        res.send({ graph: session.graph, tags: session.tags, active_lense: session.active_lense });
    }).catch(err => {
        res.send(err)
    });
})
module.exports = router;