import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { repoRoot, writeFile } from "../test-support/verify-fixture.mjs";

const CHECK_MODULES = [
  { file: "verify-json.mjs", exports: ["checkJsonFiles"] },
  { file: "verify-package-boundary.mjs", exports: ["checkPackageBoundary"] },
  { file: "verify-skill-files.mjs", exports: ["checkSkillFiles"] },
  { file: "verify-explicit-only.mjs", exports: ["checkOpenAiInvocationPolicies"] },
  { file: "verify-mirrored-refs.mjs", exports: ["checkMirroredReferences"] },
  { file: "verify-references.mjs", exports: ["checkReferenceIndex", "checkRequiredSkillReferences"] },
  { file: "verify-section-contract.mjs", exports: ["checkFamilySectionContract"] },
  { file: "verify-terminology.mjs", exports: ["checkTerminology"] },
  { file: "verify-documentation-paths.mjs", exports: ["checkDocumentationPaths"] },
  { file: "verify-pack-dry-run.mjs", exports: ["checkPackDryRun"] },
];

const CHECK_ORDER = CHECK_MODULES.flatMap((module) => module.exports);

function createOrchestratorFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "craftkit-verify-orchestrator-"));
  fs.cpSync(path.join(repoRoot, "scripts"), path.join(root, "scripts"), { recursive: true });
  return root;
}

function installCheckStubs(root, actions = {}) {
  for (const { file, exports } of CHECK_MODULES) {
    const body = [
      `import { fail, warn } from "./verify-shared.mjs";`,
      ...exports.map((name) => {
        const action = actions[name] ?? "";
        return `export function ${name}() {\n  console.log("check:${name}");\n  ${action}\n}`;
      }),
    ].join("\n\n");

    writeFile(root, `scripts/${file}`, `${body}\n`);
  }
}

function runOrchestrator(root) {
  // Spawn the fixture's own copy of the script. Resolve through fs.realpathSync:
  // on macOS, os.tmpdir() returns a /var path that is itself a symlink to
  // /private/var, so the raw path and the resolved import.meta.url the script
  // sees at runtime wouldn't match, and the entry-point guard at the bottom of
  // verify.mjs would silently skip main().
  const scriptPath = fs.realpathSync(path.join(root, "scripts/verify.mjs"));

  return spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN: "1" },
  });
}

function recordedChecks(stdout) {
  return stdout.split("\n").filter((line) => line.startsWith("check:")).map((line) => line.slice("check:".length));
}

test("runs registered checks in order and reports pass when none fail", () => {
  const root = createOrchestratorFixture();
  installCheckStubs(root);

  const result = runOrchestrator(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(recordedChecks(result.stdout), CHECK_ORDER);
  assert.match(result.stdout, /verify passed/);
});

test("aggregates failures from multiple checks into one report and exits non-zero", () => {
  const root = createOrchestratorFixture();
  installCheckStubs(root, {
    checkJsonFiles: 'fail("json broken");',
    checkSkillFiles: 'fail("skill-files broken");',
    checkTerminology: 'warn("term warn");',
  });

  const result = runOrchestrator(root);
  const output = `${result.stdout}\n${result.stderr}`;

  assert.notEqual(result.status, 0);
  assert.deepEqual(recordedChecks(result.stdout), CHECK_ORDER);
  assert.match(result.stderr, /verify failed:/);
  assert.match(output, /json broken/);
  assert.match(output, /skill-files broken/);
  assert.match(output, /warning: term warn/);
  assert.doesNotMatch(result.stdout, /verify passed/);

  const jsonIndex = output.indexOf("json broken");
  const skillIndex = output.indexOf("skill-files broken");
  assert.ok(jsonIndex !== -1 && skillIndex !== -1 && jsonIndex < skillIndex);
});

test("prints warnings and still passes when there are no failures", () => {
  const root = createOrchestratorFixture();
  installCheckStubs(root, {
    checkTerminology: 'warn("just a warning");',
  });

  const result = runOrchestrator(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
  assert.match(`${result.stdout}\n${result.stderr}`, /warning: just a warning/);
});

test("does not re-assert check-module rule bodies", () => {
  const root = createOrchestratorFixture();
  installCheckStubs(root);

  // These would fail json / package-boundary / skill-files / explicit-only /
  // documentation-paths if the orchestrator still ran real rule bodies.
  writeFile(root, "bad.json", "{ nope");
  writeFile(root, "package.json", `${JSON.stringify({ name: "broken" }, null, 2)}\n`);
  const body = Array.from({ length: 221 }, (_, index) => `line ${index + 1}`).join("\n");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: Example skill.\ndisable-model-invocation: true\n---\n${body}\n`);
  writeFile(root, "README.md", "# Fixture\n");

  const result = runOrchestrator(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /220-line|50-word|invalid JSON|files allowlist|disable-model-invocation|30-second path/);
});

test("orchestrator source registers checks and does not contain rule-body budgets", () => {
  const source = fs.readFileSync(path.join(repoRoot, "scripts/verify.mjs"), "utf8");

  for (const name of CHECK_ORDER) {
    assert.match(source, new RegExp(`${name}\\(\\)`));
  }

  assert.doesNotMatch(source, /maxSkillSoftLines|maxDescriptionWords|220-line|50-word|disable-model-invocation/);
});
