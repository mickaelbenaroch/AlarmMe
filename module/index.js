var mongoose = require('mongoose'),
    consts   = require('../consts'),
    person   = require('./Userprofile'),
    getalarm = require('./getAlarm');

class AlarMe{
    constructor(){
        //connect to mlab
        mongoose.connect(consts.MLAB_KEY).then(() => {
            console.log("Connect to AlarMe DB");
        }).catch(err => {
            console.log(`connection AlarMe DB error: ${err}`);
        });
    }

    //-------------------------------read methods-----------------------
    //screen 1 - get setting by user id or user name.
    getSetting(id_param, fullName_param){
        return new Promise((res,rej)=>{
            person.find({$or:[{id:id_param}, {fullName: fullName_param}]}, (err, data)=>{

                //error search in mlab
                if(err) 
                    rej(err);

                //JSON return empty
                if(data == 0) 
                    rej(`empty resualt: ${err}`);

                //seccess
                res(data);
            });
        });
    }

    //screen  2 - get "alarm" by user id or by time.
    getalarm(id_param, time_param){

        return new Promise((res,rej)=>{
            getalarm.find({$or:[{id: id_param}, {time:time_param}]}, (err, data)=>{

                //error search in mlab
                if(err) 
                    rej(err);

                //JSON return empty
                if(data == 0) 
                    rej(`empty resualt: ${err}`);

                //seccess
                res(data);
            });
        });
    }

    //screen 3 - get all "send alarm" by user id.
    sendalarm(id_param){
        return new Promise((res,rej)=>{
            person.findOne({"id": id_param}, (err, data)=>{
                getalarm.find({_id: {$in: data.sendAlarm}}, (err, temp)=>{
                    res(temp);
                });
            });
        });
    }

    //--------------------------update methods-------------------------------
    //screen 1 - update setting by key:value
    updateperson(condition, update,opts, id_param){
        return new Promise((res,rej)=>{
            let duplicate = null;
            person.update(condition, update, opts, (err)=>{
                if(err){
                    console.log(err);
                    duplicate = err;
                }
                else
                    console.log('update succsess');
            });

            //just for browser - json update change resualt
            person.find({id:id_param}, (err, data)=>{

                //error search in mlab
                if(err) 
                    rej(err);

                //if id set is duplicate
                if(duplicate)
                    rej(duplicate);

                //JSON return empty
                if(data == 0) 
                    rej(`empty resualt: ${err}`);
            
                //seccess
                res(data);
            });
        });
    }

    //screen 2+3 - update alarm by key:value (send screen dependent in get update)
    updatealarm(condition, update,opts, id_param){
        return new Promise((res,rej)=>{
            let duplicate = null;
            getalarm.update(condition, update, opts, (err)=>{
                if(err){
                    console.log(err);
                    duplicate = err;
                }
                else
                    console.log('update succsess');
            });

            //just for browser - json update change resualt
            getalarm.find({_id:id_param}, (err, data)=>{
                //error search in mlab
                if(err) 
                    rej(err);

                //if id set is duplicate
                if(duplicate)
                    rej(duplicate);

                //JSON return empty
                if(data == 0) 
                    rej(`empty resualt: ${err}`);
            
                //seccess
                res(data);
            });
        });
    }

    //---------------------------insert method-----------------------------
    //screen 1 - insert user to collection (setting)
    insertuser(newPerson){
        return new Promise((res,rej)=>{

            //person
            var newperson = new person(newPerson);
           
           //create the person json
            newperson.save((err)=>{
                if(err)
                    rej(err)
                else{
                    res(this.getSetting(newPerson.id));
                }
            });
        });
    }

    //screen 2+3 - insert new alarm (& insert the send alarm by "alarm filter")
    insertalarm(newAlarm){
        return new Promise((res,rej)=>{
            let country, age, gender, temp;
            //new alarm
            var newalarm = new getalarm(newAlarm);
           
           //create new alarm json
           newalarm.save((err)=>{
                if(err)
                    rej(err)
                else{
                    console.log("save seccess");
                }
            });
           
            var string = newAlarm.filter.age;
            var numbers = string.match(/\d+/g).map(Number);

            //insert the new alarm by filter
            var query = {$and: [{"id"     :{$ne: newAlarm.id},
                                 "country": newAlarm.filter.country,
                                 "age"    : {$gt: numbers[0], $lt: numbers[1]},
                                 "gender" : newAlarm.filter.gender}]};
            var ddd = {$push: {"sendAlarm":newalarm._id}};
            person.updateMany(query, ddd, (err, dat)=>{
                res(dat);
            });
        });
    }

    //-------------------------------delete method-------------------------
    //screen 2+3 - Delete Alarm by id, deletes the alarm and all references from persons (in send alarm screen)
    deletealarm(id){
        return new Promise((res,rej)=>{
            //find the person who have this alaram (_id)
            person.find({sendAlarm: {$in: id}}, (err, temp)=>{
                if(err)
                    rej(err);
                //remove the alarm from send alarm array
                for(var i=0; i< temp.length;i++){
                    var newArray = temp[i].sendAlarm.filter(e => e !== id);
                    
                    //if the alarm not delete from send so is not Delete from alarm itself
                    this.updateperson({id: temp[i].id}, {sendAlarm: newArray}, {multi: true}, temp.id)
                    .then((data)=>{
                        console.log(`alarm ${id} was remove from send list`);
                    }).catch(err =>{
                        rej(err);
                    });
                }
                //remove the alarm
                getalarm.remove({_id: id}, (err)=>{
                    if(err)
                        rej(err);
                    else{
                        console.log("alarm remove")
                        res(temp);
                    }
                });
            });
        });
    }  



}






module.exports = () => {
    var Alarme = new AlarMe();
    return Alarme;
}