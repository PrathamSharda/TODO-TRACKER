//dependencies  jsonwebtoken, dotenv
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv");

function authentication(req,res,next){
    dotenv.config();
    const secretKey=process.env.secretKey;
    const token=req.cookies.token;
    const verify=jwt.verify(token,secretKey);
    if(!verify){
        console.log("redirected from auth.js");
        res.redirect("/auth");
    }
    const decode=jwt.decode(token);
    req.userid=decode.username;
    console.log(decode.username);
    next();
}

module.exports={
    authentication
}
