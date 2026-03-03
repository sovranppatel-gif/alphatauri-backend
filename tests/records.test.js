// tests/records.test.js
import { strict as assert } from "node:assert";
import test from "node:test";
import supertest from "supertest";
import 'dotenv/config';
import express from "express";
import connectDB from "../src/db/connection.js";
import recordsRoute from "../src/routes/recordsRoute.js";
import authRoutes from "../src/routes/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/records", recordsRoute);

await connectDB();

let token;

test("Login fixture (seed admin first)", async () => {
  const res = await supertest(app).post("/api/auth/login").send({
    email: "admin@gmail.com",
    password: "Admin@123",
  });
  if (res.statusCode === 200) token = res.body.token;
});

test("GET /api/records -> 401 without token", async () => {
  const res = await supertest(app).get("/api/records");
  assert.equal(res.statusCode, 401);
});

test("GET /api/records with token (if exists)", async (t) => {
  if (!token) return t.skip("No token (seed admin first)");
  const res = await supertest(app).get("/api/records").set("Authorization", `Bearer ${token}`);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});
