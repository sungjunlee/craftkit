# 6 Building Blocks Deep Dive

## 1. Role

Set the **expertise and perspective** the LLM should apply. A short role calibrates tone, depth, and domain assumptions. Research shows elaborate personas don't improve factual accuracy — keep it to one sentence that specifies domain + task.

### Effective Patterns

```
You are a senior backend engineer reviewing a pull request for a payments microservice.
```

```
Analyze this as a technical writer creating API docs for developers new to GraphQL.
```

Both forms work: "You are a..." sets a persona; stating the perspective directly ("Analyze this as...") achieves the same effect. Pick whichever reads more naturally.

### Anti-patterns

- "You are a helpful assistant" — too generic, adds nothing
- "You are the world's best programmer" — flattery doesn't improve output
- Multi-paragraph persona backstories — wastes tokens, no measurable benefit on modern models
- Stacking 5+ roles — pick one, mention others as context

### When to skip

- Factual or domain-agnostic tasks ("summarize this text", "translate to Korean")
- Coding agents (Claude Code, Codex) where the tool context already sets the role
- When the Context block already implies the expertise needed

---

## 2. Context

Provide the **background** the LLM needs. This is the highest-leverage component.

### For Session Handoff

```xml
<context>
## What was done
- Implemented user authentication with JWT (auth.ts, middleware.ts)
- Added rate limiting to /api/v2/* endpoints
- Tests passing: 47/47

## Current state
- Branch: feature/auth-v2 (3 commits ahead of main)
- Blocked on: Redis connection pooling config for rate limiter
- Open question: Should we use sliding window or fixed window?

## Key files
- src/auth/auth.ts — JWT validation logic
- src/middleware/rate-limiter.ts — Rate limiting implementation
- tests/auth.test.ts — Test suite
</context>
```

### For Chat Paste

```
## Background
I'm building a CLI tool in Go that processes CSV files. The tool currently handles
files up to 1GB but needs to support streaming for larger files. I'm using the
standard encoding/csv package.
```

### For Non-Code Tasks

```
## Background
We're a B2B SaaS company (50 employees, Series A) launching in the Japanese market
Q2 2026. Our current landing page converts at 3.2% for US visitors. We have zero
Japanese-language content. Our competitor Acme launched in Japan 6 months ago.
```

### Guidelines

- **Be specific about state** — "the tests pass" vs "47/47 tests pass, but 3 are skipped"
- **Include why, not just what** — "Redis for rate limiting because we need shared state across 4 replicas"
- **Reference files by path** — prefer worktree-relative paths like `src/auth.ts:45`, not "the auth file" or `/abs/path/to/src/auth.ts:45`
- **Quantify** — "3 API endpoints" not "a few endpoints"

---

## 3. Task

The **specific deliverable** with clear success criteria.

### Effective Patterns

```
## Task
Refactor the rate limiter to use Redis connection pooling.

## Success criteria
- Connection pool size configurable via environment variable
- Graceful degradation: if Redis is down, fall back to in-memory limiting
- No breaking changes to the existing rate limiter API
- Add integration test for pool exhaustion scenario
```

```
## Task
Write a competitive analysis of Acme's Japan launch.

## Success criteria
- Cover pricing, positioning, and distribution channels
- Include 3 specific lessons we can apply or pitfalls to avoid
- Under 800 words
```

### Anti-patterns

- "Make it better" — what does "better" mean?
- "Fix the code" — which code? what's broken?
- Task + 20 sub-tasks — if it's that complex, break into multiple prompts

### Outcome Delegation

Tell the LLM **what** success looks like, not **how** to achieve it:

```
# Bad — over-prescriptive
Step 1: Open rate-limiter.ts
Step 2: Import ioredis
Step 3: Create a connection pool with min=5, max=20
Step 4: ...

# Good — outcome-focused
Refactor rate-limiter.ts to use Redis connection pooling.
Pool should handle 50 concurrent connections with graceful degradation.
Use whatever library/approach fits best with our existing ioredis setup.
```

---

## 4. Rules / Constraints

**Constraints and boundaries** — what to do and not do.

### Effective Pattern

```
## Rules
- Do NOT modify the public API interface (RateLimiter class signature)
- Use existing ioredis dependency, don't add new Redis libraries
- All error messages must be in English
- Keep functions under 30 lines
- Log pool metrics to our existing structured logger (src/lib/logger.ts)
```

### When to use

- Non-obvious constraints (coding standards, security requirements)
- Things the LLM commonly gets wrong in this domain
- Organizational preferences that can't be inferred from code

### When to skip

- Don't list obvious rules ("write valid TypeScript") — waste of tokens
- Don't over-constrain — if you specify every detail, you're writing the code yourself

---

## 5. Output Format

Specify **how** the output should be structured.

### For Code Output

```
## Format
- TypeScript, matching existing project style (see tsconfig.json)
- Include JSDoc for public methods only
- Export types from a separate types.ts file
```

### For Analysis/Research Output

```
## Format
Answer in this structure:
1. **TL;DR** (1-2 sentences)
2. **Analysis** (3-5 paragraphs, with evidence)
3. **Recommendation** (specific, actionable next step)
4. **Risks** (bullet list of what could go wrong)
```

### For Chat Paste (token-conscious)

```
Be concise. Answer in under 500 words.
Use bullet points for lists. No markdown headers.
```

---

## 6. Examples

**Input/output pairs** that demonstrate desired behavior.

### When to Use

- The output format is unusual or specific
- The LLM consistently misunderstands your intent
- You want a particular style or tone

### Effective Pattern (1-3 examples)

~~~
## Examples

Input: "Add retry logic to the API client"
Output:
```typescript
async function fetchWithRetry(url: string, opts: RetryOptions = {}): Promise<Response> {
  const { maxRetries = 3, backoffMs = 1000 } = opts;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await sleep(backoffMs * Math.pow(2, attempt));
    }
  }
  throw new Error('unreachable');
}
```
~~~

### Anti-patterns

- 10+ examples — diminishing returns, wastes tokens
- Examples that contradict your rules
- Overly simple examples that don't cover edge cases
