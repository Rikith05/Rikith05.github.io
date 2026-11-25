/* ═══════════════════════════════════════════════════════════
   Hero Canvas — HiDPI Animated Agent Node Graph
   Respects prefers-reduced-motion & pauses when tab is hidden
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let nodes = [];
  let rafId = null;
  const mouse = { x: -1000, y: -1000 };
  const NODE_COUNT = 52;
  const EDGE_DIST = 160;
  const MOUSE_DIST = 200;
  const COLORS = ['#0E7490', '#6D28D9', '#B08D57', '#047857', '#1B2735'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = canvas.parentElement;
    W = (parent && parent.clientWidth) || canvas.clientWidth || window.innerWidth;
    H = (parent && parent.clientHeight) || canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.4 + 1.5,
        c: COLORS[i % COLORS.length],
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < EDGE_DIST) {
          const alpha = (1 - d / EDGE_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(14,116,144,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      if (d < MOUSE_DIST) {
        const alpha = (1 - d / MOUSE_DIST) * 0.32;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const t = performance.now() * 0.001;
    for (const n of nodes) {
      const pulseFactor = reducedMotion ? 1 : 0.65 + 0.35 * Math.sin(t * 1.5 + n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = n.c;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3 * pulseFactor, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3 * pulseFactor);
      grad.addColorStop(0, n.c + '33');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function update() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
  }

  function loop() {
    if (!document.hidden) {
      update();
      draw();
    }
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    const prevW = W || 1;
    const prevH = H || 1;
    resize();
    for (const n of nodes) {
      n.x = (n.x / prevW) * W;
      n.y = (n.y / prevH) * H;
    }
    if (reducedMotion) draw();
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  resize();
  createNodes();
  draw();
  if (!reducedMotion && !rafId) {
    loop();
  }
})();
