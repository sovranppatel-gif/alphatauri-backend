// src/controllers/requestController.js
import { validationResult } from "express-validator";
import UserRequest from "../models/Request.js";
import User from "../models/User.js";

/** CREATE */
export const addRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { userId, type, title, description, date, time, leaveId } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newRequest = await UserRequest.create({
      userId,
      type,
      title,
      description,
      status: "Pending",
      appliedDate: new Date(),
      date: date ? new Date(date) : null,
      time: time || null,
      leaveId: leaveId || null,
    });

    // Populate user data
    const populated = await UserRequest.findById(newRequest._id)
      .populate("userId", "name email emp_id department designation")
      .populate("approvedBy", "name email")
      .populate("leaveId")
      .select("-__v");

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: populated,
    });
  } catch (err) {
    console.error("Error adding request:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** READ (paginated list) */
export const getRequests = async (req, res) => {
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

    const [requests, total] = await Promise.all([
      UserRequest.find(filter)
        .populate("userId", "name email emp_id department designation")
        .populate("approvedBy", "name email")
        .populate("leaveId")
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-__v"),
      UserRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      requests,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Error getting requests:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** UPDATE */
export const updateRequest = async (req, res) => {
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

    const updated = await UserRequest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("userId", "name email emp_id department designation")
      .populate("approvedBy", "name email")
      .populate("leaveId")
      .select("-__v");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Request updated successfully",
      request: updated,
    });
  } catch (err) {
    console.error("Error updating request:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE */
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserRequest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting request:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
