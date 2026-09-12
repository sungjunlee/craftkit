import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as frontmatter from "../../../skills/craft-handoff/scripts/load-pending-frontmatter.mjs";

const frontmatterModule = fileURLToPath(
  new URL("../../../skills/craft-handoff/scripts/load-pending-frontmatter.mjs", import.meta.url),
);
const hookModule = fileURLToPath(
  new URL("../../../skills/craft-handoff/scripts/load-pending-hook.mjs", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "parseFrontmatter",
  "stripFrontmatter",
];

const PARENT_FUNCTIONS = [
  "currentWorktree",
  "archive",
];

describe("load-pending-frontmatter structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(frontmatterModule), true);
    assert.match(path.basename(frontmatterModule), /load-pending-frontmatter\.mjs$/);
  });

  it("owns frontmatter parse/strip; hook keeps currentWorktree, archive, and main flow", () => {
    const frontmatterSource = fs.readFileSync(frontmatterModule, "utf8");
    const hookSource = fs.readFileSync(hookModule, "utf8");

    for (const name of OWNED_FUNCTIONS) {
      assert.match(frontmatterSource, new RegExp(`function ${name}\\(`), `${name} should be defined in load-pending-frontmatter.mjs`);
      assert.doesNotMatch(hookSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in load-pending-hook.mjs`);
    }

    for (const name of PARENT_FUNCTIONS) {
      assert.match(hookSource, new RegExp(`function ${name}\\(`), `${name} should stay in load-pending-hook.mjs`);
      assert.doesNotMatch(frontmatterSource, new RegExp(`function ${name}\\(`), `${name} should not move into load-pending-frontmatter.mjs`);
    }

    assert.match(hookSource, /from "\.\/load-pending-frontmatter\.mjs"/);
    assert.match(hookSource, /const worktree = currentWorktree\(\)/);
    assert.match(hookSource, /process\.stdout\.write\(JSON\.stringify\(payload\)\)/);
    assert.match(hookSource, /archive\(chosen\.path\)/);
    assert.doesNotMatch(frontmatterSource, /process\.stdout\.write/);
    assert.doesNotMatch(frontmatterSource, /function currentWorktree\(/);
    assert.doesNotMatch(frontmatterSource, /function archive\(/);
  });

  it("exports parseFrontmatter and stripFrontmatter from the sibling", () => {
    for (const name of OWNED_FUNCTIONS) {
      assert.equal(typeof frontmatter[name], "function", `${name} should be exported`);
    }

    assert.equal(frontmatter.currentWorktree, undefined);
    assert.equal(frontmatter.archive, undefined);
  });

  it("parses and strips the tiny key:value frontmatter the hook writes", () => {
    const text = "---\nworktree: /tmp/repo\nbranch: main\ncreated: 2026-09-12T00:00:00.000Z\n---\n\nResume here.\n";

    assert.deepEqual(frontmatter.parseFrontmatter(text), {
      worktree: "/tmp/repo",
      branch: "main",
      created: "2026-09-12T00:00:00.000Z",
    });
    assert.equal(frontmatter.stripFrontmatter(text), "Resume here.\n");
    assert.deepEqual(frontmatter.parseFrontmatter("# no fence\n"), {});
    assert.equal(frontmatter.stripFrontmatter("# no fence\n"), "# no fence\n");
  });
});
