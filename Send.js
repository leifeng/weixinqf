var http = require('http');
var querystring = require('querystring');
var cookie = require('./GetCookie');
var db = require('./db');
var async = require('async');
var id, cookies, token;


exports.fs = function (_id, callbacks) {

    cookie.cookie(function (_cookie, _token) {
        id = _id;
        cookies = _cookie;
        token = _token;
        db.find(function (result) {
            var arr = result.split(',');
            //  var arr=['1309417340','370824115','1309417340','370824115','1309417340','370824115','1309417340','370824115']  ;
            async.forEachSeries(arr, function (item, callback) {
                console.log('id: ' + item);
                setTimeout(function () {
                    sendmsg(item, function (data) {
                        db.insertsended(item, data, function () {
                            console.log(data);
                            callback(null, item);
                        });

                    });
                }, 1800);
            }, function (err) {
                console.log('完成' + err);
                callbacks('完成');
            });

        });

    });
}


var sendmsg = function (userid, callback) {
    var post = querystring.stringify({
        type: '10',
        fid: id,
        appmsgid: id,
        error: false,
        imgcode: '',
        tofakeid: userid,
        token: token,
        ajax: '1'
    });
    var headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip,deflate,sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Connection': 'keep-alive',
        'Content-Length': post.length,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': cookies,
        'Referer': 'https://mp.weixin.qq.com/cgi-bin/loginpage?t=wxm2-login&lang=zh_CN',
        'Origin': 'https://mp.weixin.qq.com',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    }
    var opt = {
        hostname: 'mp.weixin.qq.com',
        port: 80,
        path: '/cgi-bin/singlesend?t=ajax-response&lang=zh_CN',
        method: 'POST',
        headers: headers
    }
    var req = http.request(opt, function (res) {
        //console.log('STATUS: ' + res.statusCode);
        //   console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            callback(chunk);
        });

    });
    req.write(post);
    req.end();

}

