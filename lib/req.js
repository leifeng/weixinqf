var http = require('http');
var QueryString = require('querystring');
var iconv = require('iconv-lite');
var config = require('./config');
var db = require('./db');
var async = require('async');

exports.collect = function (callback) {
    getCookie(function (cookie, token) {
        var html = '';
        var headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip,deflate,sdch',
            'Accept-Language': 'zh-CN,zh;q=0.8',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': cookie,
            'Referer': 'https://mp.weixin.qq.com/cgi-bin/loginpage?t=wxm2-login&lang=zh_CN',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36'
        }
        var opt = {
            hostname: 'mp.weixin.qq.com',
            port: 80,
            path: '/cgi-bin/contactmanagepage?t=wxm-friend&token=' + token + '&lang=zh_CN&pagesize=500&pageidx=0&type=0&groupid=0',
            method: 'GET',
            headers: headers
        }
        var request = http.request(opt, function (res) {
            res.setEncoding('binary');
            res.on('data',function (chunk) {
                html += chunk;
            }).once('end', function () {
                    var buf = new Buffer(html, 'binary');
                    var str = iconv.decode(buf, 'utf-8');
                    html = str.toString().substring(str.indexOf('<script id="json-friendList" type="json/text">'));
                    html = html.substring(0, html.indexOf('</script>')).replace('<script id="json-friendList" type="json/text">', '');
                    var json = JSON.parse(html);
                    for (var i in json) {
                        if (i == json.length - 1) {
                            console.log('采集完成');
                            callback();
                        } else {
                            db.insert(json[i].fakeId);
                        }

                    }

                });

        });
        request.write('');
        request.end();
    });


}
exports.send = function (msgid, callbacks) {

    var t = 200;

    getCookie(function (cookie, token) {
        db.find(function (result) {
            callbacks();
            var i = 0;
            var arr = result.split(',');
            // var arr = ['1309417340'];
            async.forEachSeries(arr, function (userid, callback) {
                setTimeout(function () {
                    var html = "";
                    var query = QueryString.stringify({
                        type: '10',
                        fid: msgid,
                        appmsgid: msgid,
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
                        'Content-Length': query.length,
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
                    var request = http.request(opt, function (res) {
                        res.setEncoding('utf8');
                        res.on('data',function (chunk) {
                            html += chunk;
                        }).on('end', function () {
                                console.log(i);
                                if (html.toString().indexOf('need') != -1) {
                                    t = 1000 * 300;
                                    db.update(userid, 0, function () {
                                        console.log("需要验证码停止5分钟");
                                        callback(null, userid);
                                    });
                                } else {
                                    t = 200;
                                    db.update(userid, msgid, function () {
                                        console.log(userid + "发送成功更新id");
                                        callback(null, userid);
                                    });

                                }
                                i++;

                            });
                    });
                    request.write(query);
                    request.end();
                }, t);
            }, function () {
                console.log('完成');
            });

        });

    });
}

getCookie = function (callback) {
    var query = QueryString.stringify({
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
        'Content-Length': query.length,
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
    var request = http.request(opt, function (res) {
        var cookie = '';
        console.log('STATUS: ' + res.statusCode);
        var cookie = res.headers['set-cookie'];
        cookie = cookie.toString().replace(/Path=\//g, '').replace(/Secure/g, '').replace(/HttpOnly/g, '').replace(/ /g, '').replace(/;;/g, '').replace(/,/g, '');
        console.log('Cookie: ' + cookie);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var token = chunk.toString().substring(chunk.indexOf('token=') + 6, chunk.indexOf('ShowVerifyCode'));
            token = token.replace(/\"/g, '').replace(/'/g, '').replace(/ /g, '').replace(/,/g, '').replace(/\n/, '');
            console.log('token: ' + token);
            callback(cookie, token);
        });
    });
    request.write(query);
    request.end();

}


exports.senderr = function (msgid, callbacks) {

    var t = 200;

    getCookie(function (cookie, token) {
        db.finderr(msgid,function (result) {
            callbacks();
            var i = 0;
            var arr = result.split(',');
            async.forEachSeries(arr, function (userid, callback) {
                setTimeout(function () {
                    var html = "";
                    var query = QueryString.stringify({
                        type: '10',
                        fid: msgid,
                        appmsgid: msgid,
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
                        'Content-Length': query.length,
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
                    var request = http.request(opt, function (res) {
                        res.setEncoding('utf8');
                        res.on('data',function (chunk) {
                            html += chunk;
                        }).on('end', function () {
                                console.log(i);
                                if (html.toString().indexOf('need') != -1) {
                                    t = 1000 * 300;
                                    db.update(userid, 0, function () {
                                        console.log("需要验证码停止5分钟");
                                        callback(null, userid);
                                    });
                                } else {
                                    t = 200;
                                    db.update(userid, msgid, function () {
                                        console.log(userid + "发送成功更新id");
                                        callback(null, userid);
                                    });

                                }
                                i++;

                            });
                    });
                    request.write(query);
                    request.end();
                }, t);
            }, function () {
                console.log('完成');
            });

        });

    });
}
