var router = require('express').Router();
var express = require('express')
const axios = require('axios');
const bodyParser = require("body-parser");
router.use(express.json({ limit: '50mb' }));;
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Session = require('../../../models/session.js');
const User = require('../../../models/user.js');

// update title and description of a saved session
router.patch('/', (req, res) => {
    var session = JSON.parse(req.body.session)
    Session.findOneAndUpdate({ _id: session._id }, { name: session.name, description: session.description }).then(() => {
        res.sendStatus(200)
    }).catch((err) => {
        console.log(err)
        res.sendStatus(404)
    })
})
module.exports = router;
