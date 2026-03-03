// src/models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  date: { 
    type: Date, 
    required: true, 
    index: true 
  },
  checkIn: { 
    type: String, 
    default: null 
  },
  checkOut: { 
    type: String, 
    default: null 
  },
  hours: { 
    type: String, 
    default: null 
  },
  status: { 
    type: String, 
    enum: ["Present", "Absent"], 
    default: "Absent",
    index: true 
  },
  late: { 
    type: Boolean, 
    default: false 
  },
  lateBy: { 
    type: String, 
    default: null 
  },
}, { timestamps: true });

// Index for efficient queries by user and date
attendanceSchema.index({ userId: 1, date: -1 });
attendanceSchema.index({ date: -1 });

// Prevent duplicate attendance for same user on same date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
