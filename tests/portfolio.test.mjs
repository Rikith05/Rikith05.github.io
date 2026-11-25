import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import '../js/agent-matcher.js';
import '../js/firewall.js';

const { evaluateMatch, JD_PRESETS } = globalThis.AgentMatcher;
const { evaluateFirewall, resetFirewallHistory } = globalThis;

test('AgentMatcher matches multi-agent & firewall queries with grounded citations', () => {
  const res = evaluateMatch(JD_PRESETS.agent_engineer);
  assert.ok(res.score >= 70, `Expected strong score, got ${res.score}`);
  assert.ok(res.matches.length >= 2);
  assert.equal(res.matches[0].id, 'swarmforge');
  assert.ok(res.brief.includes('SwarmForge'));
});

test('AgentMatcher matches studies, CGPA, and certifications queries', () => {
  const res = evaluateMatch('Tell me about B.Tech SNIST CGPA studies and Cisco IBM certifications');
  assert.ok(res.score >= 70);
  assert.ok(res.matches.some((m) => m.id === 'education-certs'));
});

test('AgentMatcher handles empty input gracefully', () => {
  const res = evaluateMatch('   ');
  assert.equal(res.score, 0);
  assert.deepEqual(res.matches, []);
});

test('PolicyFirewall supports strict block, balanced redact, and circuit breaker reset', () => {
  resetFirewallHistory();
  const strictRes = evaluateFirewall('analyzer', 'secret_and_sink_audit', '{"token":"AKIAIOSFODNN7EXAMPLE1"}', 'strict');
  assert.equal(strictRes.verdict, 'block');

  const balancedRes = evaluateFirewall('analyzer', 'secret_and_sink_audit', '{"token":"AKIAIOSFODNN7EXAMPLE1"}', 'balanced');
  assert.equal(balancedRes.verdict, 'redact');

  const safeRes = evaluateFirewall('analyzer', 'ast_complexity_scan', '{"path":"app/main.py"}', 'strict');
  assert.equal(safeRes.verdict, 'allow');
});

test('Portfolio HTML removes #hero, includes Studies section, and links valid assets', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(html.includes('href="#hero"'), false);
  assert.equal(html.includes('id="hero"'), false);
  assert.ok(html.includes('id="education"'));
  assert.ok(html.includes('CGPA 8.12'));
  assert.ok(html.includes('css/main.css'));
  assert.ok(html.includes('js/firewall.js'));
  assert.ok(html.includes('js/agent-matcher.js'));
  assert.ok(html.includes('https://github.com/Rikith05/swarmforge'));
});
