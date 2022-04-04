var qs = require('querystring')
const axios = require('axios');
const bodyParser = require("body-parser");
//const MendeleyUser = require('../../models/mendeley_user.ts');
var router = require('express').Router()
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const User = require('../../../models/user.js');
const jwt = require('jsonwebtoken');

// POST refresh the auth token of a mendeley or tagvis user
router.post('/', (req, res) => {
    User.findOne({ refresh_token: req.body.refresh_token }, { library_embedding: 0, library_clusters: 0, library_ranked_recommendations: 0, library_recommendation_blacklist: 0 }).then(u => {
        if (u == null) {
            res.sendStatus(401);
        } else {
            switch (u.account_type) {
                case "TagVis":
                    tagVisRenew(u)
                    break;
                case "Mendeley":
                    mendeleyRenew()
                    break;
                case "Zotero":
                    sendUserData(u)
                    break;
                default:
                    res.sendStatus(404)
                    break;
            }
        }
    })
    //get access_token from mendeley
    function mendeleyRenew() {
        axios.post('https://api.mendeley.com/oauth/token',
            qs.stringify({
                client_id: config.mendeley.clientid,
                client_secret: config.mendeley.clientsecret,
                grant_type: 'refresh_token',
                refresh_token: req.body.refresh_token,
                redirect_uri: config.mendeley.redirecturi
            })).then(function (res1) {
                console.log(res1.data);
                var expires = new Date();
                expires.setMinutes(expires.getMinutes() + 60);
                User.findOneAndUpdate({ refresh_token: res1.data.refresh_token }, { auth_token: res1.data.access_token, auth_token_expires: expires, refresh_token: res1.data.refresh_token }, { fields: { library_embedding: 0, library_clusters: 0, library_ranked_recommendations: 0, library_recommendation_blacklist: 0 } }).then(() => {
                    axios.get('https://api.mendeley.com/profiles/me', {
                        headers: {
                            Authorization: 'Bearer ' + res1.data.access_token
                        }
                    }).then(function (res2) {
                        User.findOneAndUpdate({ refresh_token: res1.data.refresh_token }, { mendeley: res2.data, photo: res2.data.photos[0].url, display_name: res2.data.display_name }, {
                            new: true, fields: { library_embedding: 0, library_clusters: 0, library_ranked_recommendations: 0, library_recommendation_blacklist: 0 }
                        }).then((u) => {
                            res.send(u)
                        })
                    }).catch(function (error) {
                        console.log(error);
                        res.send(error);
                    })
                })
            }).catch(function (error) {
                console.log(error);
                res.sendStatus(401)
                //res.send(error)
            });
    }
    function tagVisRenew(u) {
        const auth_token_payload = {
            username: u.tagvis.username,
            expires: Date.now() + 3600 * 1000,
        };
        /** generate a signed json web token and return it in the response */
        const auth_token = jwt.sign(JSON.stringify(auth_token_payload), config.tagvis.secret);
        u.auth_token = auth_token;
        u.auth_token_expires = auth_token_payload.expires
        u.save().then((u) => {
            u.tagvis.hashed_password = null;
            u.photo = req.protocol + "://" + req.get('host') + '/api/users/photo?userid=' + u._id;
            res.send(u)
        })
    }
    function sendUserData(u) {
        res.send(u)
    }
})
module.exports = router;