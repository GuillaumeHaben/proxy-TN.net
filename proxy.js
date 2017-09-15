var http = require('http'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({ target: 'ws://localhost:9015', ws: true}),
    url = require('url');

proxy.on('error', function(err, req, res) {
    if (err.code != 'ECONNREFUSED') {
        res.end();
    }
    else {
        console.log(err);
    }
});

function getCallerIP(req)  {
    var ip="null";

    if(req && req.header && req.header['x-forwarded-for']){
        ip=req.header['x-forwarded-for'].split(",")[0];
    } else if(req.connection && req.connection.remoteAddress) {
        ip=req.connection.remoteAddress;
    } else {
        ip=req.ip;
    }
    return ip;
}

var ProxyServe = http.createServer(function(req,res){
    var currentDate = (new Date()).toJSON();
    var hostname = "Not Found"
    if(req.headers.host)
        hostname= req.headers.host.split(":")[0];
    var pathname = url.parse(req.url).pathname;
    var ipcaller = getCallerIP(req);
    console.log(currentDate +" -- "+ipcaller+" -> "+hostname+" > "+pathname);

    switch(hostname) {
        case 'integration.telecomnancy.net':
            proxy.web(req, res, { target: 'http://localhost:9015' });
            break;

        case 'integration-update.telecomnancy.net':
            proxy.web(req, res, { target: 'http://localhost:9016' });
            break;

        default:
            proxy.web(req, res, { target: 'http://localhost:8000' });
    }

});

ProxyServe.on('update', function(req, socket, head) {
        proxy.ws(req, socket, head);
});

ProxyServe.listen(80, function() {
    console.log('proxy listening on port 9000');
});
