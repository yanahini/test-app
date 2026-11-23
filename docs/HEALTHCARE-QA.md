# Healthcare QA guide

**Audience:** QA leads, testers, and developers who apply this suite's practices to healthcare software.
**Purpose:** Explain what changes when the system under test handles patient data or supports clinical decisions, and how this repository's setup maps to those expectations.

> This project tests [Sauce Demo](https://www.saucedemo.com/), a public training shop with no patient data. It is a sandbox for practicing the techniques. In a real healthcare product, confirm every regulatory point below with your regulatory, quality, and privacy teams. This guide is orientation, not legal or regulatory advice.

## 1. What makes healthcare QA different

In most products, a missed defect costs money or reputation. In healthcare, it can harm a patient, expose protected health information, or put the organization out of compliance with regulators. That changes four things about how QA works:

| Area | Typical product | Healthcare product |
|---|---|---|
| **Risk** | Prioritize by business impact | Prioritize by **patient safety** first, then data protection, then business impact |
| **Evidence** | Reports kept a few days for debugging | Test results are **quality records**, kept for audit for years |
| **Traceability** | Nice to have | Every requirement and risk control is linked to the tests that verify it |
| **Change** | Ship when CI is green | Changes are assessed for impact, verified, reviewed, and approved before release |

## 2. Regulations and standards to know

You don't need to be a regulatory expert, but a healthcare QA lead should recognize these and know which ones apply to the product.

**Patient data and privacy**
- **HIPAA** (United States): the Privacy and Security Rules protect *protected health information* (PHI). Test environments and test data are in scope.
- **GDPR** (European Union): health data is a *special category* of personal data (Article 9) with stricter rules on processing.
- **HDS** (France): hosting personal health data requires a certified *Hébergeur de Données de Santé*. Test environments holding real data are not exempt.

**Medical device software** (applies when the software diagnoses, monitors, or guides treatment)
- **IEC 62304**: software lifecycle requirements. Each software system gets a safety class (A, B, or C), and class C (could contribute to serious injury or death) demands the most rigorous verification.
- **ISO 14971**: risk management. QA verifies that each risk control actually works.
- **ISO 13485**: quality management system for medical device makers.
- **IEC 62366-1**: usability engineering. Use errors are treated as safety risks.
- **EU MDR (2017/745)** and **FDA** regulations: market access in Europe and the US. Software can be a medical device on its own (*SaMD*).

**Computerized systems and records**
- **FDA 21 CFR Part 11**: electronic records and electronic signatures must be trustworthy, with audit trails and validated systems.
- **FDA Computer Software Assurance (CSA)** guidance and **GAMP 5**: risk-based validation. Focus the most rigorous testing on features that affect patient safety or product quality, and use lighter, unscripted testing elsewhere.
- **ALCOA+**: the data integrity principle that records are Attributable, Legible, Contemporaneous, Original, and Accurate (plus Complete, Consistent, Enduring, and Available). It applies to test evidence too.

**Accessibility**
- **WCAG 2.1 / 2.2 level AA** is the usual target. In the US, Section 508 and the HHS Section 504 rule require accessible web content from many healthcare providers. In the EU, the European Accessibility Act covers many digital services. Patients include people with visual, motor, and cognitive impairments, so accessibility is a safety and access issue, not just compliance.

**Interoperability**
- **HL7 FHIR** and **HL7 v2** are the common formats for exchanging clinical data. Interface tests should check that data survives the round trip unchanged: units, codes (SNOMED CT, LOINC, ICD-10), dates, and time zones.

## 3. Risk-based testing

Not everything needs the same depth of testing. Classify each feature, then test it to match:

| Risk level | Examples | Expected testing |
|---|---|---|
| **High**: can harm a patient | Dose calculations, allergy and drug-interaction alerts, lab result display, patient identity matching | Scripted tests traced to requirements and risks; boundary and negative cases; independent review; run on every change |
| **Medium**: can expose data or block care | Login, roles and permissions, appointment booking, data export | Automated regression on every change; security and privacy checks |
| **Low**: cosmetic or administrative | Layout, help text, non-clinical preferences | Exploratory testing and lighter automated checks |

High-risk areas usually involve the defects that cause harm:

- **Wrong patient:** two patients with the same name and date of birth; merging and splitting records.
- **Wrong value:** units (mg vs mcg, mmol/L vs mg/dL), decimal separators, rounding, and values at or just outside a limit.
- **Wrong time:** time zones, daylight-saving changes, and the order of events in a patient's history.
- **Missing alert:** an allergy or interaction warning that doesn't appear, or that users can dismiss too easily.
- **Stale data:** a screen showing cached results after newer ones arrive.

The checkout total test in this suite (`the tax should be 8% of the item total`) is the same kind of check as a dose calculation. A healthcare version would add boundary values, unit conversions, and the exact rounding rule from the requirement.

## 4. Test data and patient privacy

- **Never use real patient data in tests.** Use synthetic data, for example from [Synthea](https://synthetichealth.github.io/synthea/), or data de-identified under your privacy officer's approved method. HIPAA, for example, defines the Safe Harbor and Expert Determination methods.
- **Keep test identities obviously fake.** Use names like "Test Patient Alpha" so screenshots can't be mistaken for real records.
- **Treat failure artifacts as sensitive.** This suite saves screenshots, videos, and traces when a test fails (see `playwright.config.ts`). Against a real system, those files can contain PHI. Control who can download them, and don't upload them to public or unapproved storage.
- **Keep secrets out of the repository.** `test-data/users.ts` holds Sauce Demo's public demo password, which is acceptable only because it's public. Real credentials belong in CI secrets.
- **Test the privacy controls themselves:** role-based access (a receptionist can't see clinical notes), minimum necessary access, session timeout, audit logging of who viewed which record, and consent handling.

## 5. Traceability and evidence

Auditors will ask, "Which tests prove that requirement X works, and where is the evidence for this release?" Plan for that question from the start.

- **Tag scenarios with requirement and risk IDs.** `playwright-bdd` supports Gherkin tags, so a scenario can carry its links:

  ```gherkin
  @REQ-142 @RISK-07 @risk-high
  Scenario: The order total equals the item total plus tax
  ```

  Tags also let CI run only the high-risk scenarios (`npx playwright test --grep @risk-high`).
- **Keep a traceability matrix** from requirement to risk to test to result. It can be generated from the tags and `test-results/results.json`.
- **Record which version was tested.** Each dashboard run already stores the branch, commit, and CI run link. A validated release also needs the environment, the app version, and who approved the results.
- **Retain evidence long enough.** CI currently keeps the HTML report for 7 days and the metrics for 90 days (`.github/workflows/playwright.yml`). For a regulated release, archive the report, results, and approval in your document management system for the full retention period your quality system requires.
- **Pin dependencies.** `package-lock.json` keeps installs repeatable. Upgrading Playwright or other test tools is a change to a validated tool and should be assessed before rollout.

## 6. Reading the dashboard as a healthcare lead

The dashboard published by the `Publish test history` workflow shows the signals that matter most:

| Metric | Why it matters in healthcare |
|---|---|
| **Green runs** and **test pass rate** | A red build on a high-risk feature should block release, not wait for a later fix. |
| **Flaky rate** and **Flaky scenarios** | CI retries each failed test once, so a flaky test can pass and still hide a real timing defect, such as stale data or a race condition. Investigate every flaky high-risk scenario. Don't treat retries as a fix. |
| **Mean time to restore** | Shows how long the team ships with a known failure. In regulated work, that window should be short and documented. |
| **Feature health** | Lets you report quality by clinical area. Map each feature to its risk level so an "At risk" status on a high-risk feature gets attention first. |
| **Top failure reasons** | Repeated failure messages point to systemic issues (environment, data, timing) rather than one-off bugs. |

## 7. What this suite already does well

- Scenarios describe behavior in business language, which suits review by clinicians and product owners.
- Assertions check exact text, totals, and full lists, so failures show what differed.
- Each scenario starts from a known state and doesn't depend on test order.
- No fixed waits; steps wait for visible results.
- Failures produce screenshots, videos, and traces, and the dashboard keeps run history.

## 8. Gaps to close before using this approach on a regulated product

| Gap | Suggested action |
|---|---|
| ~~No requirement or risk tags~~ | Done: scenarios carry `@REQ-…`, `@RISK-…` and `@risk-…` tags, and CI builds the matrix (`npm run trace`). See [docs/quality](quality/README.md) |
| No accessibility checks | Add automated checks such as `@axe-core/playwright`, plus manual screen-reader and keyboard testing |
| No security or privacy scenarios | Cover role-based access, session timeout, audit logging, and data export permissions |
| Short evidence retention | Archive release evidence outside CI for the required retention period |
| Retries can hide intermittent defects | Report retried passes on high-risk scenarios as findings; consider zero retries for `@risk-high` |
| Runs against a public site | Use a controlled, versioned test environment with synthetic data |
| No formal sign-off | Add a release test summary with reviewer approval, signed electronically if Part 11 applies |

## 9. Checklist for a healthcare release

- [ ] Every high-risk requirement has at least one passing, traced test.
- [ ] No open defects on high-risk features, or each one has a documented risk acceptance.
- [ ] Flaky high-risk scenarios have been investigated.
- [ ] Test data was synthetic or de-identified, and failure artifacts were handled as sensitive.
- [ ] Accessibility checks passed for patient-facing screens.
- [ ] Access control, audit logging, and session timeout were verified.
- [ ] The tested version, environment, and results are archived with reviewer approval.
