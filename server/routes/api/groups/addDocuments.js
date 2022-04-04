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
const Document = require('../../../models/document.js');
const groupsService = require('../../../services/groups.js')

// add documents to a group
router.patch('/', (req, res) => {
    Group.findOne({ _id: req.body.id }).then((group) => {
        req.body.documents.forEach(doc => {
            group.documents.includes(doc) ? null : group.documents.push(doc)
        });
        group.last_modified = new Date();
        group.numberOfDocuments = group.documents.length
        group.save().then(() => {
            groupsService.updateTags(group._id).then(() => {
                res.sendStatus(200)
            })
        })
    }).catch(err => {
        res.sendStatus(err)
    });
})
module.exports = router;
