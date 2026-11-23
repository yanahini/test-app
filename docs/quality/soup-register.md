# SOUP register (IEC 62304 §8.1.2, §5.3.3, §7.1.3; ISO 13485 §4.1.6)

SOUP means *software of unknown provenance*: third-party software you did not develop under your own lifecycle. This suite is test tooling, so under ISO 13485 §4.1.6 it is QMS software that needs validation in proportion to its risk. A test tool that wrongly reports a pass is the main risk, because it can let a defect reach users.

Versions come from `package-lock.json`. `package.json` uses `^` ranges, but `npm ci` installs the exact locked versions, so the lockfile is the configuration record. Update this table in the same pull request as any dependency change. Use the `soup-review` skill.

| SOUP item | Locked version | Purpose | Requirements we rely on | Failure that matters | How we would notice | Known anomalies reviewed |
|---|---|---|---|---|---|---|
| `@playwright/test` / `playwright` / `playwright-core` | 1.64.1 | Browser automation, assertions, reports | Assertions fail when the condition is false; JSON report records every test | A false pass, or a test missing from the report | A planted failing assertion fails (tool check below); scenario count stays stable | Not yet reviewed |
| `playwright-bdd` | 9.2.1 | Turns `.feature` files into Playwright tests | Every scenario and every Examples row becomes a test; tags are carried over | A scenario is silently skipped or loses its tags | `npm run trace` reports scenarios with no result | Not yet reviewed |
| `typescript` | 5.9.3 | Type checking for steps and selectors | Compiles step code correctly | Build fails (visible, low risk) | CI fails | Not applicable |
| `@types/node` | 26.6.6 | Type definitions | None at runtime | None at runtime | Not applicable | Not applicable |
| Node.js (CI) | 22 (setup-node) | Runtime | Runs the tools above | Runtime defect | CI fails | Not yet reviewed |
| GitHub Actions: `actions/checkout@v4`, `setup-node@v4`, `upload-artifact@v4`, `download-artifact@v4`, `github-script@v7`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4` | Major tag | CI and evidence publishing | Check out the right commit; keep artifacts intact | Evidence lost or attached to the wrong commit | The run summary shows the commit SHA | Not yet reviewed. Pin to commit SHAs for a regulated release |

## Tool check (ISO 13485 §4.1.6)

When a Playwright or playwright-bdd version changes, confirm the tool still fails when it should:

1. Temporarily change one expected value in a `@risk-high` scenario, such as the item total, and run it. It must fail.
2. Revert the change. Confirm that the scenario count in `npm run trace` matches the count before the upgrade.
3. Record both results in the pull request.
