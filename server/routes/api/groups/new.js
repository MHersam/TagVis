var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Group = require('../../../models/group.js');
const User = require('../../../models/user.js');

// create new group
router.post('/', (req, res) => {
    const group = new Group(req.body);
    group.created = Date.now();
    group.last_modified = Date.now();
    group.numberOfDocuments = 0;
    group.save().then((d1) => {
        console.log(d1._id)
        res.send(d1)
    }).catch(function (error) {
        console.log(error);
        sendStatus(500)
    });
})
module.exports = router;
