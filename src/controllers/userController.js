import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js"; // 👈 alias to avoid any duplicate 'User'

/** CREATE */
export const addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const {
      name, email, password, emp_id, department, designation,
      status = "Present", phone, role = "emp"
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const exUser = await UserModel.findOne({ 
      $or: [
        { email: (email || "").toLowerCase().trim() },
        ...(emp_id ? [{ emp_id: emp_id.trim() }] : [])
      ]
    });
    if (exUser) return res.status(400).json({ success:false, message:"User already exists with this email or employee ID" });

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await UserModel.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      emp_id: emp_id?.trim() || undefined,
      department: department?.trim() || undefined,
      designation: designation?.trim() || undefined,
      status: status || "Present",
      phone: phone?.trim() || undefined,
      role: role || "emp",
    });

    const safe = await UserModel.findById(newUser._id).select("-password");

    return res.status(201).json({ success:true, message:"User created successfully", user: safe });
  } catch (err) {
    console.error("Error adding user:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "User already exists with this email or employee ID" });
    }
    return res.status(500).json({ success:false, message:"Server error" });
  }
};

/** READ (paginated list) */
export const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 1000 } = req.query;

    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    
    // Search by name, email, or emp_id
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { emp_id: searchRegex }
      ];
    }

    const pageNum  = parseInt(page, 10)  || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 1000, 5000); // hard cap safety
    const skip     = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      UserModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/** PROFILE (self) */
export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id)
      .select("-password");

    if (!user) return res.status(404).json({ success:false, message:"User not found" });
    return res.status(200).json({ success:true, user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ success:false, message:"Server error in getting user profile" });
  }
};

/** UPDATE */
export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const { id } = req.params;
    const {
      name, email, password, emp_id, department, designation,
      status, phone, role, photo
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (emp_id !== undefined) updateData.emp_id = emp_id?.trim() || undefined;
    if (department !== undefined) updateData.department = department?.trim() || undefined;
    if (designation !== undefined) updateData.designation = designation?.trim() || undefined;
    if (status !== undefined) updateData.status = status;
    if (phone !== undefined) updateData.phone = phone?.trim() || undefined;
    if (role !== undefined) updateData.role = role;

    // Handle photo upload if file exists
    if (req.file && req.file.path) {
      // Get old photo to delete later
      const oldUser = await UserModel.findById(id).select('photo');
      
      // Store photo path
      updateData.photo = req.file.path;
      
      // Delete old photo file if exists
      if (oldUser && oldUser.photo) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const oldPhotoPath = path.join(__dirname, '../../', oldUser.photo);
        
        try {
          await fs.unlink(oldPhotoPath);
        } catch (err) {
          // Old photo might not exist, ignore error
          console.log('Old photo not found for deletion:', oldPhotoPath);
        }
      }
    } else if (photo !== undefined) {
      // Handle photo from JSON body (base64 or URL)
      updateData.photo = photo;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password.trim(), 12);
    }

    const updated = await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select("-password");

    if (!updated) return res.status(404).json({ success:false, message:"User not found" });
    return res.status(200).json({ success:true, message:"User updated successfully", user: updated });
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "User already exists with this email or employee ID" });
    }
    return res.status(500).json({ success:false, message:"Server error" });
  }
};

/** DELETE */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await UserModel.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ success:false, message:"User not found" });
    return res.status(200).json({ success:true, message:"User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ success:false, message:"Server error" });
  }
};
