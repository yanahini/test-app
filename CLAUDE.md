# CLAUDE.md

Playwright + playwright-bdd (Gherkin) test suite for Sauce Demo. It is run as a **practice medical device software project** under ISO 13485, ISO 14971 and IEC 62304, with an assumed safety class of B. Sauce Demo is not a medical device. Never state or imply real regulatory compliance.

## Commands

- `npm test`: generate the specs (`bddgen`) and run all scenarios
- `npm run test:high-risk`: run only the `@risk-high` scenarios
- `npm run trace`: build `test-results/traceability-matrix.md`. Add `-- --strict` to exit 1 on gaps, which is what CI does
- Run a subset with `npx bddgen && npx playwright test --grep "@RISK-001"`

## Layout

`features/` (Gherkin) → `steps/` (step definitions, using the `ui` fixture) → `selectors/` (all locators) → `fixtures/test.ts` (`ui` and `signIn` fixtures). Synthetic data lives in `test-data/`. Quality records are in `docs/quality/`.

## Rules that are not optional

1. **Every scenario is tagged** `@REQ-NNN` and `@risk-high|medium|low`, plus `@RISK-NNN` when it verifies a risk control. The tags must match IDs in `docs/quality/requirements.md` and `docs/quality/risk-register.md`. Keep those tables' column layout as it is, because `scripts/build-traceability.mjs` parses them.
2. **Never weaken a risk control's verification without updating the register.** That covers deleting a `@RISK` scenario or Examples row, loosening an assertion, adding skips, or raising timeouts or retries. If a change needs it, say so explicitly and update `risk-register.md` with the justification.
3. **Behaviour change = record change.** A new or changed feature updates `requirements.md`. A new failure mode updates `risk-register.md` (use the `iso14971-risk-analyst` agent). A dependency change updates `soup-register.md` (use `/soup-review`).
4. **Test code conventions:** locators only in `selectors/`. Exact assertions (`toEqual` on full lists, exact text). No `waitForTimeout`. Scenarios stay independent. Reuse existing step phrases before you add new ones.
5. **No real personal or health data, and no real secrets,** anywhere in the repo, test data, logs or screenshots.
6. A flaky pass on a `@risk-high` scenario is a problem to investigate (IEC 62304 §9), not a pass.

## Agents and skills

| Use | When |
|---|---|
| `iec62304-reviewer` agent | Before merging any change. It reviews lifecycle, traceability and risk control integrity |
| `iso14971-risk-analyst` agent | When you add a feature, find a new failure mode, or the reviewer flags a hazard |
| `iso13485-auditor` agent | Periodic or pre-release audit of the repo as QMS records and a QMS tool |
| `/change-impact` | When you open or update a PR. It drafts the PR's change impact section |
| `/risk-to-test <RISK/REQ/hazard>` | To turn a risk into tagged, mutation-checked scenarios |
| `/traceability [ID]` | For coverage questions and gap fixing |
| `/soup-review` | For any dependency, Node or GitHub Action version change |
| `/release-readiness <version>` | For the IEC 62304 §5.8 release checklist. User-invoked only |

Ready-made tech lead prompts are in `docs/quality/tech-lead-prompts.md`. Background is in `docs/HEALTHCARE-QA.md` and the clause map in `docs/quality/README.md`.
