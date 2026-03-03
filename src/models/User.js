// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // password ko by default query se hide rakho:
  password: { type: String, required: true, select: false },
  
  // AlphaTauriApp schema fields
  emp_id: { type: String, unique: true, sparse: true, trim: true },
  department: { type: String, trim: true },
  designation: { type: String, trim: true },
  status: { type: String, enum: ["Present", "Absent"], default: "Present", index: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ["admin", "emp"], default: "emp", required: true, index: true },
  photo: { type: String, trim: true }, // Profile photo URL/path
}, { timestamps: true });

// Note: email and emp_id indexes are automatically created by unique: true in field definitions
// No need to define them separately to avoid duplicate index warnings

const User = mongoose.model("User", userSchema);
export default User;
