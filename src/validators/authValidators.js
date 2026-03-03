// src/validators/authValidators.js
import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),
];
