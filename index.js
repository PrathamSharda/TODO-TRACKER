const express=require("express");
const jwt=require("jsonwebtoken");
const cookieparser=require("cookie-parser");
const cors=require("cors");
const fs=require("fs");
const dotenv=require("dotenv");
const path = require('path');
const {authentication}=require("./auth/auth");
const {z}=require("zod");
const bcrypt=require("bcrypt");
const mongoose=require("mongoose");
dotenv.config();
const secretKey=process.env.secretKey;

let Data=[];

const app=express();

app.use('/auth', express.static(path.join(__dirname, 'frontend/auth')));
app.use('/todo', express.static(path.join(__dirname, 'frontend/todo')));
app.use(express.json());
app.use(cors({

    origin:["http://127.0.0.1:5501","http://127.0.0.1:5500"],
    credentials: true 
    
}));
app.set("view engine","ejs")

const mongoDB=process.env.mongoID;

//middlewares

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Reduce timeout for faster error feedback
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  const {userModel,todoModel}=require("./db");

app.use(cookieparser());


//code for hosting /displaying website

app.get("/",function(req,res){
    const token=req.cookies.token;
    if(token){
    const verify=jwt.verify(token,secretKey);
    if(verify){
        res.redirect("/home");
    }else{
        console.log("redirect from index.js");
        res.redirect("/auth");
    }
}
else{
    res.redirect("/auth");
}
})
app.get("/signup", function(req, res) {
    res.render("index"); // Your signup form is in index.ejs
});

app.get("/signin", function(req, res) {
    res.render("signin");
});

app.get("/auth", function(req, res) {
    res.redirect("/signup");
});


//starting of logic

app.post("/signup",async function(req,res){
    try{
    const username=req.headers.username;
    const password=req.headers.password;

    const inputval=z.object({
        username:z.string().email().max(100),
        password:z.string().max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$])[a-zA-Z\d!@#$]{8,}$/,"must include lowercase,uppercase,special character,number,and minimum8 letters")
    })



    const resp=inputval.safeParse({
        username:username,
        password:password
    })
    if(!resp.success)throw resp.error;

    const hashedp=await bcrypt.hash(password,5);
    
    await userModel.create({
        username:username,
        password:hashedp
    })
    res.send("okay");

}
catch(error){

        console.log(error);
        res.status(503).send("error while signin up");
    
}   
})
app.post("/signin",async function(req,res){
    try{
    const username=req.headers.username;
    const password=req.headers.password;

    
    
    const inputval=z.object({
        username:z.string().email().max(100),
        password:z.string().max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$])[a-zA-Z\d!@#$]{8,}$/,"must include lowercase,uppercase,special character,number,and minimum8 letters")
    })
    const resp=inputval.safeParse({
        username:username,
        password:password
    })
    if(!resp.success)throw resp.error;

    const finder=await userModel.findOne({
        username:username,
        
    })
    if(!finder)throw "user not not found";
    const compare=bcrypt.compare(finder.password,password);
     const newToken=jwt.sign({
                username:finder._id
        },secretKey);
        res.cookie("token",newToken,{
            httpOnly:true
        });
        res.send("login sucess");
        //res.redirect("/reload");
}
    
catch(error){
    console.log(error);
    if(error=="corrupted token")
    {
        
        res.status(401).send("error");

    }else if (error=="wrong password"){
        res.status(406).send(error);
    }
    else if(error=="c")
    {
        
        res.status(409).send(error);

    }else{
        
        res.status(503).send("error while signing in");
    }
}
})
app.get("/home",function(req,res){
    const token=req.cookies.token;
    if(!token)res.redirect("/auth");
    res.render("todo");
})
app.get("/reload",authentication,async function(req,res){

  

    try{
        console.log("here");
        const objectId=req.userid;
        console.log(objectId)
        const task=await todoModel.find({
            ObjectId:objectId
        }
        )
        let tasks=[];
        task.forEach((u)=>{
            tasks.push({
                message:u.task,
                done:u.done
            })
        })
        console.log(tasks);
            res.json(
                {
                    message:tasks
                }
            );
       
    
}catch(error){
    res.status(503).send(error);
}
    

})
app.use(express.json());

app.post("/add",authentication,async function(req,res)
{
    try{

        const objectId=req.userid; 
        console.log (objectId);
        const data=req.body.value;
        const inserting=await todoModel.create({
            task:data,
            done:"0",
            ObjectId:objectId
        })
        if(!inserting )throw "was not able to insert";
        res.send("sucess");
    }catch(error){
        console.log(error);
        if(error=="connot find user")
            res.status(401).send("cannot find user")
        else if(error=="coruupted")
            res.status(403).send("currpted");
        else
            res.status(503).send("server error");
    }
})
app.post("/markCompleted",authentication,async function(req,res){
    try
    {
        const objectId=req.userid;
        const data=req.body.value;
        const filter={task:data,done:"0",ObjectId:objectId};
        const update={done:"1"};
        const find=await todoModel.findOneAndUpdate(filter,update,{
            new:true
        })
        if(!find)throw "data doesnt exist";
        console.log(find);
        res.send("sucess");

    }
    catch (error)
    {
    console.log(error);
    res.status(500).send("Server error while deleting value");
    
    }
});
app.post("/deletetodo",authentication,async function(req,res){
    try
    {

        const objectId=req.userid;
        const data=req.body.value;
        const resp=await todoModel.deleteOne({
                task:data,
                done:"0",
                ObjectId:objectId
        })
        if(!resp)throw "couldnt delete the value";
        
        res.send("success");
    }
    catch(error)
    {
        res.status(503).send(error);
    }
})

app.post("/ReversetoTodo",authentication,async function(req,res){
    try{
        const objectId=req.userid;
        const data=req.body.value;
        const filter={task:data,done:"1",ObjectId:objectId};
        const update={done:"0"};
        const find=await todoModel.findOneAndUpdate(filter,update,{
            new:true
        })
        if(!find)throw "data doesnt exist";
        console.log(find);
        res.send("sucess");
} catch (error) {
    console.log(error);
    res.status(500).send("Server error while deleting value");
}
});
app.post("/deleteCompleted",authentication,async function(req,res){
    try
    {

        const objectId=req.userid;
        const data=req.body.value;
        const resp=await todoModel.deleteOne({
                task:data,
                done:"1",
                ObjectId:objectId
        })
        if(!resp)throw "couldnt delete the value";
        
        res.send("success");
    }
    catch(error)
    {
        res.status(503).send(error);
    }
});
app.delete("/logout",function(req,res){
    res.clearCookie("token");
    res.send("sucess");
})
app.listen(3001);
