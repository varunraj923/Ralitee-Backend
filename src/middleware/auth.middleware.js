const jwt = require('jwt');
import { models } from 'mongoose';
const User =  require('../models/user.model')
require("dotenv").config();

const userAuth = (req,res,next) =>{
    try{
        const {token} = req.cookies;
        console.log(token);

        if(!token){
            throw new Error('user not found');
        }

        const decodeObj = jwt.verify(token, process.env.JWT_SECRET);
        const user = User.findById(decodeObj._id);
        if(!user){
            throw new Error('user not found in the database');
        }

        req.user = user;

        next();

    }catch(err){
        console.error(err);
        req.status(400).send('Error' + err.message)
    }
}

module.exports = {userAuth}