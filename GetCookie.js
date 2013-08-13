var querystring = require('querystring');
var http = require('http');
var config=require('./config');
exports.cookie = function (callback) {
    var post = querystring.stringify({
        username: config.user,
        pwd: config.pwd,
        imgcode: '',
        f: 'json'
    });
    var headers = {
        'Accept': '',
        'Accept-Encoding': '',
        'Accept-Language': '',
        'Connection': 'keep-alive',
        'Content-Length': post.length,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://mp.weixin.qq.com',
        'Referer': 'https://mp.weixin.qq.com/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    }
    var opt = {
        hostname: 'mp.weixin.qq.com',
        port: 80,
        path: '/cgi-bin/login?lang=zh_CN',
        method: 'POST',
        headers: headers
    }
    var req = http.request(opt, function (res) {
        var cookie = '';
        console.log('STATUS: ' + res.statusCode);
        var cookie = res.headers['set-cookie'];
        cookie = cookie.toString().replace(/Path=\//g, '').replace(/Secure/g, '').replace(/HttpOnly/g, '').replace(/ /g, '').replace(/;;/g, '').replace(/,/g, '');
        console.log('Cookie: ' + cookie);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            var token = chunk.toString().substring(chunk.indexOf('token=') + 6, chunk.indexOf('ShowVerifyCode'));
            token = token.replace(/\"/g, '').replace(/'/g, '').replace(/ /g, '').replace(/,/g, '').replace(/\n/, '');
            //console.log(token);
            callback(cookie, token);
        });
    });
    req.write(post);
    req.end();
}

