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
const User = require('../../../models/user.js');


// create a new session
router.post('/', (req, res) => {
    const session = new Session(req.body);
    session.created = Date.now()
    session.save().then((d1) => {
        console.log(d1._id)
        res.send({sessionID: d1._id})
    }).catch(function (error) {
        console.log(error);
        sendStatus(500)
    });
})
module.exports = router;
