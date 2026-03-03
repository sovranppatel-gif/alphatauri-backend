// src/config/security.js
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

export function applySecurity(app) {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(compression());

  const allowed = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "200kb" })); // NOTE: add `import express from "express";` at file top if you move this line here.
  app.use(mongoSanitize());
  app.use(hpp());

  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}
