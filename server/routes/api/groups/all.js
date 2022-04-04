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

// get all groups of a user
router.get('/', (req, res) => {
    if (req.headers.user != '') {
        Group.find({ members: req.headers.user }, { documents: 0 }).populate('members', 'photo display_name account_type').then((groups) => {
            groups.sort(function (a, b) {
                return new Date(b.last_modified) - new Date(a.last_modified);
            });
            groups.forEach(group => {
                group.members.forEach(member => {
                    if (member.account_type != "Mendeley") {
                        member.photo = (req.protocol + "://" + req.get('host') + '/api/users/photo?userid=' + member._id);
                    }
                });
            });
            res.send(groups)
        }).catch(err => {
            res.send(err)
        });
    } else {
        res.sendStatus(404)
    }

})
module.exports = router;
