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

// join a group
router.patch('/', (req, res) => {
    console.log(req.body)
    Group.findOne({ _id: req.body.id }).then((group) => {
        if (group.members.includes(req.body.user)) {
            res.sendStatus(403)
        } else {
            group.members.push(req.body.user)
            group.save().then(() => {
                res.sendStatus(200);
            }).catch(err => {
                res.sendStatus(err)
            });
        }
    })
})
module.exports = router;
