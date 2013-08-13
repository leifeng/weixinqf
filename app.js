var http = require('http');
var url = require("url");
var querystring = require('querystring');
var collect = require('./collect');
var send = require('./Send');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var query = url.parse(req.url).query;
    var type = querystring.parse(query).type;
    if (type != '' && type != null) {
        if (type == 'cj') {
            collect.cj(function (result) {
                res.end(result);
            });
        } else if (type == 'fs') {
            var id = url.parse(req.url).id;
            if (id != '' && id != null) {
                send.fs(id, function (result) {
                    res.end(result);
                });
            }
        } else {
            res.end('hello world!');
        }
    } else {
        res.end('hello world!');
    }
}).listen(3001);
console.log('runing at 3001');
