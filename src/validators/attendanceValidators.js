// src/validators/attendanceValidators.js
import { body, query, param } from 'express-validator';

export const createAttendanceValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('checkIn')
    .optional()
    .isString()
    .trim()
    .withMessage('Check-in time must be a string'),
  body('checkOut')
    .optional()
    .isString()
    .trim()
    .withMessage('Check-out time must be a string'),
  body('hours')
    .optional()
    .isString()
    .trim()
    .withMessage('Hours must be a string'),
  body('status')
    .optional()
    .isIn(['Present', 'Absent'])
    .withMessage('Status must be either Present or Absent'),
  body('late')
    .optional()
    .isBoolean()
    .withMessage('Late must be a boolean'),
  body('lateBy')
    .optional()
    .isString()
    .trim()
    .withMessage('Late by must be a string'),
];

export const updateAttendanceValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance ID format'),
  body('checkIn')
    .optional()
    .isString()
    .trim()
    .withMessage('Check-in time must be a string'),
  body('checkOut')
    .optional()
    .isString()
    .trim()
    .withMessage('Check-out time must be a string'),
  body('hours')
    .optional()
    .isString()
    .trim()
    .withMessage('Hours must be a string'),
  body('status')
    .optional()
    .isIn(['Present', 'Absent'])
    .withMessage('Status must be either Present or Absent'),
  body('late')
    .optional()
    .isBoolean()
    .withMessage('Late must be a boolean'),
  body('lateBy')
    .optional()
    .isString()
    .trim()
    .withMessage('Late by must be a string'),
];

export const listAttendancesValidator = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  query('status')
    .optional()
    .isIn(['Present', 'Absent'])
    .withMessage('Status must be either Present or Absent'),
  query('search')
    .optional()
    .isString()
    .trim()
    .withMessage('Search must be a string'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
];
