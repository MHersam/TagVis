const Group = require('../models/group.js');

// service to update the tag overview of groups, the list is shown in GroupCards.
updateTags = (groupID) => {
    return new Promise(function (resolve, reject) {
        Group.findOne({ _id: groupID }).populate('documents').then((group) => {
            var docs = group.documents
            // all occuring tags with duplicates
            var allTags = []
            docs.forEach(doc => {
                allTags = allTags.concat(doc.tags)
            });
            allTags.sort()
            // all occuring tags no duplicates
            var tagNames = [],
                // corresponding count to tagName
                tagCounts = [],
                prev;
            // fill tagNames and tagCounts arrays
            for (var i = 0; i < allTags.length; i++) {
                if (allTags[i] !== prev) {
                    tagNames.push(allTags[i]);
                    tagCounts.push(1);
                } else {
                    tagCounts[tagCounts.length - 1]++;
                }
                prev = allTags[i];
            }
            var tags = []
            for (let i = 0; i < tagNames.length; i++) {
                tags.push({ tagName: tagNames[i], count: tagCounts[i] })
            }
            // sort descending by count
            tags.sort((a, b) => (a.count > b.count) ? -1 : ((b.count > a.count) ? 1 : 0))
            var result = []
            tags.forEach(tag => {
                result.push(tag.tagName + " (" + tag.count + ")")
            });
            group.last_modified = new Date();
            group.tags = result;
            group.save().then(() => {
                resolve(result)
            });
        }).catch(err => {
            console.log(err)
            resolve([])
        })
    })
}
exports.updateTags = updateTags;
