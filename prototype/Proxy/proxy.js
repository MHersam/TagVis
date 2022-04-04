var url = require('url');
var https = require('https');
var HttpsProxyAgent = require('https-proxy-agent');
var ProxyLists = require('proxy-lists');
var fs = require('fs');

var list = []

// `getProxies` returns an event emitter.
ProxyLists.getProxies({
    // options
    countries: ['de'],
    protocols: ['https'],
    anonymityLevels: ['elite', 'anonymous'],
})
    .on('data', function (proxies) {
        // Received some proxies.
        console.log('got some proxies');
        proxies.forEach(proxy => {
            list.push(proxy)
        });
    })
    .on('error', function (error) {
        // Some error has occurred.
        //console.log('error!', error);
    })
    .once('end', function () {
        // Done getting proxies.
        console.log('end!');
        console.log(list.length)
        fs.writeFile('proxy_list.json', JSON.stringify(list), function (err) {
            if (err) throw err;
            console.log('List Saved!');
        });
        var index = 0;

        list.forEach(proxy => {
            // HTTP/HTTPS proxy to connect to
            var proxy = 'http://' + proxy.ipAddress + ':' + proxy.port;
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
                var myFile = fs.createWriteStream("results/"+index+".json");
                index++;
                res.pipe(myFile)
                //res.pipe(process.stdout);
            });
        });

    });