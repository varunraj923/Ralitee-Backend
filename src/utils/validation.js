const validator = require('validator');


const authValidation = (req)=>{
    const {name,username,email,password} = req.body;

    if(!name.trim()){
        throw new Error('Name is required')
    }

    if(!username.trim()){
        throw new Error('Username is required');
    
    }

    if(!validator.isEmail(email.trim())){
        throw new Error('Enter a valid email address');

    }

    if(!validator.isStrongPassword(password.trim())){
        throw new Error('Password is not strong enough');
    }   
}

module.exports = {authValidation};
