const mongoose = require('mongoose')
addressSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    address:[{
        name : {
            type:String
        },
        phone:{
            type:Number
        },
        address:{
            type : String
        },
        locality:{
            type:String
        },
        pincode : {
            type : Number
        },
        city:{
            type :String
        },
        state:{
            type : String
        }
    }]
})

module.exports = mongoose.model("Address",addressSchema);