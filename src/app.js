require('dotenv').config(); // To use .env file and hide privet data from other
const express = require("express");// express framework
const path = require("path"); // path module to determine path
const app = express(); // initilization of express app
const hbs = require("hbs"); // templete handlebars 
const bcript = require("bcrypt"); // bcrypt library to hash password
const cookieParser = require('cookie-parser'); // cookie parser to delete cookie
require("./db/conn"); // importing database connection file
const Register = require('./models/registers'); // to import model 
const auth = require('./middleware/auth'); // middleware auth to user authenticate

const port = process.env.PORT|| 3000;

const static_path = path.join(__dirname, "../public"); // defining stetic path
const templete_path = path.join(__dirname, "../templetes/views"); // defining templete path
const partials_path = path.join(__dirname, "../templetes/partials");// defining partials path

app.use(express.json()); // to use json 
app.use(express.urlencoded({extended: false}));
app.use(express.static(static_path)); // to use static path
app.use(cookieParser());// to use cookie parser
app.set("view engine", "hbs"); // setting view engine
app.set("views", templete_path); // setting up templete path
hbs.registerPartials(partials_path); // to set partial path

app.get("/", auth, (req, res)=>{
    res.render("index");
}); // home page 

app.get("/secret", auth, (req, res)=>{

    // console.log(req.cookies.jwt);

    res.render("secret");
}); // this is secret page

// logout fron current device 
app.get("/logout", auth, async(req, res)=>{
    try {
        // console.log(req.user);
        req.user.tokens = req.user.tokens.filter((currElem) => {
            return currElem.token !== req.token;
        });

        res.clearCookie("jwt");

        console.log("Log Out sucessfully...");

        await req.user.save(); // to save data in the database

        res.render("login");


    } catch (error) {

        res.status(500).send(error.message);
    }
});


// log out from all device
app.get("/logoutfromall", auth, async(req, res)=>{
    try {
       
        req.user.tokens = []; 
        res.clearCookie("jwt");

        console.log("Log Out sucessfully...");

        await req.user.save();

        res.render("login");


    } catch (error) {

        res.status(500).send(error.message);
    }
});

app.get("/register", (req, res)=>{
    res.render("register"); // render the register page
});


// taking data from form to save in the database
app.post("/register", async(req, res)=>{
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        if(password === confirmpassword){ // check pass and confirmpass
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                // gender : req.body.gender,
                phone : req.body.phonenumber,
                age : req.body.age,
                password : req.body.password,
                confirmpassword : req.body.confirmpassword,
            });


        const token = await registerEmployee.generateAuthToken(); // middleware function to generate token
        // console.log(token);


        // creating cookie
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 50000000),
            httpOnly:true
        }); 

        // save data into the database
        const registered = await registerEmployee.save();
        console.log(registered); // registered has all data of user
        res.status(201).render("index");
        } else {
            res.send("password not matched");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});


// log in page 
app.get("/login", (req, res)=>{
    res.render("login");
});


// // log in check
app.post("/login", async(req, res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await Register.findOne({email});
        
        // if(user.password === password){
        //     res.status(201).render("index");
        // } else {
        //     res.send("Invalid log in details");
        // };

        const isMatch = await bcript.compare(password, user.password);// ccomparing password to log in 
        const token = await user.generateAuthToken(); 
        // console.log(token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 30000),
            httpOnly:true
        });

        
        if(isMatch){
            res.status(201).render("index");
        } else {
            res.send("Invalid log in details");
            console.log("invalid");
        };
    } catch (error) {
        res.status(400).send("Invalid log in details");
        console.log("non");
    }
});


// // // How to use JWT(jsonwebtoken)
// const jwt = require('jsonwebtoken');

// const createToken = async () => {
//     const token = await jwt.sign({ _id: "63368a3e96c8cc31844cf219" }, "qwertyuiopasdfghjklzxcvbnmqwertyuiop",{
//         expiresIn: "2 seconds"
//     });
//     console.log(token);

//     const userver = await jwt.verify(token, "qwertyuiopasdfghjklzxcvbnmqwertyuiop");
//     console.log(userver);
// }






// createToken();












app.listen(port, ()=>{
    console.log(`Server is running at ${port}`);
});