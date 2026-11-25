# Rikith Madimala — AI & Multi-Agent Systems Portfolio

> Static portfolio site deployed on GitHub Pages. Built with zero frameworks — pure HTML, CSS, and vanilla JS.

**🌐 Live:** [rikith05.github.io](https://rikith05.github.io)

---

## Highlights

| Feature | Description |
|---------|-------------|
| **Animated Agent Graph** | Interactive particle canvas simulating multi-agent node connections |
| **SwarmForge DAG Visual** | Animated SVG of the Council+Judge orchestration architecture |
| **Live Firewall Playground** | Client-side simulation of SwarmForge's 5-layer PolicyFirewall.evaluate() |
| **GitHub Telemetry Sync** | Node.js script that snapshots live repo data from the GitHub API |
| **Zero Dependencies** | No React, no build step — works directly with GitHub Pages |

## Structure

```
├── index.html              # Single-page portfolio
├── css/main.css            # Dark agentic theme
├── js/
│   ├── particles.js        # Hero canvas: animated agent node graph
│   ├── firewall.js         # 5-layer policy firewall simulation
│   └── main.js             # Nav, counters, scroll reveals, playground
├── assets/
│   ├── favicon.svg         # Agent-node favicon
│   └── og-card.svg         # Open Graph social card
├── scripts/
│   └── sync_github_profile.mjs  # GitHub API → JSON snapshot
└── .nojekyll               # Bypass Jekyll for GitHub Pages
```

## Run Locally

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node
npx serve .

# Option 3: Sync GitHub data first
node scripts/sync_github_profile.mjs
```

## License

MIT © Rikith Madimala
