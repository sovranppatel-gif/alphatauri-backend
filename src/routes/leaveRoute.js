// src/routes/leaveRoute.js
import express from 'express';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import {
  addLeave,
  getLeaves,
  updateLeave,
  deleteLeave,
} from '../controllers/leaveController.js';
import {
  createLeaveValidator,
  updateLeaveValidator,
  listLeaveValidator,
} from '../validators/leaveValidators.js';
import { validationResult } from 'express-validator';

const router = express.Router();
router.use(authMiddleware);

// Create leave - Users can create their own
router.post(
  '/',
  createLeaveValidator,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success: false, errors: e.array() });
    addLeave(req, res, next);
  }
);

// Get leaves - Users can get their own, admins can get all
router.get(
  '/',
  listLeaveValidator,
  getLeaves
);

// Update leave - Only admin can update (approve/reject)
router.put(
  '/:id',
  requireRole('admin'),
  updateLeaveValidator,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success: false, errors: e.array() });
    updateLeave(req, res, next);
  }
);

// Delete leave - Users can delete their own pending leaves, admins can delete any
router.delete('/:id', deleteLeave);

export default router;
