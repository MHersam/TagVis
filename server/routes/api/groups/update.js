var router = require('express').Router();
var express = require('express')
const axios = require('axios');
const bodyParser = require("body-parser");
router.use(express.json({ limit: '50mb' }));;
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Group = require('../../../models/group.js');
const User = require('../../../models/user.js');

// update title and description of a group
router.patch('/', (req, res) => {
    var group = JSON.parse(req.body.group)
    Group.findOneAndUpdate({ _id: group._id }, { name: group.name, description: group.description, last_modified: new Date() }).then(() => {
        res.sendStatus(200)
    }).catch((err) => {
        console.log(err)
        res.sendStatus(404)
    })
})
module.exports = router;
