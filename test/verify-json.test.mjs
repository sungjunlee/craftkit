import assert from "node:assert/strict";
import test from "node:test";
import { createFixture, expectCheckFailure, runCheck, writeFile } from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-json.mjs";
const fn = "checkJsonFiles";

test("passes when every checked-in JSON file is valid", () => {
  const root = createFixture();

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

expectCheckFailure("fails on invalid checked-in JSON", moduleFile, fn, (root) => {
  writeFile(root, "bad.json", "{ nope");
}, /bad\.json is invalid JSON/);
