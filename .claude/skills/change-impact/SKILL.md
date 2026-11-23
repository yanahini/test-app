---
name: change-impact
description: Drafts an IEC 62304 §7.4 / §8.2 and ISO 13485 §7.3.9 change impact record for the current branch or a given PR. It maps changed files to requirements, risks and SOUP, flags weakened risk controls, and outputs text ready to paste into the PR template's "Change impact" section. Use when opening or updating a PR, or when asked "what does this change affect?".
argument-hint: "[PR number | branch | base ref]"
---

# Change impact analysis

Target: `$ARGUMENTS`. If empty, compare the current branch and uncommitted changes against `main`. If it is a PR number, use `gh pr diff <n>`.

## Steps

1. **Collect the diff.** Run `git diff main...HEAD --stat`, then `git diff main...HEAD` plus `git diff` for uncommitted work.
2. **Map files to items.**
   - `features/**` → read the tags of each changed scenario (`@REQ`, `@RISK`, `@risk-*`)
   - `steps/**`, `selectors/**`, `fixtures/**` → grep `features/` for every step phrase or selector the change touches, and list the scenarios that use it, with their tags. A shared step change affects **every** scenario that uses it.
   - `test-data/**` → which scenarios read that data?
   - `package.json`, `package-lock.json`, workflow `uses:` → SOUP change. Recommend `/soup-review`.
   - `.github/workflows/**`, `playwright.config.ts` → evidence and configuration change (retries, retention, reporters, timeouts)
   - `docs/quality/**` → a controlled record changed. Check that it is consistent with the tags.
3. **Check risk control integrity.** For every `@RISK` scenario that is touched, compare the old and new assertions. Flag anything removed, skipped or loosened (see the checks in `.claude/agents/iec62304-reviewer.md`).
4. **Run the trace.** Run `node scripts/build-traceability.mjs` and include any gaps.
5. **Choose the regression scope.** If any `@risk-high` scenario is affected, recommend the full `npm test`. Otherwise recommend `npm test -- --grep "<tags>"` as the minimum, and still run the full suite in CI.

## Output (paste into the PR)

```markdown
### Change impact (IEC 62304 §7.4, §8.2; ISO 13485 §7.3.9)
- **Change type:** corrective / adaptive / perfective / SOUP / evidence-config
- **Requirements affected:** REQ-…
- **Risks affected:** RISK-… (control weakened? yes/no and why)
- **New hazards identified:** none / describe and run the iso14971-risk-analyst agent
- **SOUP changed:** yes/no
- **Highest rigor touched:** @risk-…
- **Regression scope:** …
- **Trace gaps:** 0 / list
```

Keep it factual. Say "none" rather than leaving a field blank. Do not claim tests were run unless you ran them in this session.
