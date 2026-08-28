import assert from "node:assert/strict";
import test from "node:test";
import { createFixture, expectCheckFailure, runCheck, writeFile } from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-explicit-only.mjs";
const fn = "checkOpenAiInvocationPolicies";

test("passes when explicit-only skills include paired Codex policy", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  allow_implicit_invocation: false\n");

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("passes when explicit-only Codex policy has inline YAML comments", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy: # Codex invocation policy\n  allow_implicit_invocation: false # explicit only\n");

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("passes when openai.yaml contains interface metadata without invocation policy", () => {
  const root = createFixture();
  writeFile(root, "skills/example/agents/openai.yaml", "interface:\n  display_name: \"Example\"\n");

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure("fails when a Claude explicit-only skill lacks Codex policy", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
}, /missing skills\/example\/agents\/openai\.yaml/);

expectCheckFailure("fails when Codex explicit-only policy lacks Claude field", moduleFile, fn, (root) => {
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  allow_implicit_invocation: false\n");
}, /sets policy\.allow_implicit_invocation: false but skills\/example\/SKILL\.md is missing disable-model-invocation: true/);

expectCheckFailure("fails when Codex policy omits allow_implicit_invocation", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  other: false\n");
}, /must include policy\.allow_implicit_invocation as true or false/);
