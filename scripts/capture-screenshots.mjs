/**
 * Documentation screenshots — drives headless Chrome over the DevTools
 * Protocol using Node's built-in WebSocket. No Playwright/Puppeteer install,
 * so `npm run screenshots` works on a clean clone.
 *
 * Usage: start the web app first, then
 *   node scripts/capture-screenshots.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDemoData } from './demo-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs/assets/screenshots');
const BASE = process.argv[2] ?? 'http://localhost:8123';
const VIEWPORT = { width: 390, height: 844, scale: 2 };

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const SHOTS = [
  { name: '01-home', path: '/(tabs)/home' },
  { name: '02-report', path: '/report' },
  { name: '03-progress', path: '/(tabs)/progress' },
  // The history list sits below the fold; scroll so it is actually shown.
  { name: '04-history', path: '/(tabs)/progress', scrollY: 1150 },
  { name: '05-gate', path: '/gate' },
  { name: '06-challenge', path: '/challenge' },
  { name: '07-settings', path: '/(tabs)/settings' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browser;
let profileDir;

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error('No Chrome/Edge found. Set one of: ' + CHROME_CANDIDATES.join(', '));
  return found;
}

class CDP {
  #ws;
  #id = 0;
  #pending = new Map();

  static async connect(url) {
    const cdp = new CDP();
    cdp.#ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      cdp.#ws.addEventListener('open', resolve, { once: true });
      cdp.#ws.addEventListener('error', reject, { once: true });
    });
    cdp.#ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      const pending = cdp.#pending.get(msg.id);
      if (!pending) return;
      cdp.#pending.delete(msg.id);
      msg.error ? pending.reject(new Error(JSON.stringify(msg.error))) : pending.resolve(msg.result);
    });
    return cdp;
  }

  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
  }

  close() {
    this.#ws.close();
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  // A throwaway profile per run: a locked profile makes Chrome silently
  // attach to an existing instance and never open the debugging port.
  profileDir = mkdtempSync(join(tmpdir(), 'human-mode-shots-'));
  const chrome = spawn(findChrome(), [
    '--headless=new',
    // Port 0 lets the OS assign a free one; 9222 is commonly already taken,
    // and Chrome then attaches to that instance instead of serving us.
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    'about:blank',
  ]);
  browser = chrome;
  chrome.on('error', (err) => {
    console.error('Failed to launch browser:', err.message);
    process.exit(1);
  });

  const port = await waitForDebugPort(profileDir);
  let targets;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      if (targets.some((t) => t.type === 'page')) break;
    } catch {
      /* browser still booting */
    }
    await sleep(250);
  }
  const page = targets?.find((t) => t.type === 'page');
  if (!page) throw new Error('Headless browser never exposed a page target');
  console.log(`browser ready · capturing ${SHOTS.length} screens from ${BASE}`);

  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    deviceScaleFactor: VIEWPORT.scale,
    mobile: true,
  });

  // LOCAL calendar day, matching apps/mobile/src/lib/clock.ts. Using the UTC
  // date here put the fixture a day behind the app in any timezone ahead of
  // UTC, which shifted every demo dateKey back one day: the shipped Home
  // screenshot showed Brain Score 68 and an unfinished challenge where the
  // fixture defines 72 and a completed one.
  const now = new Date();
  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const demo = JSON.stringify(buildDemoData(todayKey));

  for (const shot of SHOTS) {
    // Seed on the app origin, then load the route so state is already there.
    await navigate(cdp, `${BASE}/`);
    await cdp.send('Runtime.evaluate', {
      expression: `localStorage.setItem('ai-detox/app-data', ${JSON.stringify(demo)})`,
    });
    await navigate(cdp, `${BASE}${shot.path}`);
    await sleep(1200); // let fonts settle and the store hydrate

    if (shot.scrollY) {
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const scroller = document.querySelector('div[style*="overflow"]') ?? document.scrollingElement;
          const target = [...document.querySelectorAll('*')].find(
            (el) => el.scrollHeight > el.clientHeight + 40 && el.clientHeight > 300,
          ) ?? scroller;
          target.scrollTop = ${shot.scrollY};
        })()`,
      });
      await sleep(700);
    }

    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, `${shot.name}.png`), Buffer.from(data, 'base64'));
    console.log(`${shot.name}.png`);
  }

  cdp.close();
}

/** Chrome writes the chosen port to DevToolsActivePort once it is listening. */
async function waitForDebugPort(dir) {
  const portFile = join(dir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 80; attempt++) {
    if (existsSync(portFile)) {
      const port = readFileSync(portFile, 'utf8').match(/[0-9]+/)?.[0];
      if (port) return port;
    }
    await sleep(250);
  }
  throw new Error('Chrome never reported a debugging port');
}

async function navigate(cdp, url) {
  await cdp.send('Page.navigate', { url });
  await sleep(900);
}

function cleanup() {
  browser?.kill();
  if (profileDir) {
    try {
      rmSync(profileDir, { recursive: true, force: true });
    } catch {
      /* the OS will reap the temp dir */
    }
  }
}

main()
  .then(() => {
    cleanup();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.message ?? err);
    cleanup();
    process.exit(1);
  });
