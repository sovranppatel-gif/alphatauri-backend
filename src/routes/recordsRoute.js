// src/routes/recordsRoute.js

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addRecord, getRecords, getRecord, updateRecord, deleteRecord,
} from "../controllers/recordsController.js";
import {
  createRecordValidator,
  listRecordsValidator,
  getRecordValidator,
  updateRecordValidator,
  deleteRecordValidator,
} from "../validators/recordValidators.js";
import { validationResult } from "express-validator";

const router = express.Router();
router.use(authMiddleware);

router.post("/", createRecordValidator, (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ success:false, errors: e.array() });
  addRecord(req, res, next);
});

router.get("/", listRecordsValidator, getRecords);
router.get("/:id", getRecordValidator, getRecord);

router.put("/:id", updateRecordValidator, (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ success:false, errors: e.array() });
  updateRecord(req, res, next);
});

router.delete("/:id", deleteRecordValidator, deleteRecord);

export default router;
