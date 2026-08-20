import winston from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(timestamp(), logFormat),
  }),
];

const logDir = path.join(process.cwd(), "logs");
try {
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: combine(timestamp(), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: combine(timestamp(), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "audit.log"),
      level: "info",
      format: combine(timestamp(), logFormat),
    }),
  );
} catch {
  // read-only filesystem (e.g. serverless): log to console only
}

const logger = winston.createLogger({
  level: "info",
  transports,
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