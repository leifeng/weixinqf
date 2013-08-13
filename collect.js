var http = require('http');
var cookie = require('./GetCookie');
var iconv = require('iconv-lite');
var db = require('./db');
exports.cj = function (callback) {

    cookie.cookie(function (cookie, token) {
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

        gethtml(headers, token, null, function (str) {
            var num = str.toString().substring(str.indexOf('DATA.catalogList'), str.indexOf('subCatalogList : 0'));
            num = num.substring(num.indexOf('num') + 3, num.indexOf('*')).replace(/'/g, "").replace(/ /g, "").replace(":", "");
            ;
            console.log('num:   ' + num)
            var page = num / 100 + num % 100;
            console.log('page:   ' + page)
            for (var i = 0; i <= page; i++) {
                var opt = {
                    hostname: 'mp.weixin.qq.com',
                    port: 80,
                    path: '/cgi-bin/contactmanagepage?t=wxm-friend&token=' + token + '&lang=zh_CN&pagesize=100&pageidx=' + i + '&type=0&groupid=0',
                    method: 'GET',
                    headers: headers
                }
                gethtml(headers, token, opt, function (result) {
                    var html = result.toString().substring(result.indexOf('<script id="json-friendList" type="json/text">'));
                    html = html.substring(0, html.indexOf('</script>')).replace('<script id="json-friendList" type="json/text">', '')
                    var json = JSON.parse(html);
                    for (var i in json) {
                       // console.log(json[i].fakeId);
                     //   db.insert(json[i].fakeId);
                    }
                });
                if(i==page){
                    callback('cj ok');
                }
            }


        });

    });
}


var gethtml = function (headers, token, opt, callback) {
    if (opt == null) {
        opt = {
            hostname: 'mp.weixin.qq.com',
            port: 80,
            path: '/cgi-bin/contactmanagepage?t=wxm-friend&token=' + token + '&lang=zh_CN&pagesize=10&pageidx=0&type=0&groupid=0',
            method: 'GET',
            headers: headers
        }
    }
    var html = "";
    var req = http.request(opt, function (res) {
        res.setEncoding('binary');
        res.on('data',function (chunk) {
            html += chunk;
        }).on('end', function () {
                var buf = new Buffer(html, 'binary');
                var str = iconv.decode(buf, 'utf-8');
                callback(str)
            });
    });
    req.write('');
    req.end();
}
