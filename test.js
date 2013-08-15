var http = require('http');
var querystring = require('querystring');
var cookie = require('./GetCookie');

exports.fs = function (callback) {
    cookie.cookie(function (cookie, token) {
        console.log('getcookie');
        sendmsg(cookie, token,function(result){
            callback(result) ;
        });

    });
}


var sendmsg = function (cookie, token,callback) {
    console.log('sendmsg')
    var post = querystring.stringify({
        type: '10',
        fid: '10000185',
        appmsgid: '10000185',
        error: false,
        imgcode: '',
        tofakeid: '1309417340',
        token: token,
        ajax: '1'
    });
    console.log('post: ' + post);
    var headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip,deflate,sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Connection': 'keep-alive',
        'Content-Length': post.length,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': cookie,
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
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            callback('STATUS: ' + res.statusCode+'<br/>HEADERS: ' + JSON.stringify(res.headers)+'<br/>test ok!!!!')
        });
    });
    req.write(post);
    req.end();
}
