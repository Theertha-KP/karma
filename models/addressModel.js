const mongoose = require('mongoose')
addressSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    address:[{
        fname : {
            type:String
        },
        lname : {
            type:String
        },
        phone:{
            type:Number
        },
        address:{
            type : String
        },
        place:{
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
        },
        additionalinfo:{
            type:String
        },
        email:{
            type:String        
        },
        addresstype:{
            type:String
        }

    }]
})

module.exports = mongoose.model("Address",addressSchema);