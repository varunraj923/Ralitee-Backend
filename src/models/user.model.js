const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required: [true, "Name is required"],
        lowercase: true,
        trim: true,
    },
    username:{
        type:String,
        required:[true,"Username is required"],
        // unique: true,
        lowercase: true,
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        // unique:[true,"Email must be unique"],
        lowercase:true,
        trim:true

    },
    password:{
        type:String,
        required:[true,"Password is required"], 
    },
    role:{
        enum : ['user','admin'],
        default: 'user',
        type: String,
    }


}, {timeStamps:true});

const User = module.exports = mongoose.model('User', userSchema);
module.exports = User;