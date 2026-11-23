---
name: risk-to-test
description: Turns a hazard, requirement or defect into a risk register entry plus tagged Gherkin scenarios that verify its control, following ISO 14971 §7.2 and IEC 62304 §7.3 and this repo's conventions for steps, selectors and fixtures. Use when asked to "add a test for risk X", "cover REQ-…", or "write tests for this bug" in a safety-relevant area.
argument-hint: "<RISK-id | REQ-id | short hazard description>"
---

# From risk to verified scenario

Input: `$ARGUMENTS`

## 1. Locate or create the risk

- If the input is a `RISK-…` or `REQ-…` ID, read its row in `docs/quality/risk-register.md` or `docs/quality/requirements.md`.
- If it is a new hazard or a defect, delegate the analysis to the **iso14971-risk-analyst** agent, then add the rows it proposes. Use the next free ID. Keep the table columns exactly as they are, because `scripts/build-traceability.mjs` parses them.

## 2. Design the verification

For each risk control, write at least one scenario that would **fail if the control were missing**. Then add the cases that match the risk level:

| Level | Minimum cases |
|---|---|
| high | Happy path, every boundary (at the limit, and one step above and below), invalid input, and recovery after the error |
| medium | Happy path and the main negative case |
| low | Happy path |

Use healthcare failure patterns to find cases: wrong value, wrong record, stale data, missing warning, unauthorised access.

## 3. Write it the repo's way

- Feature files go in `features/<area>/<area>.feature`. Use business language, with a `Background` for shared setup.
- Tag every scenario: `@REQ-NNN @RISK-NNN @risk-<level>`, where the level is the risk's pre-control level.
- **Reuse steps first.** Grep `steps/*.ts` for existing phrases before you write a new one.
- New steps go in `steps/<area>.steps.ts`, using `createBdd(test)` from `fixtures/test.ts` and the `ui` fixture.
- New locators go in `selectors/<area>.selectors.ts`. Prefer `getByRole` or `getByText` with `exact: true`, then `data-test` attributes.
- Assertions are exact: `toEqual` on full lists, `toHaveText` on exact strings, `toHaveCount`. Use no `waitForTimeout`, and keep each scenario independent of the others.
- Test data is synthetic and goes in `test-data/`. It must never contain real personal or health data.

## 4. Prove it

1. Run `npx bddgen && npx playwright test --grep "@RISK-NNN"`. It must pass.
2. **Mutation check** for high risk: temporarily break the expected value, confirm the scenario fails, then revert. Report both outcomes.
3. Run `node scripts/build-traceability.mjs --strict`. It must report 0 gaps.

Report the files changed, the test results and the mutation result. Do not commit unless asked.
