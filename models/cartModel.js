const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    product:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        count:{
            type:Number
            
        },
        price:{
            type:Number,
        }
    }],
    isCouponApplied:{
        type : String
    }
   
})

const cart = new mongoose.model("cart", cartSchema);
module.exports = cart;
