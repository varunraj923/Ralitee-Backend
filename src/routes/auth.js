const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const { authValidation } = require("../utils/validation.js");
require("dotenv").config();
const userAuth = require('../middleware/auth.middleware.js');

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // 🔍 CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          message: "Email is already registered"
        });
      }

      if (existingUser.username === username) {
        return res.status(409).json({
          message: "Username is already taken"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {

    // 🛑 SAFETY NET (duplicate key error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});



 authRouter.post("/login", async (req, res) => {
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

  authRouter.get("/me",userAuth,async(req,res)=>{
    try{
      res.json({data : req.user});

    }catch(error){
      throw new Error('error in fetching the profile',error.message);
    }
  })

  authRouter.post('/logout', userAuth, async(req,res) =>{
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
