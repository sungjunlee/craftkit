/**
 * Explicit-only pairing: disable-model-invocation: true must match
 * agents/openai.yaml policy.allow_implicit_invocation: false.
 * Called from scripts/verify.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { root, fail, listFiles, relative, readText, parseFrontmatter } from "./verify-shared.mjs";

function parseOpenAiInvocationPolicy(text) {
  const lines = text.split(/\r?\n/);
  let inPolicy = false;
  let hasPolicy = false;

  for (const line of lines) {
    if (/^\s*(#.*)?$/.test(line)) {
      continue;
    }

    const indent = line.match(/^\s*/)[0].length;
    const trimmed = line.replace(/\s+#.*$/, "").trim();

    if (indent === 0) {
      inPolicy = /^policy:\s*$/.test(trimmed);
      hasPolicy ||= inPolicy;
      continue;
    }

    if (!inPolicy) {
      continue;
    }

    const match = trimmed.match(/^allow_implicit_invocation:\s*(true|false)\s*$/);
    if (match) {
      return { hasPolicy, allowImplicit: match[1] === "true" };
    }
  }

  return { hasPolicy, allowImplicit: null };
}

export function checkOpenAiInvocationPolicies() {
  const skillFiles = listFiles(path.join(root, "skills"), (item) => path.basename(item) === "SKILL.md");

  for (const filePath of skillFiles) {
    const text = readText(filePath);
    const frontmatter = parseFrontmatter(text);
    const skillDir = path.dirname(filePath);
    const skillName = path.basename(skillDir);
    const openAiYamlPath = path.join(skillDir, "agents", "openai.yaml");
    const claudeExplicitOnly = Boolean(frontmatter?.match(/^disable-model-invocation:\s*true\s*$/m));

    if (!fs.existsSync(openAiYamlPath)) {
      if (claudeExplicitOnly) {
        fail(`${relative(filePath)} has disable-model-invocation: true but is missing ${path.join("skills", skillName, "agents", "openai.yaml")} with policy.allow_implicit_invocation: false`);
      }
      continue;
    }

    const { hasPolicy, allowImplicit } = parseOpenAiInvocationPolicy(readText(openAiYamlPath));
    if (hasPolicy && allowImplicit === null) {
      fail(`${relative(openAiYamlPath)} must include policy.allow_implicit_invocation as true or false`);
      continue;
    }

    if (claudeExplicitOnly && !hasPolicy) {
      fail(`${relative(openAiYamlPath)} must include policy.allow_implicit_invocation: false because ${relative(filePath)} is explicit-only`);
      continue;
    }

    if (claudeExplicitOnly && allowImplicit !== false) {
      fail(`${relative(openAiYamlPath)} must set policy.allow_implicit_invocation: false because ${relative(filePath)} is explicit-only`);
    }

    if (!claudeExplicitOnly && allowImplicit === false) {
      fail(`${relative(openAiYamlPath)} sets policy.allow_implicit_invocation: false but ${relative(filePath)} is missing disable-model-invocation: true`);
    }
  }
}
