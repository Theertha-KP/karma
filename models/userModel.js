const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
   
  },
  
  mobilenumber: {
    type: String,
    
  },
  dateofbirth: {
    type: Number,
  },
  address: {
    type: Array,
  },
  password: {
    type: String,
  },
  createddate: {
    type: Date,
  },
  updated: {
    type: Date,
  },
  cart: {
    type: Array,
   default:[]
},
is_verified:{
    type: Boolean,
    default:0
},
is_blocked:{
    type: Boolean,
    default:0
},
address:{
    type: String
},
wishlist:[{
   type:mongoose.Schema.Types.ObjectId,ref:"Product"
}]
})

const userModal = mongoose.model("user", userSchema,);
module.exports = userModal;

