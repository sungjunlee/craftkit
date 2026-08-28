import assert from "node:assert/strict";
import test from "node:test";
import { createFixture, runCheck } from "../test-support/verify-fixture.mjs";

// The mirrored-pair machinery is dormant: craft-tune's removal (2026-07) left
// failure-modes.md and shared-principles.md as single canonical copies, so
// `mirroredPairs` in verify-mirrored-refs.mjs is empty. When a real pair
// returns, re-add the drift and missing-file failure tests alongside the new
// entry.

test("passes when mirroredPairs is empty", () => {
  const root = createFixture();

  const result = runCheck(root, "verify-mirrored-refs.mjs", "checkMirroredReferences");

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});
