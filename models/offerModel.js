const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;
const offerSchema = new mongoose.Schema({
    offerTitle:{
       type:String,
       required:true 
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    offerDetails:{
        type:String,
        required:true
    },
    discountType:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    offerType:{
        type:String,
        required:true
    },
    applicables:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }]
})
const offer = new mongoose.model("offer", offerSchema);
module.exports = offer;