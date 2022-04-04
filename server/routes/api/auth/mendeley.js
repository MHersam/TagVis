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

// login for mendeley users
router.post('/', (req, res) => {
  //get access_token from mendeley
  axios.post('https://api.mendeley.com/oauth/token',
    qs.stringify({
      client_id: config.mendeley.clientid,
      client_secret: config.mendeley.clientsecret,
      grant_type: 'authorization_code',
      code: req.body.auth_code,
      redirect_uri: config.mendeley.redirecturi
    })).then(function (res1) {
      var token = res1.data.access_token
      console.log(token);
      //fetch user data
      axios.get('https://api.mendeley.com/profiles/me', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }).then(function (res2) {
        var res3 = res2.data
        res3.access_token = token
        //const mendeleyUser = new MendeleyUser(res3);
        //mendeleyUser.refresh_token = res1.data.refresh_token;
        const user = new User({ account_type: 'Mendeley', display_name: res3.display_name, mendeley: res3 });
        user.photo = res2.data.photos[0].url
        user.auth_token = token;
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
        user.refresh_token = res1.data.refresh_token;
        console.log(user)
        user.validate().then(() => {
          user.save().then((u) => {
            console.log('new user saved')
            //res3._id = u._id
            //res.json(res3)
            console.log(token == user.auth_token)
            res.send(user)
          }).catch((err) => {
            console.log(err)
            res.json(err)
          })
          //send user data and access_token

        }).catch(function (error) {
          User.updateOne({ "mendeley.id": user.mendeley.id }, { "display_name": user.display_name, "photo": user.photo, "auth_token": user.auth_token, "auth_token_expires": user.auth_token_expires, "refresh_token": user.refresh_token }).then(() => {
            console.log("updated user");
            User.findOne({ "mendeley.id": user.mendeley.id }, {library_embedding: 0, library_clusters: 0, library_ranked_recommendations: 0, library_recommendation_blacklist: 0}).then((u) => {
              //res3._id = u._id
              //res.json(res3)
              console.log(token == u.auth_token)
              res.send(u)
            })
          }).catch(err => { console.log(err); res.send(error); })
        })

      }).catch(function (error) {
        console.log(error);
        res.send(error)
      });
    })
})
module.exports = router;