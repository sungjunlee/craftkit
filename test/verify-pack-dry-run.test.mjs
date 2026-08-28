import assert from "node:assert/strict";
import test from "node:test";
import {
  createFixture,
  expectCheckFailure,
  removeFile,
  runCheck,
  updatePackageJson,
  writeFile,
} from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-pack-dry-run.mjs";
const fn = "checkPackDryRun";
const packOptions = { skipPackDryRun: false };

test("passes when npm pack --dry-run includes required files and omits test artifacts", () => {
  const root = createFixture();

  const result = runCheck(root, moduleFile, fn, packOptions);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

expectCheckFailure("fails when npm package misses a required file", moduleFile, fn, (root) => {
  removeFile(root, "AGENTS.md");
}, /npm package is missing AGENTS\.md/, packOptions);

expectCheckFailure("fails when npm package includes forbidden local test artifacts", moduleFile, fn, (root) => {
  updatePackageJson(root, (packageJson) => {
    packageJson.files.push("test/");
  });
  writeFile(root, "test/generated-output.txt", "not for package\n");
}, /npm package must not include test\/generated-output\.txt/, packOptions);

expectCheckFailure("fails when npm package includes skill script tests", moduleFile, fn, (root) => {
  writeFile(root, "skills/example/scripts/helper.test.js", "export {};\n");
}, /npm package must not include skills\/example\/scripts\/helper\.test\.js/, packOptions);

expectCheckFailure("fails when npm package includes skill script jsx/tsx specs", moduleFile, fn, (root) => {
  writeFile(root, "skills/example/scripts/helper.spec.tsx", "export {};\n");
}, /npm package must not include skills\/example\/scripts\/helper\.spec\.tsx/, packOptions);
