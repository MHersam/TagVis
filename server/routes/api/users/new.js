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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// create a new tagvis user account
router.post('/', (req, res) => {
    User.findOne({ 'tagvis.username': req.body.username }).then((u) => {
        if (u == null) {
            const user = new User();
            user.display_name = req.body.display_name;
            user.photo = req.body.photo;
            //user.tagvis.hashed_password = req.body.password;
            user.tagvis.username = req.body.username;
            user.created = Date.now();
            user.account_type = "TagVis"
            user.settings = {
                dark_theme: false,
                multi_expand: false,
                number_of_table_rows: "10",
                png_resolution_scale: "2",
                node_size_citation_count: true,
                add_semantic_scholar_topics_to_graphs: true,
                default_graph_type: "Tags"
            }
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                user.tagvis.hashed_password = hash
                /** This is what ends up in our JWT */
                const auth_token_payload = {
                    username: user.tagvis.username,
                    expires: Date.now() + 3600 * 1000,
                };
                /** This is what ends up in our JWT */
                const refresh_token_payload = {
                    username: user.tagvis.username,
                };

                /** generate a signed json web token and return it in the response */
                const auth_token = jwt.sign(JSON.stringify(auth_token_payload), config.tagvis.secret);
                const refresh_token = jwt.sign(JSON.stringify(refresh_token_payload), config.tagvis.secret);
                user.auth_token = auth_token
                user.refresh_token = refresh_token
                user.auth_token_expires = auth_token_payload.expires
                //user.mendeley = null;
                /** assign our jwt to the cookie */
                //res.cookie('jwt', jwt, { httpOnly: true, secure: true });
                user.save().then((u) => {
                    u.tagvis.hashed_password = null
                    u.photo = req.protocol + "://" + req.get('host') + '/api/users/photo?userid=' + u._id;
                    res.send(u)
                }).catch(function (error) {
                    console.log(error);
                    res.sendStatus(401)
                });
            });
        } else {
            res.status(403).send("Username already exists")
        }
    })

})
module.exports = router;
