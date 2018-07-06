var mongoose   = require('mongoose'),
    schema  = new mongoose.Schema({
        id:Number, 
        time: String,
        active: Boolean,
        morningAwakning: Boolean,
        filter: {country: String, gender: String, age: String},
        repeat: [String],
        creatorName:String,
        creatorAge: Number,
        sleepTime: String,
    },{collection: 'Alarms'});

module.exports = mongoose.model('getalarms', schema);