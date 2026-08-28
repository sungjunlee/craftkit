import assert from "node:assert/strict";
import test from "node:test";
import { createFixture, expectCheckFailure, runCheck, writeFile } from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-documentation-paths.mjs";
const fn = "checkDocumentationPaths";

test("passes when README and docs/status.md include the required path text", () => {
  const root = createFixture();

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

expectCheckFailure("fails when README required path text is missing", moduleFile, fn, (root) => {
  writeFile(root, "README.md", "# Fixture\n");
}, /README\.md must include ## 30-second path/);

expectCheckFailure("fails when README leaks maintainer-local autoresearch paths", moduleFile, fn, (root) => {
  writeFile(
    root,
    "README.md",
    "# Fixture\n\n## 30-second path\n\nSee docs/status.md and run npm run verify.\n\n`~/.craftkit/autoresearch/example/run`\n",
  );
}, /README\.md must keep maintainer-local autoresearch paths in docs\/status\.md/);

expectCheckFailure("fails when docs status is missing required evidence text", moduleFile, fn, (root) => {
  writeFile(root, "docs/status.md", "# Status\n");
}, /docs\/status\.md must include Public evidence/);
