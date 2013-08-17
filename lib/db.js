var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/weixin');
exports.insert = function (tokenid) {
    db.collection('token').count({id: tokenid}, function (err, num) {
        if (err) return;
        if (num == 0) {
            db.collection('token').insert({id: tokenid}, function (err, result) {
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
                db.close();
                callback(all);
            }
        }

    });
}
exports.update = function (tokenid, msgid, callback) {
    db.collection('token').update({id: tokenid}, {$set:{msgid: msgid}}, {}, function (err, result) {
        if (err)  {
            console.log(err);
            return;
        }
        console.log("update");
        callback();
    });

}

exports.insertsended = function (tokenid, status, callback) {

    db.collection('sended').insert({id: tokenid, status: status}, function (err, result) {
        if (err) return;
        db.close();
        callback()
    });

}
