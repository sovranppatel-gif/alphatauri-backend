//middelware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ success:false, message:"Unauthorized - No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role companyId managerId ustatus');
    if (!user) return res.status(404).json({ success:false, message:"User not found" });
    if (user.ustatus === 'inactive') {
      return res.status(403).json({ success:false, message: "Account disabled" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success:false, message:"Unauthorized - Invalid token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success:false, message:'Forbidden' });
  }
  next();
};
