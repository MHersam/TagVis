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
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const ZOTERO_APP_CLIENT_KEY = config.zotero.clientkey;
const ZOTERO_APP_CLIENT_SECRET = config.zotero.clientsecret;
const oauth = OAuth({
    consumer: {
        key: ZOTERO_APP_CLIENT_KEY,
        secret: ZOTERO_APP_CLIENT_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
});

// Return url to client, where the user has to set the TagVis key in his Zotero account, so we can access the data
router.get('/redirect', (req, res) => {
    getURL();
    async function getURL() {
        const tokenRequestConfig = {
            url: 'https://www.zotero.org/oauth/request',
            method: 'POST',
            data: {
                oauth_callback: config.zotero.redirecturi
            }
        };
        const headers = oauth.toHeader(oauth.authorize(tokenRequestConfig));
        const tokenRequestResponse = await axios.post('https://www.zotero.org/oauth/request', null, {
            headers: headers
        });
        console.log(tokenRequestResponse)
        const tokenRequestData = await tokenRequestResponse.data;

        const obj = {};
        tokenRequestData.replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        const oAuthToken = obj['oauth_token'];
        const oAuthTokenSecret = obj['oauth_token_secret'];
        const url = `https://www.zotero.org/oauth/authorize?oauth_token=${oAuthToken}&library_access=1&notes_access=0&write_access=1`;

        res.send({ url: url, oAuthToken: oAuthToken, oAuthTokenSecret: oAuthTokenSecret })
    }
})
router.post('/verify', (req, res) => {
    console.log(req.body)
    tokenExchange();
    async function tokenExchange() {
        var tokenExchangeConfig = {
            url: `https://www.zotero.org/oauth/access?oauth_token=${req.body.oauth_token}`,
            method: 'POST',
            data: {
                oauth_verifier: req.body.oauth_verifier
            }
        };

        const tokenExchangeResponse = await axios.post(`https://www.zotero.org/oauth/access?oauth_token=${req.body.oauth_token}`, null, {
            headers: oauth.toHeader(oauth.authorize(tokenExchangeConfig, {
                public: req.body.oauth_token,
                secret: req.body.oauth_secret
            })),
        });
        const tokenExchangeData = tokenExchangeResponse.data;
        console.log(tokenExchangeData)
        const username = tokenExchangeData.match(/username=(\w+)/)[1];
        const userId = tokenExchangeData.match(/userID=([0-9]+)/)[1];
        const userAPIKey = tokenExchangeData.match(/oauth_token_secret=([a-zA-Z0-9]+)/)[1];


        var zotero = {}
        zotero.id = userId;
        zotero.username = username;
        zotero.oauth_token = req.body.oauth_token;
        zotero.oauth_token_secret = userAPIKey;
        zotero.library_version = "0"
        const user = new User({ account_type: 'Zotero', display_name: username, zotero: zotero });
        user.photo = req.protocol + "://" + req.get('host') + "/api/users/photo?userid=" + user._id
        console.log(user.photo)
        user.auth_token = userAPIKey;
        user.refresh_token = userAPIKey;
        user.settings = {
            dark_theme: false,
            multi_expand: false,
            number_of_table_rows: "10",
            png_resolution_scale: "2",
            node_size_citation_count: true,
            add_semantic_scholar_topics_to_graphs: true,
            default_graph_type: "Tags"
        }
        user.created = new Date();
        var expires = new Date();
        expires.setMinutes(expires.getMinutes() + 60);
        user.auth_token_expires = expires;
        user.validate().then(() => {
            user.save().then((u) => {
                console.log('new user saved')
                res.send(user)
            }).catch((err) => {
                console.log(err)
                res.json(err)
            })
            //send user data and access_token
        }).catch(function (error) {
            console.log(error)
            User.findOneAndUpdate({ "zotero.id": user.zotero.id }, { "auth_token": user.auth_token, "auth_token_expires": user.auth_token_expires, "refresh_token": user.refresh_token, "zotero.oauth_token": user.zotero.oauth_token, "zotero.oauth_token_secret": user.zotero.oauth_token_secret }, { new: true, fields: { library_embedding: 0, library_clusters: 0, library_ranked_recommendations: 0, library_recommendation_blacklist: 0 } }).then((u) => {
                console.log("updated user");
                res.send(u)
            }).catch(err => { console.log(err); res.send(error); })
        })
    }

})
module.exports = router;