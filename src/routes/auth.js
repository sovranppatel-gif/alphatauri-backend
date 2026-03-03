// src/routes/auth.js

import express from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../controllers/authController.js';
import { loginValidator } from '../validators/authValidators.js';
import { validationResult } from 'express-validator';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success:false, message:"Too many login attempts. Try again later." },
});

router.post('/login', loginLimiter, loginValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });
  return login(req, res, next);
});

export default router;

