import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import '../js/agent-matcher.js';

const { evaluateMatch, JD_PRESETS } = globalThis.AgentMatcher;

test('AgentMatcher matches multi-agent & firewall queries with grounded citations', () => {
  const res = evaluateMatch(JD_PRESETS.agent_engineer);
  assert.ok(res.score >= 70, `Expected strong score, got ${res.score}`);
  assert.ok(res.matches.length >= 2);
  assert.equal(res.matches[0].id, 'swarmforge');
  assert.ok(res.brief.includes('SwarmForge'));
});

test('AgentMatcher handles empty input gracefully', () => {
  const res = evaluateMatch('   ');
  assert.equal(res.score, 0);
  assert.deepEqual(res.matches, []);
});

test('Portfolio HTML links to valid local assets and has no broken internal anchors', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('css/main.css'));
  assert.ok(html.includes('js/firewall.js'));
  assert.ok(html.includes('js/agent-matcher.js'));
  assert.ok(html.includes('https://github.com/Rikith05/swarmforge'));
});
