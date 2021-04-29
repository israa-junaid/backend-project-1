require('dotenv').config()
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");

const static_path= path.join(__dirname,"../public");
const template_path= path.join(__dirname,"../templates/views");
const partials_path= path.join(__dirname,"../templates/partials");
const Register = require("./models/registers");

//console.log(process.env.SECRET_KEY);


app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(static_path));

app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{
    res.render("index")
});

app.get("/secret",auth ,(req,res)=>{
	//console.log(`Cookie = ${req.cookies.jwt}`);
    res.render("secret")
});

app.get("/logout",auth ,async(req,res)=>{
	try{
		// console.log(req.user);
		// //logout from only one device
		req.user.tokens = req.user.tokens.filter((currEle)=> {
			return currEle.token !== req.token
		})
		
		//logout from all devices
		//req.user.tokens = [];
		res.clearCookie("jwt");
		console.log("logout Successfully")
		
		await req.user.save();
		res.render("login");

	}catch (err){
		res.status(500).send(err);
	}
	
});

app.get("/register",(req,res)=>{
    res.render("register");
});
app.get("/login",(req,res)=>{
    res.render("login");
});

//creating a new user in DB
app.post("/register", async (req,res)=>{
	try{
		const password = req.body.password;
		const cpassword= req.body.confirmpassword;
	if(password === cpassword) {
		const registerEmployee = new Register({
		firstname:req.body.firstname,
		lastname:req.body.lastname,	
		email:req.body.email,	
		gender:req.body.gender,
		phone:req.body.phone,
		age:req.body.age,
		password:req.body.password,	
		confirmpassword:req.body.confirmpassword
  })
  	  
      console.log("Successful Part : "+ registerEmployee);
  	  
	  const token = await registerEmployee.generateAuthToken();	 
	  console.log("The token is :"+ token)
      
	 //cookie
	 res.cookie("jwt", token,{
		 expires: new Date(Date.now() + 600000),
		 httpOnly: true
	 });
	 console.log(cookie); 
	 
	  const registered = await registerEmployee.save();
	  console.log("The Page is :"+ registered);

      res.sendStatus(201).render("index")
}  else{

	res.send("Wrong Password");

} 
}catch (err) { 
res.status(400).send(err);
console.log("Error generated")
}	
})

//login validation
app.post("/login",async (req,res)=>{
    try{
		const email = req.body.email;
		const password = req.body.password;
		// console.log(`${email} and Pw: ${password}`)

		const userEmail = await Register.findOne({email:email});
		const isMatch = await bcrypt.compare(password, userEmail.password)
		
		const token = await userEmail.generateAuthToken();	 
		console.log("The token is :"+ token)

		 //cookie storing
		 res.cookie("jwt", token,{
			expires: new Date(Date.now()+700000),
			httpOnly: true
		});
		//console.log(cookie); 
		
		if(isMatch){
			res.status(201).render("index");
		}else {
			res.send("Invalid Password ")
		}
		
	} catch (err){
		res.status(400).send("Invalid login details");
	}
})


app.listen(port, ()=>{
    console.log(`server running at port ${port}`);
})



