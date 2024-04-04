const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;
const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
   
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
   
  },
  
  mobilenumber: {
    type: String
    
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
   type:mongoose.Schema.Types.ObjectId,ref:"products"
}],
wallet :{
  type : Number,
  default :0
},
walletApplied :{
  type:Boolean,
  default :false
},
walletHistory:[{
  transactionType: String,
  method: String,
  amount: Number,
  date: Date,
}]  
})

const userModal = mongoose.model("user", userSchema,);
module.exports = userModal;

