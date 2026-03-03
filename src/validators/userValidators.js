// src/validators/userValidators.js
import { body, param, query } from "express-validator";

export const createUserValidator = [
  body("name").notEmpty().withMessage("Name is required").isString().trim(),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),
  body("emp_id").optional().isString().trim(),
  body("department").optional().isString().trim(),
  body("designation").optional().isString().trim(),
  body("status").optional().isIn(["Present", "Absent"]).withMessage("Status must be Present or Absent"),
  body("phone").optional().isString().trim(),
  body("role").optional().isIn(["admin", "emp"]).withMessage("Role must be admin or emp"),
];

export const updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("name").optional().isString().trim(),
  body("email").optional().isEmail().normalizeEmail(),
  body("password").optional().isString().isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
  body("emp_id").optional().isString().trim(),
  body("department").optional().isString().trim(),
  body("designation").optional().isString().trim(),
  body("status").optional().isIn(["Present", "Absent"]).withMessage("Status must be Present or Absent"),
  body("phone").optional().isString().trim(),
  body("role").optional().isIn(["admin", "emp"]).withMessage("Role must be admin or emp"),
];

export const listUsersValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 5000 }),
  query("role").optional().isIn(["admin", "emp", "all"]),
  query("status").optional().isIn(["Present", "Absent", "all"]),
  query("search").optional().isString().trim(),
];
