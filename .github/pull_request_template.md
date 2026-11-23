## Change summary

<!-- What changed and why. Link the problem report or requirement. -->

## Change impact (IEC 62304 §7.4, §8.2; ISO 13485 §7.3.9)

<!-- Tip: run the `/change-impact` skill in Claude Code to draft this section. -->

- **Requirements affected:** <!-- REQ-… or "none" -->
- **Risks affected:** <!-- RISK-…, new hazards, or "none". Does the change weaken any risk control? -->
- **Highest rigor touched:** <!-- @risk-high / medium / low -->
- **SOUP changed:** <!-- yes/no. If yes, update docs/quality/soup-register.md and run the tool check -->

## Verification

- [ ] Every new or changed scenario has `@REQ-…` and `@risk-…` tags, plus `@RISK-…` when it verifies a risk control
- [ ] `npm test` passes locally, and `npm run trace -- --strict` reports 0 gaps
- [ ] No retried (flaky) passes on `@risk-high` scenarios
- [ ] `docs/quality/requirements.md` and `docs/quality/risk-register.md` are updated if the behaviour or risks changed
- [ ] No real personal or health data, and no real secrets, in test data, screenshots or logs

## Review

- [ ] Reviewed by someone other than the author (independence, ISO 13485 §7.3.5)
