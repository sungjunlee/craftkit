# Eval and Fixture Coverage

This document describes the expanded eval/fixture test coverage added to CraftKit. All tests are CI-friendly (no secrets, no host-only dependencies) and keep `npm test` and `npm run verify` green.

## Overview

Three new test suites expand validation beyond basic structure checks:

1. **Output conveyance** (`verify-output-conveyance.test.mjs`) — validates that skill outputs deliver what they promise
2. **Deprescription hardening** (`verify-description-hardening.test.mjs`) — edge cases for frontmatter validation
3. **Verify chain integration** (`verify-chain-integration.test.mjs`) — tests that multiple checks work together correctly

## 1. Output Conveyance Tests

Inspired by #155's craft-critique autoresearch-style evals. Tests judgment contracts (what the output must *convey*) rather than fixed templates.

### What it tests

- **Copy-paste deliverables**: craft-prompt outputs fenced code blocks ready to use
- **Paired artifacts**: craft-handoff produces both rich doc and resume prompt
- **Judgment contracts**: validates "must convey" and "carries evidence" indicators
- **Enforcement indicators**: "required", "every X carries", "no X without Y"
- **Proportionality**: output scales with artifact size (no fixed sections)
- **Evidence floor checks**: HIGH/MED findings include file:line or quoted evidence
- **Specific strengths**: name concrete elements ("Null checks at lines 15-17") not generic positives ("Good code")

### Design principles

1. **Conveyance over structure**: tests what the output communicates, not its shape
2. **Binary floor checks**: evidence presence is pass/fail (not scored)
3. **Comparative readiness**: could a reader act on this output without re-reading the artifact?
4. **Scale-aware**: small artifacts get short critiques; no fixed section budget

### Example

```javascript
test("judgment contract includes enforcement indicators", () => {
  const outputSection = `Must convey prioritized findings with severity. 
    Every HIGH finding carries evidence. 
    No generic positives without specific elements.`;

  assert.ok(isJudgmentContract(outputSection));
  assert.ok(hasEnforcementIndicators(outputSection));
});
```

## 2. Deprescription Hardening Tests

Expands description contract validation beyond the basic checks in `verify-skill-files.test.mjs`.

### What it tests

**Word count boundaries:**
- Exactly 50 words (passes)
- 51 words (fails)
- Extra whitespace handling

**Multi-line formats:**
- Pipe literal (`|`)
- Folded block (`>`)
- Quoted strings (single and double)

**Provider neutrality edge cases:**
- Varied casing (CLAUDE, OpenAI, Anthropic)
- Multiple provider mentions in one description
- Hyphen-separated words (`claude-powered`)
- Mid-compound words (`pseudoclaude` — should pass)
- Additional providers: Anthropic, Gemini, Codex

**Cross-validation:**
- Explicit-only skills can omit trigger wording
- Capability naming vs provider naming

### Example

```javascript
test("spineProviderFindings with hyphen-separated words detects provider names", () => {
  assert.deepEqual(spineProviderFindings("claude-powered tool"), ["claude"]);
  assert.deepEqual(spineProviderFindings("chatgpt-compatible API"), ["chatgpt"]);
});
```

## 3. Verify Chain Integration Tests

Tests that multiple verify checks work correctly together and that failures in one check don't mask failures in others.

### What it tests

- Clean fixture passes all checks
- Skill files check (missing description, line count limits)
- Section contract nesting (spec-* Execution Contract wrapper)
- Explicit-only pairing (both sides must be present)
- Terminology checks (forbidden terms)
- References validation (cited files must exist)
- Package boundary (files array includes `skills/`)
- Documentation paths (README links exist)
- Line count enforcement (220 soft / 500 hard)
- Empty directory handling

### Design principles

1. **Isolation**: each test runs one or two related checks, not the full verify.mjs orchestrator
2. **Focused failures**: simplified expected error patterns to avoid brittle regexes
3. **Real-world scenarios**: tests what actually fails, not theoretical edge cases

### Example

```javascript
test("section contract check detects missing required sections", () => {
  const root = createFixture();
  writeFile(root, "skills/craft-example/SKILL.md", `---
name: craft-example
description: Example craft skill.
---

# craft-example

Missing required sections`);

  const result = runCheck(root, "verify-section-contract.mjs", "checkFamilySectionContract");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing the required "Purpose" section/);
});
```

## Eval Fixture Helpers

`test-support/eval-fixtures.mjs` provides reusable fixtures and pure validation functions for conveyance-style evals.

### Fixtures

- **judgmentContractExamples**: good/bad findings, strengths, fix ordering with rationale
- **skillFrontmatterTemplates**: minimal, complete, provider-neutral, violation, word limits
- **skillSectionTemplates**: craft-*/spec-* minimal and complete bodies
- **generateSkillMd()**: assembles complete SKILL.md from frontmatter + sections

### Conveyance helpers (pure, unit-testable)

```javascript
hasEvidence(finding)          // file:line or quoted evidence present
hasLocationReference(evidence) // line numbers or file: prefix
isGenericPositive(strength)   // "Good code" vs "Null checks at line 15"
hasSpecificElements(strength) // references line/function/method/class/variable
hasFixRationale(fixOrder)     // dependency/reach/risk/reversibility keywords
isProportional(inputSize, outputSize) // scale-with-artifact check
```

All helpers are designed for #155-style autoresearch eval passes: binary floor checks (pass/fail) and comparative validation (A/B actionability).

## Test Coverage Summary

| Suite | Tests | Purpose |
|-------|-------|---------|
| verify-output-conveyance | 11 | Judgment contract validation |
| verify-description-hardening | 29 | Frontmatter edge cases |
| verify-chain-integration | 18 | Multi-check orchestration |
| verify-eval-fixtures | 20 | Pure function unit tests |
| **Total new coverage** | **78** | |

Combined with existing tests: **261 total tests, 0 failures**.

## Usage for Future Evals

When adding new autoresearch-style evals:

1. Use `judgmentContractExamples` for baseline good/bad outputs
2. Add conveyance helpers to `eval-fixtures.mjs` (keep them pure)
3. Write binary floor checks first, then comparative validation
4. Test proportionality: does output scale with input size?
5. Keep tests CI-friendly: no secrets, no host-only observation

## References

- Issue #155: craft-critique autoresearch re-run with conveyance evals
- `docs/skill-anatomy.md`: section contract source of truth
- `scripts/verify-skill-files.mjs`: base description validation
- `scripts/verify-section-contract.mjs`: section contract enforcement
