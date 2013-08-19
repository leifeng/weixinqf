var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/weixin');
exports.insert = function (tokenid) {
    db.collection('token').count({id: tokenid}, function (err, num) {
        if (err) return;
        if (num == 0) {
            db.collection('token').insert({"id": tokenid,"msgid":0}, function (err, result) {
                if (err) return;
                console.log('加入' + tokenid);
            });
        }
    });
}
exports.find = function (callback) {
    var all = '';
    db.collection('token').find().toArray(function (err, result) {
        if (err) return;
        for (var i in result) {
            all += result[i].id + ',';
            if (i == result.length - 1) {
                callback(all);
            }
        }

    });
}
exports.update = function (tokenid, msgid, callback) {

    db.collection('token').update({"id": tokenid}, {$set: {"msgid": msgid}}, {upsert: true}, function (err) {
        if (err) {
            console.log(err);
        } else {
            callback();

        }

    });

}

exports.finderr = function ( callback) {
    var all = '';
    db.collection('token').find({"msgid":0}).toArray(function (err, result) {
        if (err) return;
        for (var i in result) {
            all += result[i].id + ',';
            if (i == result.length - 1) {
                callback(all);
            }
        }

    });

}
