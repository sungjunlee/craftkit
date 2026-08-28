import assert from "node:assert/strict";
import test from "node:test";
import {
  createFixture,
  expectCheckFailure,
  runCheck,
  updatePackageJson,
} from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-package-boundary.mjs";
const fn = "checkPackageBoundary";

test("passes when package files allowlist and verify/test scripts match the contract", () => {
  const root = createFixture();

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

expectCheckFailure("fails when package files allowlist is missing", moduleFile, fn, (root) => {
  updatePackageJson(root, (packageJson) => {
    delete packageJson.files;
  });
}, /package\.json must declare a files allowlist/);

expectCheckFailure("fails when scripts.verify points elsewhere", moduleFile, fn, (root) => {
  updatePackageJson(root, (packageJson) => {
    packageJson.scripts.verify = "node scripts/other.mjs";
  });
}, /scripts\.verify must run node scripts\/verify\.mjs/);

expectCheckFailure("fails when scripts.test is missing", moduleFile, fn, (root) => {
  updatePackageJson(root, (packageJson) => {
    delete packageJson.scripts.test;
  });
}, /scripts\.test must run node --test/);
