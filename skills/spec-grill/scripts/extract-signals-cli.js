/**
 * CLI parse and JSON/human/dry-run output glue for extract-signals.js.
 *
 * parseArgs and the report print path live here. extractSignals
 * orchestration stays in extract-signals.js.
 */

import { formatHumanReport } from "./extract-signals-report.js";

const DEFAULT_COMMIT_LIMIT = 100;

function usage() {
  return "Usage: extract-signals.js [--repo-root PATH] [--commit-limit N] [--dry-run] [--json]";
}

export function parseArgs(args) {
  const options = {
    repoRoot: ".",
    commitLimit: DEFAULT_COMMIT_LIMIT,
    dryRun: false,
    json: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--dry-run") { options.dryRun = true; continue; }
    if (arg === "--json")    { options.json = true;   continue; }
    if (arg === "--help" || arg === "-h") return { ...options, help: true };

    if (arg === "--repo-root") {
      const next = args[i + 1];
      if (!next || next.startsWith("-")) return { ...options, error: `Missing value for --repo-root. ${usage()}` };
      options.repoRoot = next; i += 1; continue;
    }
    if (arg.startsWith("--repo-root=")) {
      options.repoRoot = arg.slice("--repo-root=".length); continue;
    }
    if (arg === "--commit-limit") {
      const next = args[i + 1];
      if (!next || !/^[1-9]\d*$/.test(next)) {
        return { ...options, error: `--commit-limit expects a positive integer. ${usage()}` };
      }
      options.commitLimit = Number(next); i += 1; continue;
    }
    if (arg.startsWith("--commit-limit=")) {
      const raw = arg.slice("--commit-limit=".length);
      if (!/^[1-9]\d*$/.test(raw)) {
        return { ...options, error: `--commit-limit expects a positive integer. ${usage()}` };
      }
      options.commitLimit = Number(raw); continue;
    }
    return { ...options, error: `Unknown argument: ${arg}. ${usage()}` };
  }

  return options;
}

export function runCli(extractSignals) {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) { console.error(parsed.error); process.exit(1); }
  if (parsed.help) { console.log(usage()); return; }

  const result = extractSignals(parsed);

  if (parsed.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(formatHumanReport(result));
  if (parsed.dryRun) {
    console.log("");
    console.log("[dry-run] No files written. extract-signals never writes; the flag is a no-op for parity with sibling scripts.");
  }
}
