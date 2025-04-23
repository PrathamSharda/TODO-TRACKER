//  start from here
//inserting value in db
axios.defaults.withCredentials = true;
async function inserting(email,passwd){
    try{
        console.log(email,passwd);
    const response= await axios.post("http://localhost:3001/signup",
        {},{
            headers:
            {
            username:email,
            password:passwd
            }
    }
    
    )
            
if (response.status==200) {
    console.log("here");
    window.location.href = '/signin';
}
    console.log(response);
    return response;
}catch(error){
    console.log(error);
 
    const alert=document.querySelector(".alert");
        const inAlert=document.querySelector(".inAlert");
        alert.style.display="grid";
        let val;
        if(error.response.status==400)
        {
            val="user already exists, try sign in"
        }else{
            val="Error while signing up"
        }
        inAlert.textContent=val;
  
}
}

//verifying user and checking token
async function verify(email,passwd){
    try{
        const response=await axios.post("http://localhost:3001/signin",{},
            
            { 
                  

                headers:
                {
                username:email,
                password:passwd
                }
        }
        
        )
    
        
if (response.status==200) {
    console.log("here");
    window.location.href = '/home';
}
    }catch(error){
        const alert=document.querySelector(".alert");
        const inAlert=document.querySelector(".inAlert");
        alert.style.display="grid";
        let val="error";
        try{
        if(error.response.status==406){
                 val="wrong password";
            }
        else if(error.response.status==409){
            val="username you enetered does not exist";
       }
        else{
                val="error while logging in";
            }
        }
        catch(error){
            val="error loging in";
        }
        inAlert.textContent=val;
        
    }
}

async function signup(){
    const email=document.querySelector(".email").value;
    const password=document.querySelector(".pswd").value;
    if(email==""||password==""){
        const alert=document.querySelector(".alert");
        const inAlert=document.querySelector(".inAlert");
        alert.style.display="grid";
        inAlert.textContent="Please check again, you have missed the email or password";
    }else{
    
    let val=await inserting(email,password);
    
    }
}
async function signin(){
    const email=document.querySelector(".email").value;
    const password=document.querySelector(".pswd").value;
    if(email==""||password==""){
        const alert=document.querySelector(".alert");
        const inAlert=document.querySelector(".inAlert");
        alert.style.display="grid";
        inAlert.textContent="Please check again, you have missed the email or password";
    }else{
   
        let ver=await verify(email,password);
        
    }
}

function hide(){
    const alert=document.querySelector(".alert");
    alert.style.display="none";
}