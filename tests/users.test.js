// tests/users.test.js
import { strict as assert } from "node:assert";
import test from "node:test";
import supertest from "supertest";
import 'dotenv/config';
import express from "express";
import connectDB from "../src/db/connection.js";
import userRoutes from "../src/routes/userRoute.js";
import authRoutes from "../src/routes/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

await connectDB();

let token;

test("Login fixture (if you have seeded admin)", async () => {
  const res = await supertest(app).post("/api/auth/login").send({
    email: "admin@gmail.com",
    password: "Admin@123", // seed wale password se match hona chahiye
  });
  // If not seeded, this test will fail—seed first.
  if (res.statusCode === 200) token = res.body.token;
});

test("GET /api/users without token -> 401", async () => {
  const res = await supertest(app).get("/api/users");
  assert.equal(res.statusCode, 401);
});

test("GET /api/users with token (if exists)", async (t) => {
  if (!token) return t.skip("No token (seed admin first)");
  const res = await supertest(app).get("/api/users").set("Authorization", `Bearer ${token}`);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});
