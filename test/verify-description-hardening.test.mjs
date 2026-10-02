/**
 * Description contract hardening: edge cases and boundary validation for
 * frontmatter description field. Expands deprescription coverage beyond the
 * basic checks in verify-skill-files.test.mjs.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { spineProviderFindings } from "../scripts/verify-skill-files.mjs";
import { createFixture, expectCheckFailure, runCheck, writeFile } from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-skill-files.mjs";
const fn = "checkSkillFiles";

// --- Word count boundary cases ---

test("description with exactly 50 words passes", () => {
  const root = createFixture();
  const words = Array.from({ length: 50 }, (_, i) => `word${i + 1}`).join(" ");
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: ${words}
---

# Example
`,
  );

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure(
  "description with 51 words fails",
  moduleFile,
  fn,
  (root) => {
    const words = Array.from({ length: 51 }, (_, i) => `word${i + 1}`).join(" ");
    writeFile(
      root,
      "skills/example/SKILL.md",
      `---
name: example
description: ${words}
---

# Example
`,
    );
  },
  /over the 50-word trigger budget/,
);

test("description word count ignores extra whitespace", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Word  with   multiple    spaces     still counts as one.
---

# Example
`,
  );

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

// --- Multi-line description formats ---

test("description using pipe literal block style", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: |
  Craft prompts for various use cases. Use when writing
  prompts or turning notes into templates.
---

# Example
`,
  );

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("description using folded block style", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: >
  Craft prompts for various use cases. Use when writing
  prompts or turning notes into templates.
---

# Example
`,
  );

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure(
  "multi-line description exceeding 50 words fails",
  moduleFile,
  fn,
  (root) => {
    const words = Array.from({ length: 51 }, (_, i) => `word${i + 1}`).join(" ");
    writeFile(
      root,
      "skills/example/SKILL.md",
      `---
name: example
description: |
  ${words}
---

# Example
`,
    );
  },
  /over the 50-word trigger budget/,
);

// --- Provider neutrality edge cases ---

test("spineProviderFindings detects provider names with varied casing", () => {
  assert.deepEqual(spineProviderFindings("Use CLAUDE for generation"), ["CLAUDE"]);
  assert.deepEqual(spineProviderFindings("Works with OpenAI models"), ["OpenAI"]);
  assert.deepEqual(spineProviderFindings("Built on Anthropic APIs"), ["Anthropic"]);
});

test("spineProviderFindings detects multiple provider mentions", () => {
  assert.deepEqual(
    spineProviderFindings("Compare Claude vs ChatGPT vs Gemini outputs"),
    ["Claude", "ChatGPT", "Gemini"],
  );
});

test("spineProviderFindings with provider name at string boundaries", () => {
  assert.deepEqual(spineProviderFindings("Claude"), ["Claude"]);
  assert.deepEqual(spineProviderFindings("Use ChatGPT."), ["ChatGPT"]);
  assert.deepEqual(spineProviderFindings("(OpenAI)"), ["OpenAI"]);
});

test("spineProviderFindings ignores provider-like words mid-compound", () => {
  assert.deepEqual(spineProviderFindings("pseudoclaude system"), []);
  assert.deepEqual(spineProviderFindings("microchatgpt library"), []);
  assert.deepEqual(spineProviderFindings("nanogemini framework"), []);
});

test("spineProviderFindings with hyphen-separated words detects provider names", () => {
  assert.deepEqual(spineProviderFindings("claude-powered tool"), ["claude"]);
  assert.deepEqual(spineProviderFindings("chatgpt-compatible API"), ["chatgpt"]);
});

expectCheckFailure(
  "description with 'Anthropic' fails",
  moduleFile,
  fn,
  (root) => {
    writeFile(
      root,
      "skills/example/SKILL.md",
      `---
name: example
description: Use Anthropic models to generate prompts.
---

# Example
`,
    );
  },
  /description names a provider's tool \("Anthropic"\)/,
);

expectCheckFailure(
  "description with 'Gemini' fails",
  moduleFile,
  fn,
  (root) => {
    writeFile(
      root,
      "skills/example/SKILL.md",
      `---
name: example
description: Generate outputs using Gemini for evaluation.
---

# Example
`,
    );
  },
  /description names a provider's tool \("Gemini"\)/,
);

expectCheckFailure(
  "description with 'Codex' fails",
  moduleFile,
  fn,
  (root) => {
    writeFile(
      root,
      "skills/example/SKILL.md",
      `---
name: example
description: Build prompts with Codex assistance for tests.
---

# Example
`,
    );
  },
  /description names a provider's tool \("Codex"\)/,
);

// --- Description presence and format validation ---

expectCheckFailure(
  "empty description fails",
  moduleFile,
  fn,
  (root) => {
    writeFile(
      root,
      "skills/example/SKILL.md",
      `---
name: example
description: 
---

# Example
`,
    );
  },
  /frontmatter must include description/,
);

test("description handles quoted strings correctly", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: "Craft prompts for various use cases."
---

# Example
`,
  );

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("description handles single-quoted strings", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: 'Craft prompts for various use cases.'
---

# Example
`,
  );

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

// --- Cross-validation: description trigger wording for model-invocable skills ---

test("explicit-only skill can omit trigger wording in description", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Produce paired artifacts without trigger wording.
disable-model-invocation: true
---

# Example
`,
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  allow_implicit_invocation: false\n");

  const result = runCheck(root, moduleFile, fn);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("description capability naming: good examples", () => {
  const goodDescriptions = [
    "Craft copy-paste-ready prompts from notes",
    "Produce paired session-handoff artifacts",
    "Design component specifications with quality gates",
    "Evaluate prompt quality and surface issues",
  ];

  for (const desc of goodDescriptions) {
    const findings = spineProviderFindings(desc);
    assert.deepEqual(findings, [], `Good description should have no provider findings: "${desc}"`);
  }
});

test("description capability naming: bad examples with provider names", () => {
  const badDescriptions = [
    "Use Claude to craft prompts",
    "Build prompts for ChatGPT",
    "Generate outputs with OpenAI models",
    "Anthropic-based prompt generation",
  ];

  for (const desc of badDescriptions) {
    const findings = spineProviderFindings(desc);
    assert.ok(findings.length > 0, `Bad description should have provider findings: "${desc}"`);
  }
});
