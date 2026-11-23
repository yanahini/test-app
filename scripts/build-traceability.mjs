// Builds a requirement → risk → scenario → result traceability matrix.
// Supports IEC 62304 §5.1.1, §5.7 and §7.3, and ISO 13485 §7.3.6.
//
// Usage: node scripts/build-traceability.mjs [--out <file>] [--strict]
//   --out     Markdown output path (default: test-results/traceability-matrix.md)
//   --strict  Exit 1 when there are gaps (untraced requirements or risks, untagged scenarios, high-risk failures)
// Reads docs/quality/requirements.md, docs/quality/risk-register.md, features/**/*.feature
// and, when present, test-results/results.json.

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const outIndex = args.indexOf('--out');
const outFile = outIndex >= 0 ? args[outIndex + 1] : 'test-results/traceability-matrix.md';
if (!outFile) throw new Error('--out needs a file path.');

const readOptional = async (file) => {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

const tableRows = (markdown, idPattern) =>
  markdown
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
    .filter((cells) => idPattern.test(cells[0]));

const requirementsMd = await readFile('docs/quality/requirements.md', 'utf8');
const requirements = tableRows(requirementsMd, /^REQ-\d+$/).map(([id, text]) => ({ id, text }));

const risksMd = await readFile('docs/quality/risk-register.md', 'utf8');
const riskHeader = risksMd.split('\n').find((line) => /^\|\s*ID\s*\|/.test(line));
const riskColumns = riskHeader?.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()) ?? [];
const reqColumn = riskColumns.indexOf('Requirements');
const preColumn = riskColumns.indexOf('Pre-control');
const risks = tableRows(risksMd, /^RISK-\d+$/).map((cells) => ({
  id: cells[0],
  text: cells[1],
  level: cells[preColumn] ?? '',
  requirements: (cells[reqColumn] ?? '').match(/REQ-\d+/g) ?? [],
}));

const findFeatures = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return findFeatures(full);
      return entry.name.endsWith('.feature') ? [full] : [];
    }),
  );
  return files.flat().sort();
};

const scenarios = [];
for (const file of await findFeatures('features')) {
  const lines = (await readFile(file, 'utf8')).split('\n');
  let pending = [];
  let featureTags = [];
  let feature = '';
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith('@')) {
      pending.push(...line.split(/\s+/).filter((tag) => tag.startsWith('@')));
      return;
    }
    const featureMatch = line.match(/^Feature:\s*(.+)$/);
    if (featureMatch) {
      feature = featureMatch[1];
      featureTags = pending;
      pending = [];
      return;
    }
    const scenarioMatch = line.match(/^Scenario(?: Outline)?:\s*(.+)$/);
    if (scenarioMatch) {
      const tags = [...new Set([...featureTags, ...pending])];
      scenarios.push({
        file: file.split(path.sep).join('/'),
        line: index + 1,
        feature,
        title: scenarioMatch[1],
        reqs: tags.filter((tag) => /^@REQ-\d+$/.test(tag)).map((tag) => tag.slice(1)),
        risks: tags.filter((tag) => /^@RISK-\d+$/.test(tag)).map((tag) => tag.slice(1)),
        level: tags.find((tag) => /^@risk-(high|medium|low)$/.test(tag))?.slice(6) ?? '',
        results: [],
      });
      pending = [];
      return;
    }
    if (line && !line.startsWith('#')) pending = [];
  });
}

// Attach results by matching the feature and scenario titles in the Playwright suite path.
const resultsJson = await readOptional('test-results/results.json');
if (resultsJson) {
  const report = JSON.parse(resultsJson);
  const walk = (suite, titles) => {
    const names = suite.title && suite.title !== suite.file ? [...titles, suite.title] : titles;
    for (const spec of suite.specs ?? []) {
      const titlePath = [...names, spec.title];
      for (const test of spec.tests ?? []) {
        const match = scenarios.find((s) => titlePath.includes(s.feature) && titlePath.includes(s.title));
        match?.results.push(test.status);
      }
    }
    for (const child of suite.suites ?? []) walk(child, names);
  };
  for (const suite of report.suites ?? []) walk(suite, []);
}

const summarise = (results) => {
  if (!resultsJson) return 'not run';
  if (results.length === 0) return 'no result';
  if (results.includes('unexpected')) return 'FAILED';
  if (results.includes('flaky')) return 'flaky';
  if (results.every((status) => status === 'skipped')) return 'skipped';
  return 'passed';
};
for (const scenario of scenarios) scenario.result = summarise(scenario.results);

const knownReqs = new Set(requirements.map((r) => r.id));
const knownRisks = new Set(risks.map((r) => r.id));
const gaps = [];
for (const req of requirements) {
  if (!scenarios.some((s) => s.reqs.includes(req.id))) gaps.push(`${req.id} has no verifying scenario.`);
}
for (const risk of risks) {
  if (!scenarios.some((s) => s.risks.includes(risk.id))) gaps.push(`${risk.id} has no scenario verifying its control (ISO 14971 §7.2).`);
  for (const req of risk.requirements) {
    if (!knownReqs.has(req)) gaps.push(`${risk.id} refers to unknown requirement ${req}.`);
  }
}
for (const s of scenarios) {
  const where = `${s.file}:${s.line} "${s.title}"`;
  if (s.reqs.length === 0) gaps.push(`${where} has no @REQ tag.`);
  if (!s.level) gaps.push(`${where} has no @risk-high/medium/low tag.`);
  for (const id of s.reqs) if (!knownReqs.has(id)) gaps.push(`${where} refers to unknown ${id}.`);
  for (const id of s.risks) if (!knownRisks.has(id)) gaps.push(`${where} refers to unknown ${id}.`);
  for (const id of s.risks) {
    const risk = risks.find((r) => r.id === id);
    if (risk?.level === 'high' && s.level !== 'high') gaps.push(`${where} verifies high risk ${id} but is tagged @risk-${s.level || 'none'}.`);
  }
  if (s.level === 'high' && ['FAILED', 'flaky', 'no result', 'skipped'].includes(s.result)) {
    gaps.push(`${where} is high risk and its result is ${s.result}.`);
  }
}

const esc = (text) => String(text).replace(/\|/g, '\\|');
const link = (s) => `[${esc(s.title)}](../${s.file}#L${s.line})`;
const out = [];
out.push('# Traceability matrix', '');
out.push(`Generated ${new Date().toISOString()} from commit ${process.env.GITHUB_SHA ?? 'local'}. Results: ${resultsJson ? 'test-results/results.json' : 'not available (tests not run)'}.`, '');
out.push(`**${requirements.length}** requirements · **${risks.length}** risks · **${scenarios.length}** scenarios · **${gaps.length}** gaps`, '');
out.push('## Requirements to scenarios', '', '| Requirement | Risks | Scenario | Rigor | Result |', '|---|---|---|---|---|');
for (const req of requirements) {
  const covering = scenarios.filter((s) => s.reqs.includes(req.id));
  if (covering.length === 0) out.push(`| **${req.id}** ${esc(req.text)} | | **No scenario** | | |`);
  covering.forEach((s, i) => {
    out.push(`| ${i === 0 ? `**${req.id}** ${esc(req.text)}` : '〃'} | ${s.risks.join(', ')} | ${link(s)} | ${s.level} | ${s.result} |`);
  });
}
out.push('', '## Risk controls to verification (ISO 14971 §7.2, IEC 62304 §7.3)', '', '| Risk | Pre-control | Verifying scenarios | Passed |', '|---|---|---|---|');
for (const risk of risks) {
  const covering = scenarios.filter((s) => s.risks.includes(risk.id));
  const passed = covering.filter((s) => s.result === 'passed').length;
  out.push(`| **${risk.id}** ${esc(risk.text)} | ${risk.level} | ${covering.length} | ${resultsJson ? `${passed}/${covering.length}` : 'not run'} |`);
}
out.push('', '## Gaps', '');
out.push(...(gaps.length ? gaps.map((gap) => `- ${gap}`) : ['None.']));
out.push('');

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, out.join('\n'));
console.log(`Traceability: ${requirements.length} requirements, ${risks.length} risks, ${scenarios.length} scenarios, ${gaps.length} gaps → ${outFile}`);
for (const gap of gaps) console.log(`  gap: ${gap}`);
if (strict && gaps.length) process.exit(1);
