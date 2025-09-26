const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found in the database" });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error(err);
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = userAuth;
