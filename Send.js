var http = require('http');
var querystring = require('querystring');
var cookie = require('./GetCookie');
var db = require('./db');


exports.fs = function (id, callback) {
    cookie.cookie(function (cookie, token) {
        db.find(function (result) {
           var arr = result.split(',');
            a(arr,cookie,token,0,id);
        })

    });
}

var sendmsg = function (cookie, token, user, id) {
    var post = querystring.stringify({
        type: '10',
        fid: id,
        appmsgid: id,
        error: false,
        imgcode: '',
        tofakeid: user,
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
        //   console.log('HEADERS: ' + JSON.stringify(res.headers));
        //   res.setEncoding('utf8');
        //   res.on('data', function (chunk) {
        //      console.log('BODY: ' + chunk);
        //  });
    });
    req.write(post);
    req.end();
}

var a = function (arr,cookie, token, i, id) {

    if(i>arr.length||arr.length==0) {
            return;
    }
    setTimeout(function () {
       // sendmsg(cookie, token, arr[i], id);
        console.log(arr[i]);
        if (i == arr.length) {
            callback('send ok');
        }
    }, 1000)

    a(cookie,token,++i, id);

}
