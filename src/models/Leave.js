// src/models/Leave.js
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  reason: {
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
}, { timestamps: true });

// Indexes for efficient queries
leaveSchema.index({ userId: 1, appliedDate: -1 });
leaveSchema.index({ status: 1, appliedDate: -1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Leave", leaveSchema);
