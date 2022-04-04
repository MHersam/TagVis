var router = require('express').Router();
var express = require('express')
const axios = require('axios');
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json({ limit: '50mb' }));;
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Documents = require('../../../models/document.js');
const Group = require('../../../models/group.js');
const User = require('../../../models/user.js');
const groupsService = require('../../../services/groups.js')
var qs = require('querystring')
const { default: zoteroAPI } = require('zotero-api-client');

// update tags of a document
router.patch('/', (req, res) => {
    var document = JSON.parse(req.body.document)
    var promises = [];
    Documents.findOneAndUpdate({ _id: document._id }, { tags: document.tags }, { new: true }).populate('user').then((d) => {
        if (d.zotero_id) {
            // Update document tags in the user's Zotero library
            promises.push(new Promise(async (resolve, reject) => {
                var tags = [];
                document.tags.forEach(tag => {
                    tags.push({ tag: tag, type: 1 })
                });
                var error = false;
                await zoteroAPI(d.user.zotero.oauth_token_secret)
                    .version(d.version)
                    .library('user', d.user.zotero.id)
                    .items(d.zotero_id)
                    .patch({ tags: tags }).catch(async err => {
                        if (err.response.status == 412) {
                            /*
                              Our library version of the document is outdated if err 412!
                              We retrieve the tags that zotero got and merge them with the ones we received.
                              Then we send the merged array to zotero
                            */
                            var apiResponse = await zoteroAPI(d.user.zotero.oauth_token_secret)
                                .library('user', d.user.zotero.id)
                                .items(d.zotero_id)
                                .get()
                            d.version = apiResponse.getData().version
                            var zoteroTags = []
                            apiResponse.getData().tags.forEach(tag => {
                                zoteroTags.push(tag.tag)
                            });
                            zoteroTags = zoteroTags.concat(document.tags)
                            //remove duplicates
                            d.tags = [...new Set(zoteroTags)];
                            var tags = [];
                            d.tags.forEach(tag => {
                                tags.push({ tag: tag, type: 1 })
                            });
                            await zoteroAPI(d.user.zotero.oauth_token_secret)
                                .version(d.version)
                                .library('user', d.user.zotero.id)
                                .items(d.zotero_id)
                                .patch({ tags: tags }).catch(err => { console.log(err) })
                        } else if (err.response.status == 403) {
                            error = true;
                            res.status(403).send(d.tags);
                        }
                    });
                if (!error) {
                    //retrieve the updated doc to get the new version numbers
                    var apiResponse = await zoteroAPI(d.user.zotero.oauth_token_secret)
                        .library('user', d.user.zotero.id)
                        .items(d.zotero_id)
                        .get()
                    d.version = apiResponse.getData().version
                    //update document version number in our DB
                    await d.save();
                    // and update general library version number
                    await User.findOneAndUpdate({ _id: d.user._id }, { 'zotero.library_version': apiResponse.response.headers.get("last-modified-version") }).catch(err => {
                        console.log(err)
                    })
                    resolve();
                }else{
                    reject();
                }
            }));
        }
        if (d.mendeley_id) {
            //Update document tags in the user's Mendeley library
            if (d.user.auth_token_expires > new Date()) {
                promises.push(axios.patch('https://api.mendeley.com/documents/' + d.mendeley_id, { tags: document.tags }, {
                    headers: {
                        Authorization: 'Bearer ' + d.user.auth_token,
                        'Content-Type': 'application/vnd.mendeley-document.1+json'
                    }
                }))
            } else {
                promises.push(axios.post('https://api.mendeley.com/oauth/token',
                    qs.stringify({
                        client_id: config.mendeley.clientid,
                        client_secret: config.mendeley.clientsecret,
                        grant_type: 'refresh_token',
                        refresh_token: d.user.refresh_token,
                        redirect_uri: config.mendeley.redirecturi
                    })).then(function (res1) {
                        var expires = new Date();
                        expires.setMinutes(expires.getMinutes() + 60);
                        promises.push(User.findOneAndUpdate({ refresh_token: d.user.refresh_token }, { auth_token: res1.data.access_token, auth_token_expires: expires, refresh_token: res1.data.refresh_token }).then(() => {
                            promises.push(axios.patch('https://api.mendeley.com/documents/' + d.mendeley_id, { tags: document.tags }, {
                                headers: {
                                    Authorization: 'Bearer ' + res1.data.access_token,
                                    'Content-Type': 'application/vnd.mendeley-document.1+json'
                                }
                            }))
                        }).catch(function (error) {
                            console.log(error);
                            res.send(error);
                        }))

                    }).catch(function (error) {
                        console.log(error);
                        res.sendStatus(401)
                        //res.send(error)
                    }));
            }
        }
        // update the tag overview of the groups the paper is included
        Group.find({ documents: document._id }).then((groups) => {
            groups.forEach(group => {
                promises.push(groupsService.updateTags(group._id))
            });
        })
        Promise.all(promises).then(() => {
            res.send(d.tags)
        })
    }).catch((err) => {
        console.log(err)
        res.sendStatus(404)
    })
})
module.exports = router;
