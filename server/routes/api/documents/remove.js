var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Documents = require('../../../models/document.js');
const Group = require('../../../models/group.js');
const User = require('../../../models/user.js');
const zoteroDocumentsService = require('../../../services/zotero_documents.js')
const specterEmbeddingService = require('../../../services/specter_embedding.js')
const recommendationService = require('../../../services/recommendations.js')

// removes documents from personal library and from groups
router.patch('/', async function (req, res) {
    var promises = []
    var groupsToUpdate = [];
    var user = await User.findOne({ auth_token: req.body.access_token })
    Group.find({
        'documents': {
            $in: req.body.documents
        }
    }).then(groups => {
        //console.log(groups)
        groupsToUpdate = groups;
        if (user.account_type == "Mendeley") {
            req.body.documents.forEach(doc => {
                promises.push(Documents.findOneAndUpdate({ _id: doc }, { user: undefined }).then(d => {
                    promises.push(trashMendeleyDocument(d.mendeley_id))
                }))
            })
        } else if (user.account_type == "Zotero") {
            var zoteroDocsToTrash = [];
            req.body.documents.forEach(doc => {
                promises.push(Documents.findOneAndUpdate({ _id: doc }, { user: undefined }).then(d => {
                    zoteroDocsToTrash.push(d);
                }))
            });
            Promise.all(promises).then(async () => {
                if (zoteroDocsToTrash.length > 0) {
                    trashZoteroDocuments(zoteroDocsToTrash).then(() => {
                        specterEmbeddingService.updateLibraryEmbeddingAndClusters(user).then(() => {
                            recommendationService.updateRecommendations(user)
                        })
                        res.sendStatus(200);
                    }).catch(err => {
                        if (err == 403) {
                            res.sendStatus(403)
                        } else {
                            res.sendStatus(500)
                        }
                    })
                }
            })
        } else {
            req.body.documents.forEach(doc => {
                promises.push(Documents.findOneAndUpdate({ _id: doc }, { user: undefined }));
            });
        }
        for (const group in groupsToUpdate) {
            promises.push(removeDocumentsFromGroup(groupsToUpdate[group]._id))
        }

        if (user.account_type != "Zotero") {
            Promise.all(promises).then(() => {
                specterEmbeddingService.updateLibraryEmbeddingAndClusters(user).then(() => {
                    recommendationService.updateRecommendations(user)
                    res.sendStatus(200)
                })
            }).catch(err => {
                res.sendStatus(500)
            })
        }
    });



    //trash the documents in the user's zotero library
    function trashZoteroDocuments(zoteroDocsToTrash) {
        return new Promise(function (resolve, reject) {
            var documentUpdates = [];
            zoteroDocsToTrash.forEach(doc => {
                // deleted: 1 moves docs to trash in zotero
                documentUpdates.push({ key: doc.zotero_id, deleted: 1 })
            });
            zoteroDocumentsService.postDocumentsToZotero(user, documentUpdates).then(() => { resolve() }).catch(err => { reject(err) });
        });
    }

    // moves documents to the trash bin in mendeley
    function trashMendeleyDocument(id) {
        return axios.post('https://api.mendeley.com/documents/' + id + '/trash', {}, {
            headers: {
                Authorization: 'Bearer ' + req.body.access_token
            }
        }).catch((err) => {
            console.log(err)
        })
    }
    // remove doc from groups it is included
    function removeDocumentsFromGroup(id) {
        var port = process.env.PORT || 3000
        return axios
            .patch('http://localhost:' + port + '/api/groups/removeDocuments', {
                access_token: req.body.access_token,
                id: id,
                documents: req.body.documents,
            })
            .catch(function (error) {
                console.log(error);
            })
    }
})
module.exports = router;
