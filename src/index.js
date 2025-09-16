const express = require('express');
const connectDB = require('./db/connection.js');
const env = require('dotenv');
 
const app = express();
env.config();

const PORT = process.env.PORT || 3000;

app.post('/hello',(req,res)=>{
    res.send("OM Ganeshaaiye namah");
})

//database connection and server configuration

connectDB().then(()=>{
    console.log("DB connected successfully");
    app.listen(PORT,()=>{
        console.log(`Server is listening at port ${PORT}`);
    })
}).catch((err)=>{
    console.log("DB connection error:",err);
})




