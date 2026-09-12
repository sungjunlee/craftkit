import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as sourceSurface from "../../../skills/spec-grill/scripts/extract-signals-source-surface.js";
import * as skills from "../../../skills/spec-grill/scripts/extract-signals-skills.js";
import * as docs from "../../../skills/spec-grill/scripts/extract-signals-docs.js";
import * as scripts from "../../../skills/spec-grill/scripts/extract-signals-scripts.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";
import * as authority from "../../../skills/spec-grill/scripts/extract-signals-authority.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";

const sourceSurfaceModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-source-surface.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectSourceSurfaceCandidates",
];

const INTERNAL_HELPERS = [
  "listSourceSurfaceEntries",
];

const KEPT_IN_COLLECTORS = [
  "collectTestCandidates",
  "listDirs",
];

describe("extract-signals-source-surface structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(sourceSurfaceModule), true);
    assert.match(path.basename(sourceSurfaceModule), /extract-signals-source-surface\.js$/);
  });

  it("owns collectSourceSurfaceCandidates and helpers only it needs", () => {
    const sourceSurfaceSource = fs.readFileSync(sourceSurfaceModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(sourceSurfaceSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-source-surface.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_COLLECTORS) {
      assert.match(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-collectors.js`);
      assert.doesNotMatch(sourceSurfaceSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-source-surface.js`);
    }

    assert.doesNotMatch(sourceSurfaceSource, /function collectSkillCandidates\(/);
    assert.match(collectorsSource, /from "\.\/extract-signals-source-surface\.js"/);
    assert.doesNotMatch(sourceSurfaceSource, /from "\.\/extract-signals-scripts\.js"/);
    assert.doesNotMatch(sourceSurfaceSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(sourceSurfaceSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(sourceSurfaceSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(sourceSurfaceSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(sourceSurfaceSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-source-surface\.js"/);
  });

  it("re-exports the same collectSourceSurfaceCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectSourceSurfaceCandidates, sourceSurface.collectSourceSurfaceCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectSourceSurfaceCandidates, sourceSurface.collectSourceSurfaceCandidates, "facade re-export should be the same binding");

    assert.equal(typeof sourceSurface.collectSourceSurfaceCandidates, "function");
    assert.equal(sourceSurface.listSourceSurfaceEntries, undefined);
    assert.equal(sourceSurface.collectSkillCandidates, undefined);
    assert.equal(sourceSurface.collectScriptCandidates, undefined);
    assert.equal(sourceSurface.collectDocCandidates, undefined);
    assert.equal(sourceSurface.collectTestCandidates, undefined);
    assert.equal(sourceSurface.listDirs, undefined);

    assert.equal(skills.collectSourceSurfaceCandidates, undefined);
    assert.equal(docs.collectSourceSurfaceCandidates, undefined);
    assert.equal(scripts.collectSourceSurfaceCandidates, undefined);
    assert.equal(charter.collectSourceSurfaceCandidates, undefined);
    assert.equal(authority.collectSourceSurfaceCandidates, undefined);
    assert.equal(core.collectSourceSurfaceCandidates, undefined);

    assert.equal(collectors.listSourceSurfaceEntries, undefined);
    assert.equal(facade.listSourceSurfaceEntries, undefined);
  });
});
