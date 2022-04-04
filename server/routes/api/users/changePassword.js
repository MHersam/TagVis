var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const User = require('../../../models/user.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// change password of a tagvis user
router.post('/', (req, res) => {
    console.log(req.body)
    User.findOne({ auth_token: req.body.auth_token }).then((u) => {
        bcrypt.compare(req.body.current_password, u.tagvis.hashed_password, function (err, result) {
            console.log(result)
            if (result) {
                bcrypt.hash(req.body.new_password, saltRounds, function (err, hash) {
                    u.tagvis.hashed_password = hash
                    u.save().then(() => {
                        res.sendStatus(200)
                    })
                })
            } else {
                res.sendStatus(401)
            }
        })
    }).catch((err) => {
        console.log(err)
        res.sendStatus(404)
    })
})
module.exports = router;
