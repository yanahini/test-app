# Quality records (practice QMS)

> **Practice only.** Sauce Demo is a public training shop, not a medical device. These records rehearse how a medical device software team keeps evidence under ISO 13485, ISO 14971 and IEC 62304. Each shop feature is paired with the kind of healthcare hazard it resembles. Clause numbers refer to ISO 13485:2016, ISO 14971:2019 and IEC 62304:2006+A1:2015. Check them against your licensed copies before relying on them.

## Where each standard lands in this repository

| Standard and clause | What it asks for | Where it lives here |
|---|---|---|
| ISO 13485 §4.1.6 | Validate software used in the QMS, in proportion to its risk | This test suite is that kind of tool. See [soup-register.md](soup-register.md) and the `soup-review` skill |
| ISO 13485 §4.2.4 / §4.2.5 | Control documents and records | Git history (author, date, review) and CI artifacts. Release evidence must be archived outside CI |
| ISO 13485 §7.3.3 / IEC 62304 §5.2 | Design inputs and software requirements | [requirements.md](requirements.md) |
| ISO 13485 §7.3.6 / IEC 62304 §5.7 | Verification and system testing | `features/**/*.feature`, plus CI results |
| ISO 13485 §7.3.9 / IEC 62304 §8.2 | Control of design changes | `.github/pull_request_template.md` and the `change-impact` skill |
| ISO 14971 §5 to §7 | Risk analysis, evaluation and control | [risk-register.md](risk-register.md) |
| ISO 14971 §7.2 / IEC 62304 §7.3 | Verify that each risk control works | `@RISK-…` tags on scenarios, checked by `scripts/build-traceability.mjs` |
| IEC 62304 §4.3 | Software safety classification | Below |
| IEC 62304 §5.3.3, §7.1.3, §8.1.2 | Identify SOUP, its requirements and known anomalies | [soup-register.md](soup-register.md) |
| IEC 62304 §5.8 | Software release | The `release-readiness` skill |
| IEC 62304 §9 / ISO 13485 §8.3 and §8.5.2 | Problem resolution, nonconformities and corrective action | GitHub issues labelled `problem-report`. Flaky high-risk scenarios count as problems |

## Software safety classification (IEC 62304 §4.3), practice assumption

For practice, treat the shop as **class B**: a failure could lead to non-serious injury. The analogy is a patient portal where a wrong total or a wrong item stands in for a wrong dose or a wrong record.

| Class | What it means | Effect on this suite |
|---|---|---|
| A | No injury possible | Exploratory testing plus light regression |
| **B** (assumed) | Non-serious injury possible | Every requirement traced to a test. Risk controls verified. Change impact recorded |
| C | Death or serious injury possible | Same as B plus detailed design, unit verification and stricter independence |

## Tag conventions

| Tag | Meaning |
|---|---|
| `@REQ-NNN` | The scenario verifies this requirement (on the Feature line it applies to every scenario) |
| `@RISK-NNN` | The scenario verifies a control for this risk |
| `@risk-high`, `@risk-medium`, `@risk-low` | Test rigor level, taken from the highest risk the scenario covers |

Run `npm run trace` to build the matrix. Run `npm run test:high-risk` to run only the `@risk-high` scenarios.
