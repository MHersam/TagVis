const { default: zoteroAPI } = require('zotero-api-client');
const Documents = require('../models/document.js');
// service to post/update documents in a user's Zotero library
postDocumentsToZotero = async (user, documents, dbDocs) => {
    return new Promise(async function (resolve, reject) {
        // only 50 documents can be deleted at a time in zotero, so we might have to do more than one request
        var batchToPost = [];
        for (var i = 1; i <= documents.length; i++) {
            batchToPost.push(documents[i - 1])
            if (i % 50 == 0) {
                await updateBatchOfZoteroDocs(batchToPost, Math.max(0, i - 50)).catch(err => { reject(err) });
                batchToPost = [];
            }
        }
        if (batchToPost.length > 0) await updateBatchOfZoteroDocs(batchToPost, Math.max(0, documents.length - (documents.length % 50))).catch(err => { reject(err) });
        resolve(dbDocs)

        // post/update a max. of 50 zotero docs in zotero.
        function updateBatchOfZoteroDocs(batchToPost, startIndex) {
            return new Promise(function (resolve, reject) {
                zoteroAPI(user.zotero.oauth_token_secret)
                    .version(user.zotero.library_version)
                    .library('user', user.zotero.id)
                    .items()
                    .post(batchToPost).then(async (resp) => {
                        console.log(resp.raw.failed)
                        if (dbDocs) {
                            for (let i = 0; i < batchToPost.length; i++) {
                                if (resp.raw.success[i] && !dbDocs[i + startIndex].zotero_id && dbDocs[i + startIndex]._id) {
                                    await Documents.findOneAndUpdate({ _id: dbDocs[i + startIndex]._id }, { zotero_id: resp.raw.success[i] }, { new: true }).then(res => { dbDocs[i + startIndex] = res }).catch(err => console.log(err))
                                }
                            }
                        }
                        user.zotero.library_version = resp.response.headers.get("last-modified-version")
                        await user.save();
                        resolve();
                    }).catch(err => {
                        console.log(err)
                        if (err.response.status == 412) {
                            /*
                              Our library version is outdated if err 412!
                              We just force our updates on to Zotero. It's not good practice to workaround their versioning system like this.
                              But as long as we're only adding new docs that the user actively added, or move documents to the trash with this it's alright.
                            */
                            getLastestLibraryVersion().then(async (res) => {
                                user.zotero.library_version = res
                                updateBatchOfZoteroDocs(batchToPost, startIndex).catch(() => { reject() })
                            })
                        } else if (err.response.status == 403) {
                            reject(403)
                        } else {
                            console.log(err)
                            reject()
                        }
                    });
            })
        }

        function getLastestLibraryVersion() {
            return new Promise(async function (resolve, reject) {
                const apiResponse = await zoteroAPI(user.zotero.oauth_token_secret)
                    .library('user', user.zotero.id)
                    .items()
                    .get({ limit: 1 });
                resolve(apiResponse.response.headers.get("last-modified-version"))
            })
        }
    })
}
exports.postDocumentsToZotero = postDocumentsToZotero;
