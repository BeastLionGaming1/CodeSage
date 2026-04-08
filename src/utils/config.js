// src/utils/config.js

import fs from "fs";
import path from "path";

/**
 * Default configuration (fallback if user config is missing)
 */
const defaultConfig = {
  rules: {
    "console-usage": true,
    "unused-variable": true,
    "nested-callback": true,
    "missing-process-exit": true
  },

  ignore: [
    "node_modules",
    ".git",
    "dist",
    "build",
    "codesage.log"
  ],

  logging: {
    enabled: true,
    logFile: "codesage.log"
  },

  watcher: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    debounce: 200
  },

  ai: {
    useGemini: true,
    maxTokens: 250
  },

  display: {
    color: true,
    emoji: true
  }
};

/**
 * Deep merge helper (merges user config with defaults)
 */
function mergeConfig(defaults, user) {
  const result = { ...defaults };

  for (const key in user) {
    if (
      typeof user[key] === "object" &&
      !Array.isArray(user[key]) &&
      key in defaults
    ) {
      result[key] = mergeConfig(defaults[key], user[key]);
    } else {
      result[key] = user[key];
    }
  }

  return result;
}

/**
 * Load mentor.config.js from project
 */
export async function loadConfig() {
  const configPath = path.resolve(process.cwd(), "config/mentor.config.js");

  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ mentor.config.js not found, using default config.");
    return defaultConfig;
  }

  try {
    const configModule = await import(configPath);
    const userConfig = configModule.default || {};

    return mergeConfig(defaultConfig, userConfig);
  } catch (err) {
    console.error("❌ Failed to load mentor.config.js:", err.message);
    return defaultConfig;
  }
}