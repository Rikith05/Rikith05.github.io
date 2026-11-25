/* ═══════════════════════════════════════════════════════════
   Policy Firewall Playground — Client-side simulation
   Mirrors SwarmForge's 5-layer PolicyFirewall.evaluate()
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── RBAC Capability Matrix ── */
  const RBAC = {
    supervisor:  ['workspace_inventory', 'schema_and_budget_verifier'],
    analyzer:    ['workspace_inventory', 'ast_complexity_scan', 'secret_and_sink_audit', 'dependency_graph_mapper', 'prompt_surface_auditor', 'schema_and_budget_verifier'],
    red_team:    ['workspace_inventory', 'ast_complexity_scan', 'secret_and_sink_audit', 'dependency_graph_mapper', 'prompt_surface_auditor', 'schema_and_budget_verifier'],
    architect:   ['workspace_inventory', 'ast_complexity_scan', 'secret_and_sink_audit', 'dependency_graph_mapper', 'prompt_surface_auditor', 'patch_synthesizer', 'schema_and_budget_verifier'],
  };

  /* ── Layer 1: Capability Scope RBAC ── */
  function checkRBAC(role, tool) {
    const allowed = RBAC[role] || [];
    if (allowed.includes(tool)) {
      return { status: 'pass', detail: `"${tool}" is in ${role}'s allowlist` };
    }
    return { status: 'block', detail: `"${tool}" is NOT in ${role}'s capability scope — BLOCKED` };
  }

  /* ── Layer 2: Secret & PII DLP Scanner ── */
  const SECRET_PATTERNS = [
    { name: 'AWS Access Key',   re: /AKIA[0-9A-Z]{16}/i },
    { name: 'GitHub PAT',       re: /ghp_[A-Za-z0-9]{36}/i },
    { name: 'Bearer Token',     re: /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/i },
    { name: 'API Key Pattern',  re: /["']?(?:api[_-]?key|secret|password|token)["']?\s*[:=]\s*["'][^"']{8,}/i },
    { name: 'Private Key',      re: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/i },
    { name: 'SSN',              re: /\b\d{3}-\d{2}-\d{4}\b/ },
  ];

  function checkSecrets(argsStr) {
    for (const p of SECRET_PATTERNS) {
      if (p.re.test(argsStr)) {
        return { status: 'block', detail: `Detected ${p.name} in tool arguments — BLOCKED` };
      }
    }
    return { status: 'pass', detail: 'No secrets, PII, or credentials detected in arguments' };
  }

  /* ── Layer 3: Prompt-Injection Guard ── */
  const INJECTION_PATTERNS = [
    { name: 'Instruction Override',     re: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|guidelines?)/i },
    { name: 'System Prompt Override',   re: /you\s+are\s+now\s+(a|an|DAN|jailbreak)/i },
    { name: 'Data Exfiltration',        re: /send\s+(all|the)\s+(data|content|secrets?|keys?)\s+to/i },
    { name: 'Hidden Override Tag',      re: /<\/?system>|<\/?assistant>|<\/?override>/i },
    { name: 'Zero-Width Obfuscation',   re: /[\u200b\u200c\u200d\ufeff]/ },
  ];

  function checkInjection(argsStr) {
    for (const p of INJECTION_PATTERNS) {
      if (p.re.test(argsStr)) {
        return { status: 'block', detail: `Prompt-injection pattern "${p.name}" detected — BLOCKED` };
      }
    }
    return { status: 'pass', detail: 'No prompt-injection or tool-poisoning patterns detected' };
  }

  /* ── Layer 4: Filesystem & Command Sandbox ── */
  const SANDBOX_PATTERNS = [
    { name: 'Path Traversal',    re: /\.\.[\/\\]/ },
    { name: 'Credential Path',   re: /\/etc\/shadow|\.ssh\/|\.aws\/credentials|\.env/i },
    { name: 'RCE Pipeline',      re: /curl\s.*\|\s*sh|rm\s+-rf\s+\/|powershell\s+-e/i },
  ];

  function checkSandbox(tool, argsStr) {
    if (tool === 'shell_exec') {
      return { status: 'block', detail: 'shell_exec is a destructive tool — BLOCKED by sandbox policy' };
    }
    for (const p of SANDBOX_PATTERNS) {
      if (p.re.test(argsStr)) {
        return { status: 'block', detail: `Sandbox violation: ${p.name} detected — BLOCKED` };
      }
    }
    return { status: 'pass', detail: 'No path traversal, credential access, or RCE patterns' };
  }

  /* ── Layer 5: Loop & Budget Circuit Breaker ── */
  const callHistory = [];
  function checkCircuitBreaker(role, tool, argsStr) {
    const key = `${role}:${tool}:${argsStr.trim()}`;
    const count = callHistory.filter(k => k === key).length;
    callHistory.push(key);
    if (callHistory.length > 50) callHistory.shift();
    if (count >= 3) {
      return { status: 'block', detail: `Identical call repeated ${count + 1} times — circuit breaker tripped` };
    }
    return { status: 'pass', detail: `Call count: ${count + 1}/3 — within budget` };
  }

  /* ── Evaluate All 5 Layers ── */
  window.evaluateFirewall = function (role, tool, argsStr) {
    const layers = [
      { name: 'Layer 1 — Capability Scope RBAC',           result: checkRBAC(role, tool) },
      { name: 'Layer 2 — Secret & PII DLP Scanner',        result: checkSecrets(argsStr) },
      { name: 'Layer 3 — Prompt-Injection Guard',           result: checkInjection(argsStr) },
      { name: 'Layer 4 — Filesystem & Command Sandbox',     result: checkSandbox(tool, argsStr) },
      { name: 'Layer 5 — Loop & Budget Circuit Breaker',    result: checkCircuitBreaker(role, tool, argsStr) },
    ];

    let verdict = 'allow';
    for (const l of layers) {
      if (l.result.status === 'block') { verdict = 'block'; break; }
      if (l.result.status === 'redact') { verdict = 'redact'; }
    }

    return { layers, verdict };
  };
})();
