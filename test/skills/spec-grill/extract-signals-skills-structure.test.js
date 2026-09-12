import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as skills from "../../../skills/spec-grill/scripts/extract-signals-skills.js";
import * as docs from "../../../skills/spec-grill/scripts/extract-signals-docs.js";
import * as scripts from "../../../skills/spec-grill/scripts/extract-signals-scripts.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";
import * as authority from "../../../skills/spec-grill/scripts/extract-signals-authority.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";

const skillsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-skills.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectSkillCandidates",
];

const INTERNAL_HELPERS = [
  "readFrontmatterValue",
];

const KEPT_IN_COLLECTORS = [
  "listDirs",
];

describe("extract-signals-skills structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(skillsModule), true);
    assert.match(path.basename(skillsModule), /extract-signals-skills\.js$/);
  });

  it("owns collectSkillCandidates and helpers only it needs", () => {
    const skillsSource = fs.readFileSync(skillsModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(skillsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-skills.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_COLLECTORS) {
      assert.match(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-collectors.js`);
      assert.doesNotMatch(skillsSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-skills.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(skillsSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(skillsSource, /from "\.\/extract-signals-scripts\.js"/);
    assert.doesNotMatch(skillsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(skillsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(skillsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-skills\.js"/);
  });

  it("re-exports the same collectSkillCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectSkillCandidates, skills.collectSkillCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectSkillCandidates, skills.collectSkillCandidates, "facade re-export should be the same binding");
    assert.equal(collectors.readFrontmatterValue, skills.readFrontmatterValue, "collectors readFrontmatterValue re-export should be the same binding");
    assert.equal(facade.readFrontmatterValue, skills.readFrontmatterValue, "facade readFrontmatterValue re-export should be the same binding");

    assert.equal(typeof skills.collectSkillCandidates, "function");
    assert.equal(skills.collectTestCandidates, undefined);
    assert.equal(skills.collectScriptCandidates, undefined);
    assert.equal(skills.collectDocCandidates, undefined);

    assert.equal(docs.collectSkillCandidates, undefined);
    assert.equal(scripts.collectSkillCandidates, undefined);
    assert.equal(charter.collectSkillCandidates, undefined);
    assert.equal(authority.collectSkillCandidates, undefined);
    assert.equal(core.collectSkillCandidates, undefined);
  });
});
