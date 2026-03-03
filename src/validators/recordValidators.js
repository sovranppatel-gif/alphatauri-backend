// src/validators/recordValidators.js
import { body, param, query } from "express-validator";
import { VEHICLES, JOURNEYS, STATUS } from "../utils/constants.js";

export const createRecordValidator = [
  body("vehicle").isIn(VEHICLES),
  body("journey").isIn(JOURNEYS),
  body("vehicleNum").isString().trim().notEmpty(),
  body("amount").isFloat({ min: 0 }),
  body("astatus").optional().isIn(STATUS),
  body("ticketNum").isString().trim().notEmpty(),
  body("userId").optional().isMongoId(),
  body("date").optional().isISO8601(),
];

export const listRecordsValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("vehicle").optional().isIn(VEHICLES),
  query("astatus").optional().isIn(STATUS),
  query("userId").optional().isMongoId(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
];

export const getRecordValidator = [param("id").isMongoId()];

export const updateRecordValidator = [
  param("id").isMongoId(),
  body("vehicle").optional().isIn(VEHICLES),
  body("journey").optional().isIn(JOURNEYS),
  body("vehicleNum").optional().isString().trim().notEmpty(),
  body("amount").optional().isFloat({ min: 0 }),
  body("astatus").optional().isIn(STATUS),
  body("ticketNum").optional().isString().trim().notEmpty(),
  body("userId").optional().isMongoId(),
  body("date").optional().isISO8601(),
];

export const deleteRecordValidator = [param("id").isMongoId()];
