const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const { authValidation } = require("../utils/validation.js");
require("dotenv").config();

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
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

module.exports = authRouter;
