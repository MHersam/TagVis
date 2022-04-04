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

// get all sessions of a user
router.get('/', (req, res) => {
    if (req.headers.user != '') {
        Session.find({ user: req.headers.user }, { graph: 0 }).then((sessions) => {
            res.send(sessions.reverse());
        }).catch(err => {
            res.send(err)
        });
    } else {
        res.sendStatus(404)
    }

})
module.exports = router;
