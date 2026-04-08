#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { start } from "../src/watcher.js";
import "dotenv/config";

// Get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("❌ Usage: codesage <command>");
  console.log("Example: npx codesage node server.js");
  process.exit(1);
}

// Split command + args
const command = args[0];
const commandArgs = args.slice(1);

// Resolve entry file (last arg usually)
const entryFile = commandArgs[commandArgs.length - 1];

// Start watcher
start(entryFile);

// Run user’s app
const child = spawn(command, commandArgs, {
  stdio: "inherit",
  shell: true
});

// Handle exit
child.on("close", (code) => {
  console.log(`\n⚡ Process exited with code ${code}`);
  process.exit(code);
});