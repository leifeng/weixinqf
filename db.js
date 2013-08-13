var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/weixin');
exports.insert=function(tokenid){
    db.collection('token').findOne({id:tokenid},function(err,post){
        if(err) return;
        if(post!=null){
            db.collection('token').insert({id:tokenid},function(err,result){
                if(err) return;
                db.close();
            })
        }
    }) ;
}
exports.find=function(callback){
    var all='';
    var x=1;
    db.collection('token').find().toArray(function(err,result){
        if(err) return;
        if(x==result.length){
            callback(all);
        }else{
            x++;
            all+=result.id+',';
        }
    });
}