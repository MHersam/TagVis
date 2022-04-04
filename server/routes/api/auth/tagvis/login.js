var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const User = require('../../../../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// login for tagvis users
router.post('/', (req, res) => {
    User.findOne({ 'tagvis.username': req.body.username }, {library_embedding: 0, library_clusters: 0, library_ranked_recommendations: 0, library_recommendation_blacklist: 0}).then(u => {
        if (u == null) {
            res.sendStatus(401)
        } else {
            bcrypt.compare(req.body.password, u.tagvis.hashed_password, function (err, result) {
                if (result) {
                    /** This is what ends up in our JWT */
                    const payload = {
                        username: u.tagvis.username,
                        expires: Date.now() + 3600 * 1000,
                    };
                    /** generate a signed json web token and return it in the response */
                    const token = jwt.sign(JSON.stringify(payload), config.tagvis.secret);
                    u.auth_token = token;
                    u.auth_token_expires = payload.expires;
                    u.save().then((u) => {
                        u.tagvis.hashed_password = null;
                        u.photo = req.protocol + "://" + req.get('host') + '/api/users/photo?userid=' + u._id;
                        res.send(u)
                    })
                } else {
                    res.sendStatus(401)
                }
            });
        }
    })

})
module.exports = router;