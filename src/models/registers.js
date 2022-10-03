const mongoose = require('mongoose');
const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');

// Defining the schema to validate user data 
const employeeShema = new mongoose.Schema({
    firstname : {
        type : String,
        required : true
    },

    lastname : {
        type : String,
        required : true
    },
    
    email : {
        type : String,
        required : true,
        unique : true
    },

    // gender : {
    //     type : String,
    //     required : true
    // },

    phone : {
        type : Number,
        required : true,
        unique : true
    },
    
    age : {
        type : Number,
        required : true,
    },
    
    password : {
        type : String,
        required : true,
    },

    confirmpassword : {
        type : String,
        required : true
    },

    tokens : [{
        token :{
            type : String,
            required : true
        }
    }]
    
});


// generating token middleware
employeeShema.methods.generateAuthToken = async function(){
    try {
        const token = await jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;

    } catch (error) {
        console.log("this is the error");
    }
}

// converting password into hash by bcrypt
employeeShema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcript.hash(this.password, 10);
        this.confirmpassword = await bcript.hash(this.password, 10);
    }
     
    next();
})

// we need to create a collections
const Register = new mongoose.model("Register", employeeShema);

module.exports = Register;