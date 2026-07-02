# craft-skill-spec worked example

## Input

Design a meta-skill that helps create good new skills without re-researching the web every time.

## Output

**Summary**
Propose a skill-design spec that turns CraftKit's current radar into a stable decision layer for new skill creation.

**Artifact class**
- class: single skill
- why this class fits better than the next smaller one: there is no smaller reusable artifact than a single skill for this job
- escalation note: escalate to a plugin only if the solution later needs bundled agents, hooks, or MCP servers

**Artifact thesis**
- job: design a new skill spec from a rough idea
- non-goals: writing the full skill body, broad web research on every run
- target users or agents: CraftKit maintainers designing new skills
- success condition: output is specific enough that another agent can draft `SKILL.md` without guessing the architecture

**Radar judgment**
- Adopt: concise spine plus progressive disclosure - because the skill will accumulate design logic quickly
- Adopt: trigger-oriented descriptions - because discovery quality is central for new skills
- Adopt: eval-first tightening - because the first draft should already be testable
- Avoid: monolithic all-in-one files - because design rationale and deep examples should not bloat the spine
- Watch: script-heavy packaging - only add scripts if the design process repeats a deterministic transform

**Design spec**
- freedom level: medium
- workflow shape: read radar -> define wedge -> choose patterns -> draft trigger -> draft evals
- output shape: summary, radar judgment, file plan, trigger draft, eval plan
- progressive disclosure plan: keep the spine short; put deeper decision rubrics in `references/`
- file plan:
  - `skills/craft-skill-spec/SKILL.md` - operating workflow and output contract
  - `skills/craft-skill-spec/references/spec-checklist.md` - optional deeper review checklist

**Trigger draft**
- name: `craft-skill-spec`
- description: Design a new skill (or skill suite, subagent, or plugin) using CraftKit's current radar guidance...
- why it should discover well: it names both the task and the user phrasings around designing or specing a skill

**Eval plan**
- prompts: "design a release-note skill", "spec a jira-triage skill", "design a subagent for code review", "should this be a skill or a plugin?"
- checks: output names the artifact class explicitly; adopt/avoid/watch are present; file or package plan is concrete; trigger draft appears only when the artifact includes skills; eval plan is present
- likely failure pattern: drifting into generic skill advice or forcing a skill-shape onto a subagent/plugin request

**Open questions**
- none - current constraints are sufficient
