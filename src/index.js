const express = require('express');
const connectDB = require('./db/connection.js');
const env = require('dotenv');
const authRouter = require('./routes/auth.js');
const cookieParser = require('cookie-parser');
 require("dotenv").config();
const app = express();
const productRouter = require('./routes/product.js');


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/",productRouter);

//database connection and server configuration

connectDB().then(()=>{
    console.log("DB connected successfully");
    app.listen(PORT,()=>{
        console.log(`Server is listening at port ${PORT}`);
    })
}).catch((err)=>{
    console.log("DB connection error:",err);
})




