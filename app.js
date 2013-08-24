var http = require('http');
var url = require("url");
var querystring = require('querystring');
var lib = require('./lib/req');
var status = require('./lib/status');
http.createServer(function (req, res) {
    var id = null, type = null;
    res.writeHead(200, {'Content-Type': 'text/html'});
    var query = url.parse(req.url).query;
    type = querystring.parse(query).type;
    id = querystring.parse(query).id;
    if (type == "cj") {
        lib.collect(function () {
            res.end("采集完成");
        });
    } else if (type == "fs" && id != null) {
        lib.senderr(id, function () {
            res.end("发送处理中..");
        });
    } else if (type == "status" && id != null) {
        status.status(id, function (all, sended) {
            res.end("总共:" + all + "     已发:" + sended);
        })
    }
    else {
        res.end('hello world!');
    }

}).listen(3002);
console.log('runing at 3002');
