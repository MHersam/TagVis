var router = require('express').Router();
const axios = require('axios');
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Session = require('../../../models/session.js');
const User = require('../../../models/user.js');

// remove binding of the session to the user
router.delete('/', (req, res) => {
    Session.findOneAndDelete({_id: req.headers.id}).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        res.sendStatus(404)
    });
})
module.exports = router;
