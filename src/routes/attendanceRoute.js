// src/routes/attendanceRoute.js
import express from 'express';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import {
  addAttendance,
  getAttendances,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';
import {
  createAttendanceValidator,
  updateAttendanceValidator,
  listAttendancesValidator,
} from '../validators/attendanceValidators.js';
import { validationResult } from 'express-validator';

const router = express.Router();
router.use(authMiddleware);

// Create - Employees can create their own, admin can create for anyone
router.post(
  '/',
  createAttendanceValidator,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success: false, errors: e.array() });
    addAttendance(req, res, next);
  }
);

// Get attendances - Admin can see all, employees can see their own
router.get('/', listAttendancesValidator, getAttendances);

// Update - Employees can update their own, admin can update any
router.put(
  '/:id',
  updateAttendanceValidator,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success: false, errors: e.array() });
    updateAttendance(req, res, next);
  }
);

router.delete('/:id', requireRole('admin'), deleteAttendance);

export default router;
