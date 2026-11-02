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

const integer = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const expected = integer(stats.expected);
const unexpected = integer(stats.unexpected);
const flaky = integer(stats.flaky);
const skipped = integer(stats.skipped);
const total = expected + unexpected + flaky + skipped;
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
};

history = history.filter((entry) => entry?.id !== run.id);
history.push(run);
history.sort((left, right) => left.completedAt.localeCompare(right.completedAt));

await writeFile(historyPath, `${JSON.stringify(history, null, 2)}\n`);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Playwright test history</title>
  <style>
    :root { color-scheme: light dark; font: 16px system-ui, sans-serif; }
    body { max-width: 1100px; margin: 3rem auto; padding: 0 1rem; }
    h1 { margin-bottom: .4rem; }
    .muted { opacity: .7; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .metric { padding: 1rem; border: 1px solid #8886; border-radius: .6rem; }
    .metric strong { display: block; font-size: 1.6rem; margin-top: .35rem; }
    .table-wrap { overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: .7rem; border-bottom: 1px solid #8886; text-align: left; white-space: nowrap; }
    th { position: sticky; top: 0; background: Canvas; }
    a { color: LinkText; }
    .success { color: #17803d; }
    .failure { color: #c62828; }
  </style>
</head>
<body>
  <h1>Playwright test history</h1>
  <p class="muted">Aggregated metrics for completed CI runs that produced a Playwright report.</p>
  <section class="metrics" aria-label="Overall metrics">
    <div class="metric">Recorded runs<strong id="runs">—</strong></div>
    <div class="metric">Average pass rate<strong id="pass-rate">—</strong></div>
    <div class="metric">Average suite duration<strong id="duration">—</strong></div>
    <div class="metric">Scenarios executed<strong id="scenarios">—</strong></div>
  </section>
  <h2>Run-by-run results</h2>
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>Run</th><th>Completed</th><th>Branch</th><th>Event</th>
        <th>Result</th><th>Passed</th><th>Failed</th><th>Flaky</th>
        <th>Skipped</th><th>Pass rate</th><th>Duration</th>
      </tr></thead>
      <tbody id="history"></tbody>
    </table>
  </div>
  <p id="empty" class="muted" hidden>No test runs have been recorded.</p>
  <script>
    const formatDuration = (milliseconds) => {
      const seconds = milliseconds / 1000;
      return seconds < 60 ? seconds.toFixed(2) + 's'
        : Math.floor(seconds / 60) + 'm ' + (seconds % 60).toFixed(0) + 's';
    };
    const cell = (row, value) => {
      const element = document.createElement('td');
      element.textContent = String(value);
      row.append(element);
      return element;
    };
    fetch('./history.json').then((response) => {
      if (!response.ok) throw new Error('Could not load test history.');
      return response.json();
    }).then((runs) => {
      document.getElementById('empty').hidden = runs.length !== 0;
      document.getElementById('runs').textContent = String(runs.length);
      document.getElementById('pass-rate').textContent = runs.length
        ? (runs.reduce((sum, run) => sum + run.passRate, 0) / runs.length).toFixed(1) + '%'
        : '—';
      document.getElementById('duration').textContent = runs.length
        ? formatDuration(runs.reduce((sum, run) => sum + run.durationMs, 0) / runs.length)
        : '—';
      document.getElementById('scenarios').textContent =
        String(runs.reduce((sum, run) => sum + run.total, 0));
      const body = document.getElementById('history');
      for (const run of [...runs].reverse()) {
        const row = document.createElement('tr');
        const runCell = cell(row, '#' + run.runNumber);
        const link = document.createElement('a');
        link.textContent = 'View run';
        link.href = run.url;
        link.rel = 'noopener noreferrer';
        runCell.append(document.createTextNode(' '), link);
        cell(row, new Date(run.completedAt).toLocaleString());
        cell(row, run.branch);
        cell(row, run.event);
        const result = cell(row, run.conclusion);
        result.className = run.conclusion === 'success' ? 'success' : 'failure';
        cell(row, run.passed);
        cell(row, run.failed);
        cell(row, run.flaky);
        cell(row, run.skipped);
        cell(row, run.passRate.toFixed(1) + '%');
        cell(row, formatDuration(run.durationMs));
        body.append(row);
      }
    }).catch((error) => {
      document.getElementById('empty').hidden = false;
      document.getElementById('empty').textContent = error.message;
    });
  </script>
</body>
</html>
`;

await writeFile(path.join(historyDir, 'index.html'), html);
