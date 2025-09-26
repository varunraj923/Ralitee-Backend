const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const { authValidation } = require("../utils/validation.js");
require("dotenv").config();
const userAuth = require('../middleware/auth.middleware.js');

const authRouter = express.Router();

authRouter.post("/auth/register", async (req, res) => {
  try {
    authValidation(req);
    const { name, username, email, password, role } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: passwordHash,
      role,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token);

    res.json({ "user saved successfully": savedUser });
  } catch (error) {
    console.log("something went wrong while registering user:", error);
    res.status(500).json({ error: error.message });
  }

 
});

 authRouter.post("/auth/login", async (req, res) => {
    try {
    //   authValidation(req);
      const { email, password } = req.body;

      const user = await User.findOne({ email: email });

      if (!user) {
        throw new Error("User not found with this email");
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      if (user && isPasswordValid) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        res.cookie("token", token);
        res.json({ message: "Login successful", user, token });
      }
    } catch (error) {
      console.log("something went wrong while logging in:", error);
      res.status(500).json({ error: error.message });
    }
  });

  authRouter.get("/auth/me",userAuth,async(req,res)=>{
    try{
      res.json({data : req.user});

    }catch(error){
      throw new Error('error in fetching the profile',error.message);
    }
  })

  authRouter.post('/auth/logout', userAuth, async(req,res) =>{
    res.cookie("token",null),{
      expires: new Date(Date.now())
    }
    res.send(req.user.name + " " + "logout successfully");
  })

  //delete accout api 
  authRouter.delete('/delete/users/:id', async(req,res)=>{
    try{
    const userId = req.params.id;
    const user = await User.findById(userId);

    if(!user){
      return res.status(404).json({ error: "User not found in the database" });
    }
    await User.findByIdAndDelete(userId);

    res.send(req.user.name + " " + "deleted successfully");

    }catch(error){
      console.error(error);
      return res.status(404).json({message : "something went wrong while deleting user "})
    }
   
  })

  //

authRouter.put("/update/user/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true, select: "-password" } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});



module.exports = authRouter;
