// src/controllers/attendanceController.js
import { validationResult } from "express-validator";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

/** CREATE */
export const addAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      userId,
      date = new Date(),
      checkIn = null,
      checkOut = null,
      hours = null,
      status = "Absent",
      late = false,
      lateBy = null,
    } = req.body;

    // Authorization: Non-admin users can only create attendance for themselves
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden - You can only create attendance for yourself" 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Normalize date to start of day for comparison
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this user on this date
    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: new Date(attendanceDate),
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already recorded for this user on this date",
      });
    }

    const newAttendance = await Attendance.create({
      userId,
      date: attendanceDate,
      checkIn,
      checkOut,
      hours,
      status,
      late,
      lateBy,
    });

    // Populate user data
    const populated = await Attendance.findById(newAttendance._id)
      .populate("userId", "name email emp_id department designation")
      .select("-__v");

    return res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      attendance: populated,
    });
  } catch (err) {
    console.error("Error adding attendance:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Attendance already exists for this user on this date",
      });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** READ (list with filters) */
export const getAttendances = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      date,
      userId,
      status,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // If a non-admin user is requesting, only show their attendances
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else if (userId) {
      // Admin can filter by userId if provided
      query.userId = userId;
    }

    // Filter by date
    if (date) {
      // Parse date string (format: YYYY-MM-DD)
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      const filterDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const nextDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
      
      query.date = {
        $gte: filterDate,
        $lt: nextDay,
      };
      console.log('📅 Date filter:', { 
        input: date, 
        from: filterDate.toISOString(), 
        to: nextDay.toISOString() 
      });
    }

    // Filter by userId
    if (userId) {
      query.userId = userId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by user name or emp_id (via populate)
    // Note: Only admins can search across all users; employees are limited to their own records
    let searchQuery = { ...query };
    if (search && req.user.role === 'admin') {
      // Only allow search for admins
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { emp_id: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      const userIds = users.map((u) => u._id);
      if (userIds.length > 0) {
        // If search found users, combine with existing userId filter if any
        if (searchQuery.userId) {
          // If userId already exists and is a string, we need to intersect
          if (typeof searchQuery.userId === 'string') {
            searchQuery.userId = userIds.includes(searchQuery.userId) ? searchQuery.userId : { $in: [] };
          } else {
            searchQuery.userId = { $in: userIds };
          }
        } else {
          searchQuery.userId = { $in: userIds };
        }
      } else {
        // No users found matching search - return empty results
        searchQuery.userId = { $in: [] };
      }
      console.log('🔍 Search filter:', { search, userIds: userIds.length });
    }
    // For non-admin users, search is ignored (they only see their own records)

    console.log('📋 Final query:', JSON.stringify(searchQuery, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendances = await Attendance.find(searchQuery)
      .populate("userId", "name email emp_id department designation")
      .select("-__v")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(searchQuery);

    // Format response for frontend
    const formattedAttendances = attendances.map((att) => {
      const user = att.userId;
      return {
        id: att._id.toString(),
        _id: att._id.toString(),
        name: user?.name || "Unknown",
        empId: user?.emp_id || "N/A",
        date: att.date.toISOString().split("T")[0],
        checkIn: att.checkIn || "--",
        checkOut: att.checkOut || "--",
        hours: att.hours || "--",
        status: att.status,
        late: att.late || false,
        lateBy: att.lateBy || null,
      };
    });

    return res.status(200).json({
      success: true,
      attendances: formattedAttendances,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Error fetching attendances:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** UPDATE */
export const updateAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    
    // Find the attendance record first to check ownership
    const existing = await Attendance.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    // Authorization: Non-admin users can only update their own attendance
    if (req.user.role !== 'admin' && existing.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden - You can only update your own attendance" 
      });
    }

    const {
      checkIn,
      checkOut,
      hours,
      status,
      late,
      lateBy,
    } = req.body;

    const updateData = {};
    if (checkIn !== undefined) updateData.checkIn = checkIn;
    if (checkOut !== undefined) updateData.checkOut = checkOut;
    if (hours !== undefined) updateData.hours = hours;
    if (status !== undefined) updateData.status = status;
    if (late !== undefined) updateData.late = late;
    if (lateBy !== undefined) updateData.lateBy = lateBy;

    const updated = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("userId", "name email emp_id department designation")
      .select("-__v");

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance: updated,
    });
  } catch (err) {
    console.error("Error updating attendance:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE */
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Attendance.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting attendance:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
