require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.db, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true}).then(()=>{
    console.log(`connection successful`);
}).catch((e)=>{
    console.log(`no connection`);
});

