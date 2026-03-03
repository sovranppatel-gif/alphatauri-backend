// src/validators/requestValidators.js
import { body, param, query } from 'express-validator';

export const createRequestValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('type')
    .notEmpty()
    .withMessage('Request type is required')
    .isIn(['Leave', 'Permission', 'Other'])
    .withMessage('Request type must be Leave, Permission, or Other'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim()
    .withMessage('Title must be a string'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .withMessage('Description must be a string'),
  body('date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('time')
    .optional()
    .isString()
    .trim()
    .withMessage('Time must be a string'),
];

export const updateRequestValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Request ID'),
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

export const listRequestValidator = [
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
    .isIn(['Leave', 'Permission', 'Other'])
    .withMessage('Type must be Leave, Permission, or Other'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
];
