import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "audit.log"),
      level: "info",
    }),
  ],
});

export default {
  info: (msg) => logger.info(msg),
  warn: (msg) => logger.warn(msg),
  error: (msg) => logger.error(msg),
  audit: (action, userId, details = "") => {
    logger.info(
      `AUDIT | User: ${userId} | Action: ${action} | Details: ${details}`,
    );
  },
};
