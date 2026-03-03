// src/routes/userRoute.js

import express from 'express';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import { addUser, getUsers, updateUser, deleteUser, getUser } from '../controllers/userController.js';
import { createUserValidator, updateUserValidator, listUsersValidator } from '../validators/userValidators.js';
import { validationResult } from 'express-validator';
import upload, { compressAndSaveImage } from '../middleware/upload.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/', requireRole('admin'), createUserValidator, (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ success:false, errors: e.array() });
  addUser(req, res, next);
});

router.get('/', requireRole('admin'), listUsersValidator, getUsers);
router.get('/profile', getUser);

// Update user with optional photo upload
router.put('/:id', 
  requireRole('admin'), 
  upload.single('photo'), 
  compressAndSaveImage,
  updateUserValidator, 
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ success:false, errors: e.array() });
    updateUser(req, res, next);
  }
);

// Allow users to update their own profile (including photo)
router.put('/profile/me', 
  upload.single('photo'), 
  compressAndSaveImage,
  async (req, res, next) => {
    // Set the user ID from the authenticated user
    req.params.id = req.user.id;
    updateUser(req, res, next);
  }
);

router.delete('/:id', requireRole('admin'), deleteUser);

export default router;

