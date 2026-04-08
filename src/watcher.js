// src/watcher.js

import chokidar from "chokidar";
import path from "path";
import fs from "fs";

import { analyzeFile } from "./analyzer.js";
import { generateSuggestions } from "./ai.js";
import { report } from "./reporter.js";

// Load mentor.config.js from correct path
async function loadConfig() {
  const configPath = path.resolve(process.cwd(), "config/mentor.config.js");
  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ mentor.config.js not found in config/, using defaults.");
    return {};
  }
  const configModule = await import(configPath);
  return configModule.default || {};
}

/**
 * Debounce helper
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Start CodeSage watcher
 * @param {string} entryFile
 */
export async function start(entryFile) {
  const config = await loadConfig();

  const ignoreRegex = config.ignore
    ? new RegExp(config.ignore.join("|"))
    : /node_modules|\.git|codesage\.log/;

  const extensions = config.watcher?.extensions || [".js", ".ts", ".jsx", ".tsx"];
  const debounceTime = config.watcher?.debounce || 200;

  console.log("🧠 CodeSage is watching your project...\n");

  const watcher = chokidar.watch(`**/*{${extensions.join(",")}}`, {
    ignored: ignoreRegex,
    persistent: true,
    ignoreInitial: true
  });

  const handleChange = async (filePath) => {
    console.log(`\n🔄 Change detected: ${filePath}`);

    try {
      // 1. Analyze file with enabled rules only
      const rawIssues = analyzeFile(filePath, config.rules);

      if (!rawIssues.length) {
        console.log("✅ No issues found.");
        return;
      }

      // 2. Read file content
      const fullPath = path.resolve(filePath);
      const code = fs.readFileSync(fullPath, "utf-8");

      // 3. Get AI suggestions if enabled
      let suggestions;
      if (config.ai?.useGemini) {
        suggestions = await generateSuggestions(rawIssues, code);
      } else {
        suggestions = rawIssues.map(issue => `⚠️ ${issue.message || "Check this code."}`);
      }

      // 4. Report results
      report(filePath, suggestions);

    } catch (err) {
      console.error("❌ Watcher error:", err.message);
    }
  };

  watcher.on("change", debounce(handleChange, debounceTime));
}