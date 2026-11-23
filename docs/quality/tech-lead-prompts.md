# Tech lead prompts

Copy these into Claude Code from the repository root. Each one uses the agents in `.claude/agents/` and the skills in `.claude/skills/`. Replace the `<…>` placeholders.

## Every pull request

```text
Use the iec62304-reviewer agent to review this branch against main. Then run /change-impact
and paste the result into the PR description. If the reviewer finds any Major item, stop and
list what I need to fix.
```

## New feature (design input to verification)

```text
We're adding <feature>. First, draft the requirement(s) in docs/quality/requirements.md
format. Then have the iso14971-risk-analyst agent analyse hazards for it, using healthcare
analogues. Show me the proposed register rows and scenarios before editing anything.
After I approve, apply them, implement the steps and selectors with /risk-to-test, and
finish with /traceability.
```

## Bug found (problem resolution, IEC 62304 §9 / ISO 13485 §8.5.2)

```text
Bug: <describe>. Treat it as a problem report. 1) Find the root cause in our tests or the
app behaviour. 2) Say whether any existing risk control should have caught it, and why it
didn't. 3) Use /risk-to-test to add a scenario that fails without the fix. 4) Propose a
corrective action and a preventive action. Then check whether the same weakness exists in
other features.
```

## Flaky high-risk scenario

```text
<scenario> passed only on retry in CI run <url>. Investigate it as a potential timing or
stale-data defect, not as test noise. Reproduce it with --repeat-each=20, find the cause, and
fix the test or report the app defect. Do not add retries or longer timeouts.
```

## Dependency upgrade

```text
Upgrade <package> to <version>. Run /soup-review, including the mutation tool check, and
update soup-register.md. Hold the upgrade if a mutation passes or the scenario count changes.
```

## Quarterly audit

```text
Run the iso13485-auditor agent on the whole repository. Then turn every Major and Minor
finding into a GitHub issue draft (title, clause, evidence, proposed CAPA). Show me the
drafts and don't create them yet.
```

## Risk-based test planning

```text
Using docs/quality/risk-register.md and the traceability matrix, tell me where our test
rigor doesn't match risk: high risks with only happy-path coverage, missing boundary or
negative cases, and medium risks we may be over-testing. Give me a prioritised list of the
next 5 scenarios to write.
```

## Release

```text
/release-readiness v<version>
```

## Coaching the team

```text
Explain to a new QA engineer, with examples from this repo, how one scenario (pick
RISK-001) links ISO 14971 risk control, IEC 62304 verification and ISO 13485 records.
Keep it to one page.
```
