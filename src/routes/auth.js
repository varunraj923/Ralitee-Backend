const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user.model.js");
const { authValidation } = require("../utils/validation.js");
const sendEmail = require("../utils/sendEmail.js");
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

authRouter.get("/me", userAuth, async (req, res) => {
  try {
    res.json({ data: req.user });

  } catch (error) {
    throw new Error('error in fetching the profile', error.message);
  }
})

authRouter.post('/logout', userAuth, async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.send(req.user.name + " " + "logout successfully");
})

//delete accout api 
authRouter.delete('/delete/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found in the database" });
    }
    await User.findByIdAndDelete(userId);

    res.send(req.user.name + " " + "deleted successfully");

  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "something went wrong while deleting user " })
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

authRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    res.json({ message: "Password reset successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }

})

// ========== FORGOT PASSWORD (send email with reset link) ==========
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash and store on user
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Build reset URL (frontend)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Send email
    await sendEmail({
      email: user.email,
      subject: "Ralitee – Password Reset",
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <!-- Header with golden gradient -->
          <div style="background:linear-gradient(135deg,#f5c842,#e6a817);padding:32px 24px;text-align:center">
            <img src="https://res.cloudinary.com/dlanyava0/image/upload/ralitee/logo.jpg" alt="Ralitee" style="height:70px;object-fit:contain" />
          </div>

          <!-- Body -->
          <div style="padding:36px 32px 28px">
            <!-- Lock icon + heading -->
            <div style="text-align:center;margin-bottom:28px">
              <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:#f0fdf4;margin-bottom:16px">
                <span style="font-size:28px">🔒</span>
              </div>
              <h2 style="margin:0;color:#1a1a1a;font-size:22px;font-weight:700">Password Reset Request</h2>
              <p style="margin:8px 0 0;color:#6b7280;font-size:14px">We received a request to reset your password</p>
            </div>

            <!-- Greeting -->
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px">
              Hi <strong style="color:#166534">${user.name}</strong>,
            </p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px">
              Click the button below to create a new password for your Ralitee account. This link will expire in <strong>15 minutes</strong> for your security.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#22863a,#166534);color:#ffffff;font-weight:600;text-decoration:none;border-radius:10px;font-size:16px;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(22,101,52,0.3)">
                🔑 &nbsp;Reset Password
              </a>
            </div>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />

            <!-- Security note -->
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px">
              <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5">
                <strong>Didn't request this?</strong> You can safely ignore this email. Your password will not be changed.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6">
            <p style="margin:0 0 4px;color:#166534;font-size:13px;font-weight:600;font-style:italic">Simply real. Reliably yours.</p>
            <p style="margin:0;color:#9ca3af;font-size:11px">© ${new Date().getFullYear()} Ralitee. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ========== RESET PASSWORD (validate token & set new password) ==========
authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Hash the raw token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password & clear token
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});



module.exports = authRouter;
