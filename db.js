const mongoose=require("mongoose");

const schema=mongoose.Schema;

const objectId=schema.ObjectId;

const user=new schema({
    username:{type:String,unique:true},
    password: String
})


const todo=new schema({
    task:String,
    done:String,
    ObjectId:objectId
})


const userModel=mongoose.model('users',user);
const todoModel=mongoose.model('todos',todo);

module.exports={
    userModel,
    todoModel
}