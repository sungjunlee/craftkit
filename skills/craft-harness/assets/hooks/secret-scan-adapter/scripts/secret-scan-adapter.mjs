#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const root = process.cwd();

function commandExists(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
}

if (commandExists("gitleaks")) {
  const result = run("gitleaks", ["detect", "--no-banner", "--redact", "--no-git", "--source", ".", "--exit-code", "1"]);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.status === 0 ? 0 : 2);
}

if (commandExists("detect-secrets")) {
  const result = run("detect-secrets", ["scan", "--all-files"]);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(2);

  try {
    const report = JSON.parse(result.stdout);
    const results = report.results && typeof report.results === "object" ? report.results : {};
    const count = Object.values(results).reduce((total, items) => total + items.length, 0);
    if (count > 0) {
      console.error(`secret-scan-adapter: detect-secrets reported ${count} finding(s)`);
      process.exit(2);
    }
    console.log("secret-scan-adapter: detect-secrets passed");
    process.exit(0);
  } catch (error) {
    console.error(`secret-scan-adapter: could not parse detect-secrets output: ${error.message}`);
    process.exit(2);
  }
}

console.log("secret-scan-adapter: no supported scanner found (gitleaks or detect-secrets); soft skip");
