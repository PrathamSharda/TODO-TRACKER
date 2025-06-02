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
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://www.prathamsharda.github.io"  // Replace with your GitHub Pages domain
    ],
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
        if(!resp.success) {
            const errors = resp.error.errors.map(err => err.message).join(', ');
            return res.status(400).json({ 
                message: errors
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ 
                message: "This email is already registered. Please sign in instead."
            });
        }
else{
        const hashedp=await bcrypt.hash(password,5);
        
       const newUser= await userModel.create({
            username:username,
            password:hashedp
        });

        // Create and set token after successful signup
        const newToken=jwt.sign({
            username:newUser._id
        },secretKey);
        
        res.cookie("token",newToken,{
           // httpOnly: true,
            //secure: true,
            //sameSite: 'none',
//domain: 'prathamsharda.github.io'
        });
        
        
            res.send("success");
        
    }
    } catch(error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "This email is already registered. Please sign in instead."
            });
        } else {
            return res.status(503).json({ 
                message: "An error occurred while signing up. Please try again."
            });
        }
    }   
});

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
        if(!resp.success) {
            const errors = resp.error.errors.map(err => err.message).join(', ');
            return res.status(400).json({ 
                message: errors
            });
        }

        const finder=await userModel.findOne({
            username:username
        })
        if(!finder) {
            return res.status(404).json({ 
                message: "User not found. Please sign up first."
            });
        }

        const compare = await bcrypt.compare(password, finder.password);
        if (!compare) {
            return res.status(401).json({ 
                message: "Incorrect password. Please try again."
            });
        }

        const newToken=jwt.sign({
            username:finder._id
        },secretKey);
        
        res.cookie("token",newToken,{
           // secure: true,
           // sameSite: 'none',
           // domain: 'prathamsharda.github.io'
        });
        
       
        res.send("success");
        
    } catch(error) {
        console.log(error);
        return res.status(503).json({ 
            message: "An error occurred while signing in. Please try again."
        });
    }
});

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

app.post("/add",authentication,async function(req,res) {
    try {
        const objectId = req.userid;
        const data = req.body.value;

        if (!data || typeof data !== 'string' || data.trim().length === 0) {
            return res.status(400).send("Task cannot be empty");
        }

        const inserting = await todoModel.create({
            task: data.trim(),
            done: "0",
            ObjectId: objectId
        });

        if (!inserting) {
            throw new Error("Failed to add task");
        }

        res.send("sucess");
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(503).send(error.message || "Server error");
    }
});
app.post("/markCompleted",authentication,async function(req,res){
    try {
        const objectId=req.userid;
        const data=req.body.value;
        const filter={task:data,done:"0",ObjectId:objectId};
        const update={done:"1"};
        const find=await todoModel.findOneAndUpdate(filter,update,{
            new:true
        })
        if(!find) throw new Error("Task not found");
        res.json({ success: true, message: "Task completed successfully" });
    } catch (error) {
        console.log(error);
        res.status(503).json({ 
            success: false, 
            message: error.message || "Failed to complete task. Please try again." 
        });
    }
});
app.post("/deletetodo",authentication,async function(req,res){
    try {
        const objectId=req.userid;
        const data=req.body.value;
        const resp=await todoModel.deleteOne({
            task:data,
            done:"0",
            ObjectId:objectId
        })
        if(resp.deletedCount === 0) throw new Error("Task not found");
        res.json({ success: true, message: "Task deleted successfully" });
    } catch(error) {
        res.status(503).json({ 
            success: false, 
            message: error.message || "Failed to delete task. Please try again." 
        });
    }
})

app.post("/ReversetoTodo",authentication,async function(req,res){
    try {
        const objectId=req.userid;
        const data=req.body.value;
        const filter={task:data,done:"1",ObjectId:objectId};
        const update={done:"0"};
        const find=await todoModel.findOneAndUpdate(filter,update,{
            new:true
        })
        if(!find) throw new Error("Task not found");
        res.json({ success: true, message: "Task reversed successfully" });
    } catch (error) {
        console.log(error);
        res.status(503).json({ 
            success: false, 
            message: error.message || "Failed to reverse task. Please try again." 
        });
    }
});
app.post("/deleteCompleted",authentication,async function(req,res){
    try {
        const objectId=req.userid;
        const data=req.body.value;
        const resp=await todoModel.deleteOne({
            task:data,
            done:"1",
            ObjectId:objectId
        })
        if(resp.deletedCount === 0) throw new Error("Task not found");
        res.json({ success: true, message: "Completed task deleted successfully" });
    } catch(error) {
        res.status(503).json({ 
            success: false, 
            message: error.message || "Failed to delete completed task. Please try again." 
        });
    }
});
app.delete("/logout",function(req,res){
    res.clearCookie("token");
    res.send("sucess");
})
app.listen(3001,()=>{
    console.log("listen at 3001");
});
