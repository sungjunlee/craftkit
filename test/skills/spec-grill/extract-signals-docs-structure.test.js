import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as docs from "../../../skills/spec-grill/scripts/extract-signals-docs.js";
import * as scripts from "../../../skills/spec-grill/scripts/extract-signals-scripts.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";
import * as authority from "../../../skills/spec-grill/scripts/extract-signals-authority.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";

const docsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-docs.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectDocCandidates",
];

const INTERNAL_HELPERS = [
  "hasSlugBoundaryMatch",
  "listMarkdownFiles",
];

const KEPT_IN_COLLECTORS = [
  "listDirs",
];

describe("extract-signals-docs structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(docsModule), true);
    assert.match(path.basename(docsModule), /extract-signals-docs\.js$/);
  });

  it("owns collectDocCandidates and helpers only it needs", () => {
    const docsSource = fs.readFileSync(docsModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(docsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-docs.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_COLLECTORS) {
      assert.match(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-collectors.js`);
      assert.doesNotMatch(docsSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-docs.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(docsSource, /from "\.\/extract-signals-scripts\.js"/);
    assert.doesNotMatch(docsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(docsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(docsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-docs\.js"/);
  });

  it("re-exports the same collectDocCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectDocCandidates, docs.collectDocCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectDocCandidates, docs.collectDocCandidates, "facade re-export should be the same binding");

    assert.equal(typeof docs.collectDocCandidates, "function");
    assert.equal(docs.collectSkillCandidates, undefined);
    assert.equal(docs.collectScriptCandidates, undefined);
    assert.equal(docs.collectTestCandidates, undefined);

    assert.equal(scripts.collectDocCandidates, undefined);
    assert.equal(charter.collectDocCandidates, undefined);
    assert.equal(authority.collectDocCandidates, undefined);
    assert.equal(core.collectDocCandidates, undefined);
  });
});
