var url = require('url');
var https = require('https');
var HttpsProxyAgent = require('https-proxy-agent');
var fs = require('fs');

var proxy = 'http://51.75.147.41:3128';
console.log('using proxy server %j', proxy);

// HTTPS endpoint for the proxy to connect to
var endpoint = process.argv[2] || 'https://api.semanticscholar.org/v1/paper/10.1038/nrn3241';
console.log('attempting to GET %j', endpoint);
var options = url.parse(endpoint);

// create an instance of the `HttpsProxyAgent` class with the proxy server information
var agent = new HttpsProxyAgent(proxy);
options.agent = agent;

https.get(options, function (res) {
    console.log('"response" event!', res.headers);
    var myFile = fs.createWriteStream("resm.json");
    res.pipe(myFile)
    //res.pipe(process.stdout);
});