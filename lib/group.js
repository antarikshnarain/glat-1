var pgclient = require('../models/pgclient');
var as = require('async');

var group ={
    'addMembers' : function(gid,mems,cb){
        if(mems.constructor!==Array)mems = [mems];
        mems.forEach(function(mem){
            pgclient.execute(`insert into group_members(gid,uid) values('${gid}','${mem}')`,
            function(err,result){
                if(err){
                    cb(err);
                }
            });
        });
        cb(null);
    },
    'setAdmin' : function(gid,phone,cb){
        group.isMember(gid,phone,function(err,result){
            if(err)cb(err);
            else{
                if(result!='0'){
                    pgclient.execute(`update group_members set is_admin = true where uid='${phone}' and gid=${gid}`,
                        function(err,res){
                            if(err)cb(err);
                            else{
                                cb(null,'1');
                            }
                        });
                }else cb(null,'0');
            }
        });
    },
    'isMember' : function(gid,phone,cb){
        pgclient.execute(`select count(*) from group_members where uid = '${phone}' and gid = ${gid}`,
            function(err,result){
                if(err){
                    cb(err);
                }else if(result&&result.length){
                    if(result[0].count=='0')
                    cb(null,false);
                    else cb(null,true);
                }  
        });
    },
    'filterMembers' : function(gid,phones,cb){
        function isM(p,rcb){
            group.isMember(gid,p,rcb);
        }
         as.filter(phones,isM,function(err,u){
            if(err)cb(err);
            else{
                as.reject(phones,isM,function(err,nu){
                    if(err)cb(err);
                    else{
                        cb(null,{'u':u,'nu':nu});
                    }
                });
            }
        });
    }
}

module.exports = group;

//----------------------------------------------

if(require.main===module){
    (function(){
        group.filterMembers(1,['1234567890','918566','123','2313211212122'],function(err,result){
            if(err)console.log(err);
            else console.log(result);
        })
    })()
}