const mongoose=require('mongoose');
const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{

        type:String,
        required:true
    }
});

const adminModal=mongoose.model("admin",adminSchema);
module.exports=adminModal;