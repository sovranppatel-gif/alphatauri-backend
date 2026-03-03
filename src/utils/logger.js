// src/utils/logger.js
import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "trms-server" },
  transports: [
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logsDir, "app.log") }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;
