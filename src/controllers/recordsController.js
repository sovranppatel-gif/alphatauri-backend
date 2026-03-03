// controllers/recordsController.js

import Records from "../models/Records.js";
import { validationResult } from "express-validator";

const canManageRecord = (req, recordOwnerId) => {
  // admins can do all
  if (req.user.role === 'admin') return true;
  // company/managers can manage their team's data (simplified: same company/manager)
  if (req.user.role === 'company' || req.user.role === 'manager') return true; // adjust if you want strict mapping
  // customer can manage only own records
  return req.user._id.toString() === recordOwnerId.toString();
};

// CREATE
export const addRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const { vehicle, journey, vehicleNum, amount, astatus='active', ticketNum, userId, date } = req.body;

    // customers can only create for themselves
    if (req.user.role === 'customer' && userId && userId !== req.user._id.toString()) {
      return res.status(403).json({ success:false, message:'Forbidden' });
    }

    const newRecord = await Records.create({
      vehicle, journey, vehicleNum, amount, astatus, ticketNum,
      userId: userId || req.user._id,
      date: date || new Date(),
    });

    const populated = await Records.findById(newRecord._id).populate({
      path: "userId",
      select: "name email mobile laneno shift role companyId managerId",
      populate: [
        { path: "companyId", select: "name address" },
        { path: "managerId", select: "name email highwayname distancekm seationfrom seationto" },
      ],
    });

    res.status(201).json({ success:true, message:"Record created successfully", record: populated });
  } catch (error) {
    console.error("Error adding record:", error);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// READ ALL (with filters + pagination)
export const getRecords = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const query = {};
    // basic filters
    if (req.query.vehicle) query.vehicle = req.query.vehicle;
    if (req.query.astatus) query.astatus = req.query.astatus;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to)   query.date.$lte = new Date(req.query.to);
    }

    // customers see only their records
    if (req.user.role === 'customer') query.userId = req.user._id;

    const [records, total] = await Promise.all([
      Records.find(query).populate({
        path: "userId",
        select: "name email mobile laneno shift role companyId managerId",
        populate: [
          { path: "companyId", select: "name address" },
          { path: "managerId", select: "name email highwayname distancekm seationfrom seationto" },
        ],
      }).sort({ date: -1 }).skip(skip).limit(limit),
      Records.countDocuments(query)
    ]);

    res.status(200).json({ success:true, total, page, pages: Math.ceil(total/limit), records });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// READ SINGLE
export const getRecord = async (req, res) => {
  try {
    const rec = await Records.findById(req.params.id)
      .populate("userId","name email mobile laneno shift role companyId managerId");
    if (!rec) return res.status(404).json({ success:false, message:"Record not found" });

    if (!canManageRecord(req, rec.userId._id)) return res.status(403).json({ success:false, message:'Forbidden' });

    res.status(200).json({ success:true, record: rec });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// UPDATE
export const updateRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const rec = await Records.findById(req.params.id);
    if (!rec) return res.status(404).json({ success:false, message:"Record not found" });

    if (!canManageRecord(req, rec.userId)) return res.status(403).json({ success:false, message:'Forbidden' });

    const fields = ['vehicle','journey','vehicleNum','amount','userId','date','astatus','ticketNum'];
    fields.forEach(f => {
      if (typeof req.body[f] !== 'undefined') rec[f] = req.body[f];
    });
    if (!rec.date) rec.date = new Date();

    await rec.save();
    res.status(200).json({ success:true, message:"Record updated successfully", record: rec });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// DELETE
export const deleteRecord = async (req, res) => {
  try {
    const rec = await Records.findById(req.params.id);
    if (!rec) return res.status(404).json({ success:false, message:"Record not found" });
    if (!canManageRecord(req, rec.userId)) return res.status(403).json({ success:false, message:'Forbidden' });

    await rec.deleteOne();
    res.status(200).json({ success:true, message:"Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
