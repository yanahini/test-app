---
name: soup-review
description: Reviews a dependency, Node or GitHub Action change as a SOUP change under IEC 62304 §8.1.2, §5.3.3, §7.1.2 and §7.1.3 and ISO 13485 §4.1.6 (validation of QMS software). Updates docs/quality/soup-register.md and runs the tool check that proves the test tool still fails when it should. Use for any npm upgrade, a Dependabot PR, a change to package.json or package-lock.json, or a bump to an action version.
argument-hint: "[package name | PR number]"
---

# SOUP change review

Target: `$ARGUMENTS`. If empty, diff `package.json`, `package-lock.json` and `.github/workflows/*.yml` against `main`.

1. **Identify.** List every SOUP item whose locked version changed: `git diff main -- package-lock.json`, filtered to top-level `node_modules/<name>` entries, plus changed `uses:` lines. Include transitive packages only when they are part of the test runtime (for example `playwright-core`).
2. **Known anomalies (§7.1.3).** For each item, read the release notes or changelog between the old and new versions. Use `npm view <pkg>@<version>` and the project's GitHub releases. Note any bug fixes or regressions that could affect assertions, reporting, retries, tag handling or test generation. Run `npm audit` (all packages here are dev dependencies, so don't pass `--omit=dev`) and record the relevant advisories. If you cannot reach the network, say so. Do not guess.
3. **Assess.** Could this change cause a false pass, a missing test or lost evidence? Rate it with the SOUP rows in `docs/quality/soup-register.md`.
4. **Tool check (ISO 13485 §4.1.6).**
   - Record the scenario count from `node scripts/build-traceability.mjs` before and after the change.
   - Run `npm test`. Everything must pass.
   - Temporarily change one expected value in a `@risk-high` scenario (for example `$39.98` → `$39.99` in `features/checkout/checkout.feature`). Run `npx bddgen && npx playwright test --grep @RISK-001` and confirm it **fails**. Revert the change, then confirm with `git diff` that the revert is clean.
5. **Record.** Update the matching row in `docs/quality/soup-register.md`: version, and "Known anomalies reviewed" with the date and summary.

## Output

A short SOUP change record: items and versions (old → new), anomalies found, risk assessment, tool check results (pass count, mutation failed as expected yes/no, scenario count before and after), and a recommendation to accept or hold.
