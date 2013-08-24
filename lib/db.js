var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/weixin');
exports.insert = function (tokenid) {
    db.collection('token').count({id: tokenid}, function (err, num) {
        if (err) return;
        if (num == 0) {
            db.collection('token').insert({"id": tokenid, "msgid": 0}, function (err, result) {
                if (err) return;
                console.log('加入' + tokenid);
            });
        }
    });
}
exports.find = function (callback) {
    var all = '';
    db.collection('token').find().toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            for (var i in result) {
                all += result[i].id + ',';
                if (i == result.length - 1) {
                    callback(all);
                }
            }
        }


    });
}
exports.update = function (tokenid, msgid, callback) {
    db.collection('token').update({"id": tokenid}, {$set: {"msgid": msgid}}, {upsert: true}, function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            callback();

        }

    });

}

exports.finderr = function (msgid, callback) {
    var all = '';
    db.collection('token').find({"msgid": {$ne: msgid}}).toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            for (var i in result) {
                all += result[i].id + ',';
                if (i == result.length - 1) {
                    callback(all);
                }
            }
        }
    });
}

exports.status = function (msgid, callback) {

    db.collection('token').count(function (err, all) {
        if (err) return;
        db.collection('token').count({msgid: msgid}, function (err, sended) {
            if (err) return;
            callback(all, sended);
        })
    })

}