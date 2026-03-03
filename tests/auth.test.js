// tests/auth.test.js
import { strict as assert } from "node:assert";
import test from "node:test";
import supertest from "supertest";
import 'dotenv/config';
import express from "express";
import connectDB from "../src/db/connection.js";
import authRoutes from "../src/routes/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

await connectDB();

test("POST /api/auth/login -> 400 on missing fields", async () => {
  const res = await supertest(app).post("/api/auth/login").send({});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});
