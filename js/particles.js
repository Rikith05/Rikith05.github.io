/* ═══════════════════════════════════════════════════════════
   Hero Canvas — Animated Agent Node Graph (particles + edges)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -1000, y: -1000 };
  const NODE_COUNT  = 55;
  const EDGE_DIST   = 160;
  const MOUSE_DIST  = 200;
  const COLORS = ['#22D3EE', '#8B5CF6', '#10B981', '#F59E0B', '#38BDF8'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - .5) * .35,
        vy: (Math.random() - .5) * .35,
        r:  Math.random() * 2.5 + 1.5,
        c:  COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < EDGE_DIST) {
          const alpha = (1 - d / EDGE_DIST) * .18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }

    // Mouse glow edges
    for (const n of nodes) {
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_DIST) {
        const alpha = (1 - d / MOUSE_DIST) * .3;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Nodes
    const t = performance.now() * .001;
    for (const n of nodes) {
      const pulseFactor = .6 + .4 * Math.sin(t * 1.5 + n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = n.c;
      ctx.globalAlpha = .85;
      ctx.fill();

      // glow
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
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  resize();
  createNodes();
  loop();
})();
