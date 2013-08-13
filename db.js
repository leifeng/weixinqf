var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/weixin');
exports.insert = function (tokenid) {
    db.collection('token').count({id: tokenid}, function (err, num) {
        if (err) return;
        if (num == 0) {
            db.collection('token').insert({id: tokenid}, function (err, result) {
                if (err) return;
            });
        } else {
            console.log('重复');
        }
    });
}
exports.find = function (callback) {
    var all = '';
    db.collection('token').find().toArray(function (err, result) {
        if (err) return;
        for (var i in result) {
            //console.log('find: ' + result[i].id);
            all += result[i].id + ',';
            if (i == result.length-1) {
                callback(all);
                //console.log(all);
            }
        }

    });
}