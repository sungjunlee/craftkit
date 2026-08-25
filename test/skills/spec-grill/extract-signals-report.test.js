import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatHumanReport } from "../../../skills/spec-grill/scripts/extract-signals-report.js";

const reportModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-report.js", import.meta.url),
);

describe("extract-signals-report module", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(reportModule), true);
    assert.match(path.basename(reportModule), /extract-signals-report\.js$/);
  });

  it("keeps the Signals and greenfield section headings", () => {
    const report = formatHumanReport({
      inventory: {
        repoRoot: "/x",
        readmeFound: false,
        charterFound: false,
        claudeMdFound: false,
        sourceRoot: null,
        sourceDirCount: 0,
        commitsScanned: 0,
        commitScopeCount: 0,
        charterObjectiveCount: 0,
      },
      capabilities: [],
    });
    assert.match(report, /^Repo: /m);
    assert.match(report, /^Signals:/m);
    assert.match(report, /greenfield/);
  });

  it("keeps the raw-signal and next-step headings", () => {
    const report = formatHumanReport({
      inventory: {
        repoRoot: "/x",
        readmeFound: true,
        charterFound: false,
        claudeMdFound: false,
        sourceRoot: "src",
        sourceDirCount: 1,
        commitsScanned: 1,
        commitScopeCount: 1,
        charterObjectiveCount: 0,
      },
      capabilities: [{ name: "auth", signals: ["src/auth/"], candidate_goal: "", candidate_scope: "" }],
    });
    assert.match(report, /Raw capability signals \(1/);
    assert.match(report, /interview seeds/);
    assert.match(report, /Next: ask `spec-grill`/);
  });
});
