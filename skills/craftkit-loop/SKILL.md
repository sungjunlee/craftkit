---
name: craftkit-loop
description: Run a compact iterative improvement cycle on a prompt or skill — assess baseline, apply one high-leverage change, re-evaluate, keep the winner, repeat — instead of doing one oversized rewrite. Use this whenever the user wants to iteratively improve an artifact, asks for "a few rounds" of changes, mentions comparing versions, or is stuck and needs to explore alternatives rather than commit to one big rewrite.
---

# craftkit-loop

## Purpose

Run a compact iterative improvement cycle for a prompt or skill instead of doing one oversized rewrite.

Looping matters because the best next change is rarely obvious up front. Small, labeled iterations let you see which edits actually help, and let you stop once gains flatten — which is usually sooner than a rewrite-from-scratch instinct suggests.

## Use this when

- quality needs improvement through small steps
- the best next change is not obvious
- an artifact should be refined with feedback between iterations
- a rewrite would be risky or noisy

## Inputs

- baseline artifact
- target outcome
- simple evaluation criteria
- iteration limit
- optional known failure cases

## Steps

1. Assess the baseline briefly. Name its real strengths and its one or two biggest weaknesses.
2. Choose one high-leverage change. Changing one thing at a time is what makes the loop informative.
3. Apply the change. Keep the diff small so cause and effect stay legible.
4. Re-evaluate against the criteria. Note the observed result, not just the intended one.
5. Keep the best version. If the change didn't help, revert and try a different angle.
6. Repeat until the limit is reached or gains flatten. Stopping early is a feature, not a failure.

## Output format

### Baseline assessment
A short summary of the starting point.

### Iteration log
For each iteration:
- change made
- why it was chosen
- expected improvement
- observed result

### Best version
The current best artifact after the loop.

### Next experiments
Only include the next few worthwhile ideas.

## Guardrails

- change one main thing at a time
- avoid speculative rewrites
- stop when gains are marginal
- keep the log concise and decision-oriented

## Failure modes

- bundling multiple changes into one iteration so nothing is learnable
- running past the point of diminishing returns because "one more" feels cheap
- letting the log grow into narrative instead of decision-oriented notes
- declaring victory without re-checking the original criteria

## Example

### Input
Baseline prompt:

> Write a better README.

Criteria:
- clearer scope
- explicit output sections
- reusable by coding agents

Iteration limit: 2

### Output

**Baseline assessment**
Scope is vague and output is underspecified.

**Iteration log**
1. Added explicit README sections. Expected improvement: better structure. Result: more consistent output.
2. Added coding-agent audience constraint. Expected improvement: more relevant examples. Result: improved focus.

**Best version**

> Write a README for a coding-agent-friendly repository. Include: overview, goals, structure, usage, and next steps.

**Next experiments**
- add non-goals
- add example usage block
