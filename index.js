#!/usr/bin/env node
// index.js

import dotenv from "dotenv";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

import { start } from "./src/watcher.js";
import { loadConfig } from "./src/utils/config.js";
import {
  setLoggerConfig,
  info,
  warn,
  error,
  success
} from "./src/utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isDirectExecution() {
  const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return executedFile === __filename;
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    return { help: true };
  }

  if (args[0] === "--help" || args[0] === "-h") {
    return { help: true };
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  return {
    help: false,
    command,
    commandArgs,
    entryFile: commandArgs.length > 0 ? commandArgs[commandArgs.length - 1] : null
  };
}

function printHelp() {
  console.log(`
CodeSage — real-time AI code mentor

Usage:
  codesage node server.js
  npx codesage node server.js
  codesage npm run dev

Examples:
  codesage node app.js
  codesage node src/server.js
  codesage npm run dev
`);
}

function runTarget(command, commandArgs) {
  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    shell: true
  });

  child.on("error", (err) => {
    error(`Failed to start command "${command}": ${err.message}`);
    process.exit(1);
  });

  child.on("close", (code, signal) => {
    if (signal) {
      warn(`Target process stopped with signal ${signal}`);
      process.exit(0);
    }

    if (code === 0) {
      success(`Target process exited cleanly with code ${code}`);
    } else {
      warn(`Target process exited with code ${code}`);
    }

    process.exit(code ?? 0);
  });

  return child;
}

export async function run(argv = process.argv) {
  const parsed = parseArgs(argv);

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  try {
    const config = await loadConfig();
    setLoggerConfig(config);

    info("CodeSage starting...");

    const extensions = config.watcher?.extensions || [".js", ".ts", ".jsx", ".tsx"];
    info(`Watching extensions: ${extensions.join(", ")}`);

    if (parsed.entryFile) {
      info(`Entry file: ${path.resolve(process.cwd(), parsed.entryFile)}`);
    } else {
      warn("No entry file detected.");
    }

    await start(parsed.entryFile);

    const child = runTarget(parsed.command, parsed.commandArgs);

    const shutdown = () => {
      warn("Shutting down CodeSage...");
      if (child && !child.killed) {
        child.kill("SIGINT");
      }
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    error(`CodeSage failed to start: ${err.message}`);
    process.exit(1);
  }
}

if (isDirectExecution()) {
  run();
}