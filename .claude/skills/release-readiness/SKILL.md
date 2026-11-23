---
name: release-readiness
description: Runs an IEC 62304 §5.8 software release checklist (with ISO 14971 §8 overall residual risk and ISO 13485 §7.3.6 and §4.2.5 evidence) for the current commit, and produces a release evidence summary with a go / no-go recommendation. Use when asked "can we release?", "release checklist", or before tagging a version.
argument-hint: "[version or tag]"
disable-model-invocation: true
---

# Release readiness (practice)

Release: `$ARGUMENTS` at commit `git rev-parse HEAD`.

Work through each item, collect evidence, and mark it ✅, ⚠️ or ❌. Never mark ✅ without evidence from this session.

| # | Check | Clause | How |
|---|---|---|---|
| 1 | Working tree is clean and the commit is identified | IEC 62304 §8.1.3, §5.8.4 | `git status`, `git rev-parse HEAD` |
| 2 | All verification passed on this commit | §5.7.5, §5.8.1 | `npm test`. 0 failed and 0 flaky on `@risk-high` |
| 3 | Traceability is complete | §5.1.1, §7.3.3 | `node scripts/build-traceability.mjs --strict` exits 0 |
| 4 | Known residual anomalies are listed and evaluated | §5.8.2, §5.8.3 | Open GitHub issues labelled `problem-report` (`gh issue list -l problem-report`), plus any flaky scenarios. For each: does it contribute to an unacceptable risk? |
| 5 | Every risk control is verified and residual risk is evaluated | ISO 14971 §7.2, §7.3 | Risk table in the matrix: all passed. Residual columns filled in the register |
| 6 | Overall residual risk is evaluated | ISO 14971 §8 | The section in `docs/quality/risk-register.md` is filled in by the risk owner. If it is empty, mark ⚠️ and ask the user to complete it |
| 7 | SOUP list matches what was tested | §8.1.2 | Versions in `soup-register.md` equal the versions in `package-lock.json` |
| 8 | Evidence is archived | ISO 13485 §4.2.5, §5.8.7 | CI run URL, HTML report, `results.json` and the matrix are saved outside CI (CI retention is only 7 or 90 days) |
| 9 | Release is approved by someone independent of the author | ISO 13485 §7.3.5 | Ask the user who approves. Do not fill this in yourself |

## Output

1. **Recommendation:** Go / Go with conditions / No-go, with a one-line reason.
2. The checklist table with evidence.
3. A "Release evidence summary" block (version, commit, date, test counts, trace counts, SOUP versions, open anomalies, approver: *pending*) ready to archive.

This is a practice release of a non-medical sandbox. Say so in the summary.
