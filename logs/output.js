import fs from "fs";
import path from "path";

/**
 * Handles reading/writing CodeSage log files
 */

const defaultLogFile = path.resolve(process.cwd(), "codesage.log");

/**
 * Write a log entry to file
 * @param {string} message
 * @param {string} filePath - optional log file path
 */
export function writeLog(message, filePath = defaultLogFile) {
  const line = `[${new Date().toISOString()}] ${message}\n`;

  try {
    fs.appendFileSync(filePath, line);
  } catch (err) {
    console.error("❌ Failed to write to log file:", err.message);
  }
}

/**
 * Read logs from file
 * @param {string} filePath - optional log file path
 * @returns {string} content of log
 */
export function readLog(filePath = defaultLogFile) {
  try {
    if (!fs.existsSync(filePath)) return "";
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error("❌ Failed to read log file:", err.message);
    return "";
  }
}

/**
 * Clear the log file
 * @param {string} filePath
 */
export function clearLog(filePath = defaultLogFile) {
  try {
    fs.writeFileSync(filePath, "");
  } catch (err) {
    console.error("❌ Failed to clear log file:", err.message);
  }
}