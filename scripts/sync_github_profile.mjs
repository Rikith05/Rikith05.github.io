#!/usr/bin/env node
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT_PATH = path.join(ROOT, 'src', 'data', 'githubSnapshot.json');
const USERNAME = process.env.GITHUB_USERNAME || 'Rikith05';
const ALLOW_FALLBACK = process.argv.includes('--allow-fallback');

async function fetchJson(url) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'rikith05-portfolio-sync/1.0'
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${url}`);
  }
  return response.json();
}

function summarizeLanguages(repos) {
  const counts = {};
  for (const repo of repos) {
    if (!repo.language) continue;
    counts[repo.language] = (counts[repo.language] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));
}

async function run() {
  try {
    const [profile, rawRepos] = await Promise.all([
      fetchJson(`https://api.github.com/users/${USERNAME}`),
      fetchJson(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`)
    ]);

    const repos = rawRepos
      .filter((r) => !r.fork || r.name === 'swarmforge')
      .map((r) => ({
        name: r.name,
        fullName: r.full_name,
        url: r.html_url,
        homepage: r.homepage || '',
        description: r.description || '',
        language: r.language || 'Code',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        topics: Array.isArray(r.topics) ? r.topics : [],
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
        createdAt: r.created_at,
        sizeKb: r.size || 0
      }));

    const snapshot = {
      syncedAt: new Date().toISOString(),
      source: 'github-rest-api',
      profile: {
        login: profile.login,
        name: profile.name || 'Rikith Madimala',
        avatarUrl: profile.avatar_url,
        htmlUrl: profile.html_url,
        bio: profile.bio || '',
        location: profile.location || 'Hyderabad, India',
        publicRepos: profile.public_repos ?? repos.length,
        followers: profile.followers ?? 0,
        following: profile.following ?? 0
      },
      languages: summarizeLanguages(repos),
      repos
    };

    await mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
    await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    console.log(`Synced ${repos.length} repositories for @${USERNAME} -> src/data/githubSnapshot.json`);
  } catch (err) {
    if (ALLOW_FALLBACK) {
      try {
        await readFile(SNAPSHOT_PATH, 'utf8');
        console.warn(`Sync skipped (using cached snapshot): ${err.message}`);
        return;
      } catch {
        // Fall through if no fallback snapshot exists yet
      }
    }
    console.error(`GitHub sync failed: ${err.message}`);
    process.exitCode = 1;
  }
}

run();
