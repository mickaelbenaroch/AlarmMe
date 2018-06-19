var express     = require('express'),
    app         = express(),
    bodyparser  = require('body-parser'),
    module      = require('./module'),
    port        = process.env.PORT || 3030;
    
//open routing listening
app.listen(port, ()=>{
    console.log(`listern to port ${port}`);
});

//create new class (class work on db and return json file)
var person = module();

//parsing application json & x-www-form-urlencoded
app.use(bodyparser.json());                             
app.use(bodyparser.urlencoded({extended: true}));

//first routing, all request inside this routing 
app.all('*', (req, res, next)=>{
    console.log("Connect To The Server");
    req.next();                                     
});

///////////////////////////////////////// ------   CRUD -----   ///////////////////////////////////////////////
///////////////////////////////////////////////// 1. Read data from DB

//screen 1: get setting by id 
app.get('/Setting', (req, res)=>{

    //read get id parameter
    var id   = req.query.id,
        name = req.query.fullName;      

    person.getSetting(id, name).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({setting: data[0].setting, id: data[0].id, fullName: data[0].fullName });  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});

//screen 2: get all "alarm" screen by user id or by time
app.get('/getalarm', (req, res)=>{
    //read get parameter
    var id   = req.query.id,
        time = req.query.time;     

    person.getalarm(id, time).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({getAlarm: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});

//screen 3: get all "send alarm" by id or by full name
app.get('/sendalarm', (req, res)=>{

    //read get parameter
    var id   = req.query.id,
        name = req.query.fullName;     

    person.sendalarm(id, name).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({sendAlarm: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});



///////////////////////////////////////////////// 2. update data from DB
//screen 1 - update setting + person
app.get('/updatesetting', (req, res)=>{
    //dynamic key function to update json by key
    function keyChack(key){
        return `${key}`;
    }

    var condition = {id: req.query.id},
        update    = {[req.query.keyupdate]: req.query.valueupdate},
        opts      = {multi:true};

        console.log(update);

    person.updateperson(condition, update, opts,  req.query.id).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({updatedperson: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});

//screen 2+3 - update alarm by key:value (send screen dependent in get update)
app.get('/updatealarm', (req, res)=>{

    //dynamic key function to update json by key
    function keyChack(key){
        return `${key}`;
    }

    var condition = {_id: req.query.id},
        update    = {[req.query.keyupdate]: req.query.valueupdate},
        opts      = {multi:true};

        console.log(update);

    person.updatealarm(condition, update, opts,  req.query.id).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({updatedalarm: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});


///////////////////////////////////////////////// insert data to DB collection
//screen 1 - insert new user + setting collection
app.get('/insertperson', (req, res)=>{

    //create new person object
    var newPerson = {
        id: req.query.id,
        fullName: req.query.fullName,
        age: req.query.age,
        pic: req.query.pic,
        country: req.query.country,
        gander: req.query.gander,
        sendAlarm: [],
        setting:  {
            stars: 0,
            reviews: 0,
            nationalRington:  false,
            friendAlert: false,
            morningTip: "Hello"
        }
    }

    console.log(newPerson);
    person.insertuser(newPerson).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({insertPerson: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});

//screen 2+3 - insert new alarm (& insert the send alarm by "alarm filter")
app.get('/insertalarm', (req, res)=>{
    //create new alarm object
    var newAlarm = {
        id: req.query.id,
        time: req.query.time,
        active: req.query.active,
        morningAwakning: req.query.morningAwakning,
        repeat: [req.query.repeat],
        filter:  {
            country: req.query.country,
            gender: req.query.gender,
            age: req.query.age
        }
    }

    person.insertalarm(newAlarm).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({insertPerson: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});

///////////////////////////////////////////////// delete data to DB collection
//screen 2+3 - Delete Alarm by id, deletes the alarm and all references to it into persons (in send alarm screen)
app.get('/deleteal', (req, res)=>{
    //read get parameter
    var id   = req.query.id;    

    person.deletealarm(id).then((data)=>{
        app.set('json spaces', 4);
        res.status(200).json({sendAlarm: data});  
        res.end();
    }).catch (err => {
        res.status(500).json({error: err});
    });  
});

