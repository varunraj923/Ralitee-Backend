const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://varunraj1545_db_user:nBW4IkSRVxBMzSVk@cultivated-harvest.id3j95f.mongodb.net/")

    }
    
    catch(error){
        console.log("DB connection error:",error);
    }
}

module.exports = connectDB;
