var db = require('./db');
exports.status=function(msgid,callback){
    db.status(msgid,function(all,sended){
        callback(all,sended);
    })
}