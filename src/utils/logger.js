// src/utils/logger.js

import chalk from "chalk";
import fs from "fs";
import path from "path";

let config = {
  logging: {
    enabled: true,
    logFile: "codesage.log"
  },
  display: {
    color: true,
    emoji: true
  }
};

/**
 * Allow other parts of the app to inject config.
 * This keeps logger.js reusable and clean.
 */
export function setLoggerConfig(newConfig = {}) {
  config = {
    ...config,
    ...newConfig,
    logging: {
      ...config.logging,
      ...(newConfig.logging || {})
    },
    display: {
      ...config.display,
      ...(newConfig.display || {})
    }
  };
}

function formatLevel(level, message) {
  const useEmoji = config.display?.emoji !== false;
  const useColor = config.display?.color !== false;

  const icons = {
    info: useEmoji ? "ℹ️" : "[INFO]",
    warn: useEmoji ? "⚠️" : "[WARN]",
    error: useEmoji ? "❌" : "[ERROR]",
    success: useEmoji ? "✅" : "[OK]",
    debug: useEmoji ? "🐛" : "[DEBUG]"
  };

  const colors = {
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
    success: chalk.green,
    debug: chalk.magenta
  };

  const prefix = icons[level] || "[LOG]";
  const text = `${prefix} ${message}`;

  return useColor && colors[level] ? colors[level](text) : text;
}

function writeToFile(level, message) {
  if (!config.logging?.enabled) return;

  const logFile = config.logging?.logFile || "codesage.log";
  const logPath = path.resolve(process.cwd(), logFile);
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;

  try {
    fs.appendFileSync(logPath, line);
  } catch {
    // Silently fail so logging never breaks the tool
  }
}

export function log(message) {
  console.log(formatLevel("info", message));
  writeToFile("info", message);
}

export function info(message) {
  console.log(formatLevel("info", message));
  writeToFile("info", message);
}

export function warn(message) {
  console.log(formatLevel("warn", message));
  writeToFile("warn", message);
}

export function error(message) {
  console.log(formatLevel("error", message));
  writeToFile("error", message);
}

export function success(message) {
  console.log(formatLevel("success", message));
  writeToFile("success", message);
}

export function debug(message) {
  if (process.env.CODESAGE_DEBUG !== "true") return;
  console.log(formatLevel("debug", message));
  writeToFile("debug", message);
}