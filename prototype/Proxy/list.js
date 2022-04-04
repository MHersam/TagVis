var ProxyLists = require('proxy-lists');
 
// `getProxies` returns an event emitter.
ProxyLists.getProxies({
    // options
    countries: ['us', 'ca']
})
    .on('data', function(proxies) {
        // Received some proxies.
        console.log('got some proxies');
        console.log(proxies);
    })
    .on('error', function(error) {
        // Some error has occurred.
        console.log('error!', error);
    })
    .once('end', function() {
        // Done getting proxies.
        console.log('end!');
    });