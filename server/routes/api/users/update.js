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

// update a user, used to update settings, display name, photo ... 
router.post('/', (req, res) => {
    console.log(req.body.user)
    User.findOneAndUpdate({ auth_token: req.body.user.auth_token }, req.body.user).then(() => {
        res.sendStatus(200)
    }).catch((err) => {
        console.log(err)
        res.sendStatus(404)
    })

})
module.exports = router;
