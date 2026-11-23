import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const historyDir = process.env.HISTORY_DIR;
const metricsFile = process.env.METRICS_FILE;

if (!historyDir || !metricsFile) {
  throw new Error('HISTORY_DIR and METRICS_FILE must be set.');
}

const report = JSON.parse(await readFile(metricsFile, 'utf8'));
const stats = report.stats;
if (!stats || typeof stats !== 'object') {
  throw new Error('Playwright JSON report does not include test statistics.');
}

const integer = (value) =>
  Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
const expected = integer(stats.expected);
const unexpected = integer(stats.unexpected);
const flaky = integer(stats.flaky);
const skipped = integer(stats.skipped);
const total = expected + unexpected + flaky + skipped;
const statuses = new Set(['expected', 'unexpected', 'flaky', 'skipped']);
const firstLine = (text) =>
  (text || '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)
    ?.slice(0, 300) || '';

const scenarios = [];
const collectScenarios = (suite, titles) => {
  const names = suite.title && suite.title !== suite.file ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const failure = [...results].reverse().find((result) => result.status !== 'passed' && result.status !== 'skipped');
      scenarios.push({
        feature: String(names[0] ?? spec.file ?? '').slice(0, 200),
        title: [...names.slice(1), spec.title].join(' › ').slice(0, 300),
        status: statuses.has(test.status) ? test.status : 'unexpected',
        durationMs: integer(results.at(-1)?.duration),
        retries: Math.max(0, results.length - 1),
        error: failure ? firstLine(failure.error?.message ?? failure.errors?.[0]?.message) : '',
      });
    }
  }
  for (const child of suite.suites ?? []) {
    collectScenarios(child, names);
  }
};
for (const suite of report.suites ?? []) {
  collectScenarios(suite, []);
}

const runId = process.env.UPSTREAM_RUN_ID;
const attempt = process.env.UPSTREAM_RUN_ATTEMPT;

if (!runId || !attempt || !process.env.UPSTREAM_RUN_URL) {
  throw new Error('Required upstream workflow run metadata is missing.');
}

const historyPath = path.join(historyDir, 'history.json');
let history = [];
try {
  history = JSON.parse(await readFile(historyPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}
if (!Array.isArray(history)) {
  throw new Error('The saved test history must be a JSON array.');
}

const run = {
  id: `${runId}-${attempt}`,
  runNumber: integer(Number(process.env.UPSTREAM_RUN_NUMBER)),
  url: process.env.UPSTREAM_RUN_URL,
  branch: (process.env.UPSTREAM_BRANCH || '').slice(0, 200),
  sha: (process.env.UPSTREAM_SHA || '').slice(0, 40),
  event: (process.env.UPSTREAM_EVENT || '').slice(0, 40),
  conclusion: (process.env.UPSTREAM_CONCLUSION || '').slice(0, 40),
  completedAt: process.env.UPSTREAM_COMPLETED_AT || new Date().toISOString(),
  total,
  passed: expected + flaky,
  failed: unexpected,
  flaky,
  skipped,
  passRate: total === 0 ? 0 : Number((((expected + flaky) / total) * 100).toFixed(1)),
  durationMs: integer(stats.duration),
  scenarios,
};

history = history.filter((entry) => entry?.id !== run.id);
history.push(run);
history.sort((left, right) => left.completedAt.localeCompare(right.completedAt));

await writeFile(historyPath, `${JSON.stringify(history, null, 2)}\n`);

const dashboard = await readFile(new URL('./dashboard.html', import.meta.url), 'utf8');
await writeFile(path.join(historyDir, 'index.html'), dashboard);
