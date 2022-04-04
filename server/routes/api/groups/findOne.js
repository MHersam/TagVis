var router = require('express').Router();
var express = require('express')
const axios = require('axios');
router.use(express.json({ limit: '50mb' }));
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var config = require('../../../../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });
const Group = require('../../../models/group.js');
const fs = require("fs")

// get the documents of a specific group
router.get('/', (req, res) => {
    //Group.findById(req.headers.id).populate({ path: 'documents', populate: { path: 'user', model: "User", select: 'display_name photo account_type' } }).populate('members', 'display_name photo account_type').then((group) => {
    Group.findById(req.headers.id).populate({ path: 'documents', populate: { path: 'user', model: "User", select: 'display_name photo account_type' } }).then((group) => {
        group.documents.forEach(doc => {
            if (doc.user.account_type == "TagVis") {
                doc.user.photo = (req.protocol + "://" + req.get('host') + '/api/users/photo?userid=' + doc.user._id);
            }
        })
        res.send(group);
    }).catch(err => {
        console.log(err)
        res.send(err)
    });

    // Debugging function
    function saveAsCSV(group) {
        let data = "Title,Authors,Year,Tags\n"
        group.documents.forEach(doc => {
            var tags = ""
            doc.tags.forEach(tag => {
                tags += tag + "; "
            });
            tags = tags.substring(0, tags.length - 1)
            let authorString = "";
            doc.authors.forEach((author) => {
                authorString +=
                    author.first_name + " " + author.last_name + "; ";
            });
            authorString = authorString.substring(0, authorString.length - 2);

            data += doc.title + "," + authorString + "," + doc.year + "," + tags + "\n";
        });
        fs.writeFile('Output.csv', data, (err) => {
            // In case of a error throw err. 
            if (err) throw err;
        })
    }
})
module.exports = router;