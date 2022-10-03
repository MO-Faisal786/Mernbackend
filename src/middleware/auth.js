const jwt = require('jsonwebtoken'); 
const Register = require('../models/registers');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // take token from the logged in device
        const varifyUser = jwt.verify(token, process.env.SECRET_KEY); // varify the token  it returns user id 
        // console.log(varifyUser);

        const user = await Register.findOne({_id:varifyUser._id}); //  find the user data in database by varify id
        // console.log(user);

        req.token = token; // take the token value of device
        req.user = user; // take the user data from the database

        next(); // next function is used to run next function of middleware
    } catch (error) {
        res.render("login");
    }
}

module.exports = auth; // export the module