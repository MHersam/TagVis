const axios = require('axios')
var qs = require('querystring')
var fs = require("fs");
var secret = fs.readFileSync("./MendeleySecret.env").toString();

axios.post('https://api.mendeley.com/oauth/token',
  qs.stringify({
    client_id: '9002',
    client_secret: secret,
    grant_type: 'authorization_code',
    code: 'dTNlb4VnuDABZNbpW2G9Ejda9nA',
    redirect_uri: 'http://localhost:8080'
  })).then(function (response) {
    console.log(response.data.access_token);
  }).catch(function (error) {
    console.log(error);
  });
