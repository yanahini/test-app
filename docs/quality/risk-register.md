# Risk register (ISO 14971:2019 §5 to §7, IEC 62304 §7)

> Practice dataset. Each shop hazard is paired with the healthcare hazard it resembles, so the team can practise the method. Scores use the matrix below. Replace it with the one in your risk management plan (ISO 14971 §4.4).

## Scoring

- **Severity (S):** 1 negligible, 2 minor, 3 serious, 4 critical, 5 catastrophic
- **Probability (P):** 1 improbable, 2 remote, 3 occasional, 4 probable, 5 frequent
- **Risk level:** S×P ≥ 12 is **high**, 6 to 11 is **medium**, ≤ 5 is **low**. High risk is unacceptable until it is controlled. Medium risk needs controls as far as practicable.
- **Software probability:** IEC 62304 §4.3 and ISO/TR 24971 advise assuming that software failure **will** happen. Lower P only for controls outside the failing software item.

## Register

`scripts/build-traceability.mjs` reads the table below. Keep the ID in the first column and the verifying requirements in the "Requirements" column.

| ID | Hazardous situation (shop) | Healthcare analogue | Harm | S | P | Pre-control | Risk control (ISO 14971 §7.1 option) | Requirements | Residual S×P | Residual | Verification |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RISK-001 | Order total or tax is calculated wrongly and the user is charged the wrong amount | Wrong dose calculation or unit conversion | Financial loss (wrong dose) | 4 | 4 | high | Calculation is checked against the requirement on every change (protective measure) | REQ-008 | 4×2 | medium | Scenarios tagged `@RISK-001` |
| RISK-002 | Protected pages are reachable without signing in, or after signing out | PHI exposed to an unauthorised person | Privacy breach | 4 | 3 | high | Access check on every protected page, and the session ends at sign-out (protective measure) | REQ-001 | 4×1 | low | Scenarios tagged `@RISK-002` |
| RISK-003 | Cart shows stale or missing items after navigation, reload, cancel or order | Stale lab result or medication list shown | Wrong order (wrong treatment) | 3 | 3 | medium | Cart state is re-read from the session on every page (inherent safety by design) | REQ-005, REQ-009 | 3×2 | medium | Scenarios tagged `@RISK-003` |
| RISK-004 | Order is submitted without customer identity details | Record created without full patient identification | Order lost or misdelivered (wrong patient) | 3 | 3 | medium | Mandatory field validation blocks continuation (protective measure) | REQ-007 | 3×1 | low | Scenarios tagged `@RISK-004` |
| RISK-005 | Details page or catalog shows the wrong product or price | Wrong item shown in a patient record | Wrong purchase (wrong treatment) | 3 | 2 | medium | Details and catalog use the same product source, checked by tests (protective measure) | REQ-003, REQ-006 | 3×1 | low | Scenarios tagged `@RISK-005` |
| RISK-006 | A locked account can still sign in | A deactivated clinician keeps access | Unauthorised access | 4 | 2 | medium | Account status is checked at sign-in and the reason is shown (protective measure) | REQ-002 | 4×1 | low | Scenarios tagged `@RISK-006` |

## Overall residual risk (ISO 14971 §8)

Not yet evaluated. Before a practice release, the risk owner records whether the overall residual risk is acceptable and why. Use the `release-readiness` skill.
