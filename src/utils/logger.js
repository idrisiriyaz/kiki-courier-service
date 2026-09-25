import fs from "node:fs";
import path from "node:path";
import { root } from "./config.js";

const logFile = path.join(root, "logs", "courier.jsonl");

function writeLog(level, event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details
  };

  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, `${JSON.stringify(entry)}\n`);
}

const logger = {
  info(event, details) {
    writeLog("info", event, details);
  },
  error(event, details) {
    writeLog("error", event, details);
  }
};

export { logger, logFile };
