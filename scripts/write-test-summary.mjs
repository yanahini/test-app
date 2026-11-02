import { appendFile, readFile } from 'node:fs/promises';

const resultsPath = 'test-results/results.json';
const report = JSON.parse(await readFile(resultsPath, 'utf8'));
const { stats } = report;
const total = stats.expected + stats.unexpected + stats.skipped + stats.flaky;
const passed = stats.expected + stats.flaky;
const passRate = total === 0 ? 0 : (passed / total) * 100;
const seconds = (stats.duration / 1000).toFixed(2);
const duration = (milliseconds) => `${(milliseconds / 1000).toFixed(2)}s`;

const scenarios = [];
function collectScenarios(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const result = test.results?.at(-1);
      scenarios.push({
        title: [suite.title, spec.title].filter(Boolean).join(' › '),
        status: result?.status ?? test.expectedStatus,
        duration: result?.duration ?? 0,
      });
    }
  }
  for (const childSuite of suite.suites ?? []) {
    collectScenarios(childSuite);
  }
}

for (const suite of report.suites ?? []) {
  collectScenarios(suite);
}

const rows = scenarios
  .sort((left, right) => right.duration - left.duration)
  .map(({ title, status, duration: testDuration }) =>
    `| ${title.replaceAll('|', '\\|')} | ${status} | ${duration(testDuration)} |`,
  );

const summary = [
  '## Playwright test metrics',
  '',
  `- **Scenarios:** ${total}`,
  `- **Passed:** ${passed}`,
  `- **Failed:** ${stats.unexpected}`,
  `- **Flaky:** ${stats.flaky}`,
  `- **Skipped:** ${stats.skipped}`,
  `- **Pass rate:** ${passRate.toFixed(1)}%`,
  `- **Total run time:** ${seconds}s`,
  '',
  '| Scenario | Result | Duration |',
  '| --- | --- | ---: |',
  ...rows,
  '',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
} else {
  process.stdout.write(summary);
}
