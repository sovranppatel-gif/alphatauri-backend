// src/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Explicitly select password (in case select:false in schema)
    const user = await User.findOne({ email }).select("+password");

    // Generic error to avoid user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server misconfigured (JWT secret)",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Never send password back
    const { password: _pw, ...safeUser } = user.toObject();

    // 🔔 DEMO APK MESSAGE (backend-only)
    const isDemoApp = process.env.DEMO_APP === "true";

    return res.status(200).json({
      success: true,
      message: isDemoApp
        ? "⚠️ This is a demo APK for testing purposes only"
        : "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
