// src/reporter.js

import chalk from "chalk";
import fs from "fs";
import path from "path";

/**
 * Report AI suggestions to console + optional log file
 */
export function report(filePath, suggestions) {
  if (!suggestions || suggestions.length === 0) return;

  const relativePath = path.relative(process.cwd(), filePath);

  // Header
  console.log(
    chalk.bold.magenta(`\n🧠 CodeSage Insights → ${relativePath}`)
  );

  console.log(chalk.gray("────────────────────────────────────"));

  // Suggestions
  suggestions.forEach((s, index) => {
    console.log(
      chalk.cyan(` ${index + 1}.`) + " " + chalk.white(s)
    );
  });

  console.log(chalk.gray("────────────────────────────────────"));

  // ✅ FIXED: clearer template string (no confusion)
  const logEntry = `[${new Date().toISOString()}] ${relativePath}
${suggestions.map(s => "- " + s).join("\n")}\n`;

  const logPath = path.join(process.cwd(), "codesage.log");

  try {
    fs.appendFileSync(logPath, logEntry);
  } catch (err) {
    console.error(chalk.red("❌ Failed to write log file"));
  }
}