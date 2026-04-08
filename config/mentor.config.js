// mentor.config.js

/**
 * CodeSage Configuration
 *
 * Customize rules, ignored paths, logging, and other preferences.
 */

export default {
  rules: {
    "console-usage": true,          // Detect console.log in catch blocks
    "unused-variable": true,        // Detect unused variables
    "nested-callback": true,        // Detect callback hell
    "missing-process-exit": true    // Detect missing process.exit in critical error paths
  },

  ignore: [
    "node_modules",
    ".git",
    "dist",
    "build",
    "codesage.log"
  ],

  logging: {
    enabled: true,                  // Enable logging to codesage.log
    logFile: "codesage.log"         // Log file name
  },

  watcher: {
    extensions: [".js", ".ts", ".jsx", ".tsx"], // File types to watch
    debounce: 200                          // milliseconds to debounce rapid changes
  },

  ai: {
    useGemini: true,                       // Enable Gemini AI suggestions
    maxTokens: 250                          // Max tokens per AI call
  },

  display: {
    color: true,                            // Use colors in console output
    emoji: true                             // Use emojis for readability
  }
};