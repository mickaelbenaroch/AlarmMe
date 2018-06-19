var mongoose   = require('mongoose'),
    schema  = new mongoose.Schema({
            id: {type: Number, unique:true, index:1},
            fullName: String,
            pic: String,
            age: Number,
            country: String,
            gander: String,
            sendAlarm:[String],
            setting:{
                stars: Number,
                reviews: Number,
                nationalRington: Boolean,
                friendAlert: Boolean,
                morningTip: String,
            }
    },{collection: 'PersonProfile'});

module.exports = mongoose.model('Person', schema);