// src/validators/leaveValidators.js
import { body, param, query } from 'express-validator';

export const createLeaveValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .toDate()
    .withMessage('Valid start date is required (YYYY-MM-DD)'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .toDate()
    .withMessage('Valid end date is required (YYYY-MM-DD)'),
  body('type')
    .notEmpty()
    .withMessage('Leave type is required')
    .isString()
    .trim()
    .withMessage('Leave type must be a string'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .trim()
    .withMessage('Reason must be a string'),
];

export const updateLeaveValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Leave ID'),
  body('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage('Status must be Pending, Approved, or Rejected'),
  body('comments')
    .optional()
    .isString()
    .trim()
    .withMessage('Comments must be a string'),
];

export const listLeaveValidator = [
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid User ID is required'),
  query('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage('Status must be Pending, Approved, or Rejected'),
  query('type')
    .optional()
    .isString()
    .trim()
    .withMessage('Type must be a string'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
];
