---
name: traceability
description: Builds and explains the requirement → risk → scenario → result traceability matrix (IEC 62304 §5.1.1, §5.7, §7.3; ISO 13485 §7.3.6; ISO 14971 §7.2) and proposes fixes for each gap. Use when asked about coverage, traceability, "which tests prove REQ-…", or before a release.
argument-hint: "[--run] [REQ-id | RISK-id]"
---

# Traceability matrix

Arguments: `$ARGUMENTS`

1. If `--run` is given, or `test-results/results.json` is missing or older than the latest change to `features/`, run `npm test` first. Say so if you skip it, because the matrix will then show "not run".
2. Run `node scripts/build-traceability.mjs` and read `test-results/traceability-matrix.md`.
3. If an ID is given, answer only for that item: its text, linked risks or requirements, verifying scenarios (as `file:line`), the latest results, and any gaps.
4. Otherwise summarise in this order:
   - the counts (requirements, risks, scenarios, gaps)
   - **high-risk problems first**: failed, flaky, no result, or under-tagged
   - requirements or risks with no verifying scenario
   - scenarios with missing or unknown tags
5. For each gap, propose the smallest fix: a tag to add (with file:line), a scenario to write (point to `/risk-to-test`), or a register row to correct. Apply tag-only fixes only if the user asks.

Notes:
- A `flaky` result means the scenario passed only on a retry. For `@risk-high`, treat it as a problem report (IEC 62304 §9), not a pass.
- Results are matched by feature and scenario title. Renaming a scenario without re-running the tests shows "no result".
