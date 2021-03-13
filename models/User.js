const mongoose=require("mongoose");
const UserSchema= new mongoose.Schema({
    firstname:{
        type:String,
        requried:true
    },
    lastname:{
        type:String,
        requried:true
    },
    number:{
        type:String,
        requried:true
    },
    email:{
        type:String,
        requried:true,
        unique:true
    },  
    password:{
        type:String,
        requried:true
    },
    date:{
        type:Date,
        default:Date.now
    }
    
})
module.exports=User=mongoose.model('user',UserSchema);