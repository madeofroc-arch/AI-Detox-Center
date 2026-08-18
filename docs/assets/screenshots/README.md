# Screenshots

Generated, not hand-curated — so they never drift from the real app.

```bash
npm run web --workspace @ai-detox/mobile -- --port 8123   # terminal 1
npm run screenshots                                        # terminal 2
```

`scripts/capture-screenshots.mjs` drives headless Chrome over the DevTools
Protocol using Node's built-in WebSocket (no Playwright/Puppeteer install),
seeds `scripts/demo-data.mjs` into local storage, and captures each route at
390x844 @2x.

**The data is fictional.** `demo-data.mjs` describes an invented mid-journey
user — someone practising most days who still reaches for AI first more often
than not. It exists only for documentation and never ships in the app. No real
user data is ever collected, exported, or shown here (see
[privacy architecture](../../architecture/privacy.md)).
