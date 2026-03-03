// src/models/Request.js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ["Leave", "Permission", "Other"],
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
    index: true
  },
  appliedDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedDate: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  comments: {
    type: String,
    trim: true,
    default: null
  },
  // Additional fields based on request type
  leaveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Leave",
    default: null
  },
  date: {
    type: Date,
    default: null
  },
  time: {
    type: String,
    default: null
  },
}, { timestamps: true });

// Indexes for efficient queries
requestSchema.index({ userId: 1, appliedDate: -1 });
requestSchema.index({ status: 1, appliedDate: -1 });
requestSchema.index({ type: 1, status: 1 });

export default mongoose.model("UserRequest", requestSchema);
