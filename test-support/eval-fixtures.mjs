/**
 * Shared fixture data for eval-style tests (conveyance, judgment contracts).
 * Used by verify-output-conveyance.test.mjs and similar eval-focused tests.
 */

/**
 * Example judgment-contract outputs for conveyance validation.
 * Based on #155's craft-critique autoresearch eval patterns.
 */
export const judgmentContractExamples = {
  // Good example: HIGH findings with file:line evidence
  goodFindings: [
    {
      severity: "HIGH",
      issue: "Unvalidated user input in processRequest",
      evidence: "file:line server.js:42 - no sanitization before SQL query",
      rationale: "Direct SQL injection vector",
    },
    {
      severity: "MED",
      issue: "Missing error handling in async operation",
      evidence: "file:line api.js:15-17 - await without try/catch",
      rationale: "Uncaught exceptions will crash the process",
    },
  ],

  // Bad example: missing evidence
  badFindingsNoEvidence: [
    {
      severity: "HIGH",
      issue: "Security vulnerability",
      evidence: null,
      rationale: "Needs to be fixed",
    },
  ],

  // Good strengths: specific elements named
  goodStrengths: [
    "Null checks at lines 15-17 prevent TypeError crashes",
    "Input validation function validateEmail() at line 42 rejects malformed addresses",
    "Error recovery in handleRequest() (lines 100-105) logs and continues",
  ],

  // Bad strengths: generic positives
  badStrengths: [
    "Good code quality",
    "Well organized",
    "Nice implementation",
    "Great work overall",
  ],

  // Fix ordering with rationale
  goodFixOrdering: [
    {
      order: 1,
      issue: "SQL injection in auth",
      rationale: "security: blocks all other work until fixed",
    },
    {
      order: 2,
      issue: "Add input validation",
      rationale: "dependency: other validation depends on this base check",
    },
    {
      order: 3,
      issue: "Improve error messages",
      rationale: "reach: user-facing, high visibility",
    },
  ],

  // Bad fix ordering: no rationale
  badFixOrderingNoRationale: [
    { order: 1, issue: "Fix bug" },
    { order: 2, issue: "Add feature" },
  ],
};

/**
 * Skill YAML frontmatter templates for testing.
 */
export const skillFrontmatterTemplates = {
  minimalValid: {
    name: "example",
    description: "Example skill for testing.",
  },

  withAllMetadata: {
    name: "example",
    description: "Example skill with full metadata for testing.",
    "disable-model-invocation": true,
    compatibility: "Requires git.",
    "argument-hint": "create|amend",
    metadata: {
      "related-skills": ["craft-prompt", "spec-charter"],
    },
  },

  providerNeutral: {
    name: "example",
    description: "Critique prompts and surface actionable findings.",
  },

  providerViolation: {
    name: "example",
    description: "Use Claude to generate high-quality prompts.",
  },

  exactWordLimit: {
    name: "example",
    description: Array.from({ length: 50 }, (_, i) => `word${i + 1}`).join(" "),
  },

  overWordLimit: {
    name: "example",
    description: Array.from({ length: 51 }, (_, i) => `word${i + 1}`).join(" "),
  },
};

/**
 * Skill body templates (sections).
 */
export const skillSectionTemplates = {
  craftMinimal: `## Purpose

Does a specific thing.

## Output format

A single deliverable.`,

  craftComplete: `## Purpose

Turn notes into a prompt.

## Use this when

- User asks for a prompt
- Notes need structure

## Inputs

- Raw notes or requirements

## Steps

1. Identify outcome
2. Add necessary context
3. State boundaries

## Output format

One fenced code block, ready to copy-paste.

## Guardrails

- Redact sensitive data
- Keep paths worktree-relative

## Failure modes

- Over-engineering simple asks

## Example

Input: "write a review prompt"
Output: a prompt block

## References

- \`references/guide.md\``,

  specMinimal: `## Execution Contract

### Mode Router

Routes based on explicit intent.

### Completion Contract

Reports what changed and why.

## Domain Rules

What this skill mutates.

## References

- \`references/guide.md\``,

  specComplete: `## Execution Contract

### Mode Router

Explicit user intent wins over file-state inference.

### Completion Contract

Reports changed sections and standing decisions.

### Helper Scripts

- \`scripts/extract.mjs\` — extract signals

## Domain Rules

Charter content and approval gates.

## Verification prompts

- "Add a new constraint." Expected: charter updated, verification passes.

## References

- \`references/charter-shape.md\`
- \`templates/charter.md\``,
};

/**
 * Generate a complete SKILL.md body from frontmatter and sections.
 */
export function generateSkillMd(frontmatter, sections) {
  const fm = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === "object") {
        return `${key}:\n${Object.entries(value)
          .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
          .join("\n")}`;
      }
      return `${key}: ${typeof value === "boolean" ? value : JSON.stringify(value)}`;
    })
    .join("\n");

  return `---
${fm}
---

# ${frontmatter.name}

${sections}
`;
}

/**
 * Conveyance validation helpers (pure functions for unit testing).
 */
export function hasEvidence(finding) {
  return (
    finding.evidence &&
    (finding.evidence.includes("line") ||
      finding.evidence.includes("file:") ||
      finding.evidence.includes("quoted:"))
  );
}

export function hasLocationReference(evidence) {
  return /(line|file:|quoted:|:\d+)/i.test(evidence);
}

export function isGenericPositive(strength) {
  return /^(good|nice|well|great|excellent|amazing|solid)/i.test(strength.trim());
}

export function hasSpecificElements(strength) {
  return /\b(line|function|method|class|variable|file:|at \w+\(\)|in \w+)/i.test(strength);
}

export function hasFixRationale(fixOrder) {
  return (
    fixOrder.rationale &&
    /\b(dependency|reach|risk|reversibility|security|blocks|requires)/i.test(fixOrder.rationale)
  );
}

/**
 * Proportionality check: output should scale with input size.
 */
export function isProportional(inputSize, outputSize, maxRatio = 3) {
  if (inputSize < 10) {
    // Small inputs should get short outputs
    return outputSize < 30;
  }
  return outputSize / inputSize < maxRatio;
}
