// src/routes/requestRoute.js
import express from 'express';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import {
  addRequest,
  getRequests,
  updateRequest,
  deleteRequest,
} from '../controllers/requestController.js';
import {
  createRequestValidator,
  updateRequestValidator,
  listRequestValidator,
} from '../validators/requestValidators.js';
import { validationResult } from 'express-validator';

const router = express.Router();
router.use(authMiddleware);

// Create request - Users can create their own
router.post(
  '/',
  createRequestValidator,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success: false, errors: e.array() });
    addRequest(req, res, next);
  }
);

// Get requests - Users can get their own, admins can get all
router.get(
  '/',
  listRequestValidator,
  getRequests
);

// Update request - Only admin can update (approve/reject)
router.put(
  '/:id',
  requireRole('admin'),
  updateRequestValidator,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success: false, errors: e.array() });
    updateRequest(req, res, next);
  }
);

// Delete request - Users can delete their own pending requests, admins can delete any
router.delete('/:id', deleteRequest);

export default router;
