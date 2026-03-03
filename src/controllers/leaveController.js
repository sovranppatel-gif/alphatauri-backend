// src/controllers/leaveController.js
import { validationResult } from "express-validator";
import Leave from "../models/Leave.js";
import User from "../models/User.js";

/** CREATE */
export const addLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { userId, startDate, endDate, type, reason } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ success: false, message: "Start date must be before end date" });
    }

    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "Cannot apply for leave in the past" });
    }

    const newLeave = await Leave.create({
      userId,
      startDate: start,
      endDate: end,
      type,
      reason,
      status: "Pending",
      appliedDate: new Date(),
    });

    // Populate user data
    const populated = await Leave.findById(newLeave._id)
      .populate("userId", "name email emp_id department designation")
      .select("-__v");

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      leave: populated,
    });
  } catch (err) {
    console.error("Error adding leave:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** READ (paginated list) */
export const getLeaves = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { userId, status, type, page = 1, limit = 100 } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 100, 1000);
    const skip = (pageNum - 1) * limitNum;

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate("userId", "name email emp_id department designation")
        .populate("approvedBy", "name email")
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-__v"),
      Leave.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      leaves,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Error getting leaves:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** UPDATE */
export const updateLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status, comments, approvedBy } = req.body;

    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === "Approved" || status === "Rejected") {
        updateData.resolvedDate = new Date();
        if (approvedBy) updateData.approvedBy = approvedBy;
        else if (req.user?._id) updateData.approvedBy = req.user._id;
      }
    }
    if (comments !== undefined) updateData.comments = comments;

    const updated = await Leave.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("userId", "name email emp_id department designation")
      .populate("approvedBy", "name email")
      .select("-__v");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      leave: updated,
    });
  } catch (err) {
    console.error("Error updating leave:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE */
export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Leave.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting leave:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
