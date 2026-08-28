import assert from "node:assert/strict";
import test from "node:test";
import { spineProviderFindings } from "../scripts/verify-skill-files.mjs";
import { createFixture, expectCheckFailure, runCheck, writeFile } from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-skill-files.mjs";
const fn = "checkSkillFiles";

function runSkillFiles(root) {
  return runCheck(root, moduleFile, fn);
}

test("passes against a minimal valid skill fixture", () => {
  const root = createFixture();

  const result = runSkillFiles(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

expectCheckFailure("fails when skill frontmatter is missing", moduleFile, fn, (root) => {
  writeFile(root, "skills/example/SKILL.md", "# Example\n");
}, /skills\/example\/SKILL\.md must start with YAML frontmatter/);

expectCheckFailure("fails when skill frontmatter name is missing", moduleFile, fn, (root) => {
  writeFile(root, "skills/example/SKILL.md", "---\ndescription: Example skill.\n---\n\n# Example\n");
}, /skills\/example\/SKILL\.md frontmatter must include name/);

expectCheckFailure("fails when skill frontmatter description is missing", moduleFile, fn, (root) => {
  writeFile(root, "skills/example/SKILL.md", "---\nname: example\n---\n\n# Example\n");
}, /skills\/example\/SKILL\.md frontmatter must include description/);

expectCheckFailure("fails when a skill exceeds the 500-line ceiling", moduleFile, fn, (root) => {
  const body = Array.from({ length: 501 }, (_, index) => `line ${index + 1}`).join("\n");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: Example skill.\n---\n${body}\n`);
}, /over the 500-line hard ceiling/);

expectCheckFailure("fails when a skill exceeds the 220-line soft budget", moduleFile, fn, (root) => {
  const body = Array.from({ length: 221 }, (_, index) => `line ${index + 1}`).join("\n");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: Example skill.\n---\n${body}\n`);
}, /over the 220-line soft budget/);

expectCheckFailure("fails when a skill description exceeds the trigger budget", moduleFile, fn, (root) => {
  const words = Array.from({ length: 51 }, (_, index) => `word${index + 1}`).join(" ");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: ${words}\n---\n\n# Example\n`);
}, /over the 50-word trigger budget/);

// --- Check: spine provider-neutrality invariant (AGENTS.md "Spine text names
// the capability, not a provider's tool"; docs/skill-anatomy.md "Frontmatter
// contract"). Scope is the frontmatter `description` only — Examples/guides may
// name tools. ---

test("passes when a capability-neutral description is used even if the Example body names a provider tool", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Critique a prompt or skill and surface what needs fixing.\n---\n\n# Example\n\n## Purpose\n\nDoes a thing.\n\n## Example\n\nInput: a Claude Code prompt\nOutput: findings\n",
  );

  const result = runSkillFiles(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure("fails when a skill description names a provider's tool", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Build outputs using Claude Code for evaluation.\n---\n\n# Example\n",
  );
}, /description names a provider's tool \("Claude"\)/);

expectCheckFailure("fails when a skill description names an OpenAI model by product name", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Use ChatGPT to draft the response for tests.\n---\n\n# Example\n",
  );
}, /description names a provider's tool \("ChatGPT"\)/);

test("spineProviderFindings reports provider terms with case preserved and deduped", () => {
  assert.deepEqual(
    spineProviderFindings("Build with Claude Code, then run Claude again."),
    ["Claude"],
  );
  assert.deepEqual(
    spineProviderFindings("Use Claude or ChatGPT to draft"),
    ["Claude", "ChatGPT"],
  );
  assert.deepEqual(spineProviderFindings("Critique any prompt, any skill."), []);
});

test("spineProviderFindings matches terms on word boundaries, not mid-word", () => {
  assert.deepEqual(spineProviderFindings("Tune llamafine output."), []);
  assert.deepEqual(spineProviderFindings("Build a claudecode helper."), []);
  // A hyphen is a word boundary, so provider product names separated that way
  // are still caught.
  assert.deepEqual(spineProviderFindings("Noble-chatgpt-adjacent."), ["chatgpt"]);
});

test("spineProviderFindings ignores ordinary English that collides with product names", () => {
  assert.deepEqual(
    spineProviderFindings("Move the cursor between fields. Grok the repo."),
    [],
  );
});
