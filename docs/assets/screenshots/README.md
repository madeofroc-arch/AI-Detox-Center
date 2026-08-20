# Screenshots

Generated, not hand-curated — so they never drift from the real app.

```bash
npm run web --workspace @ai-detox/mobile -- --port 8123   # terminal 1
npm run screenshots                                        # terminal 2

# one language at a time; anything but `en` gets a suffixed filename
node scripts/capture-screenshots.mjs http://localhost:8123 zh-TW
```

`scripts/capture-screenshots.mjs` drives headless Chrome over the DevTools
Protocol using Node's built-in WebSocket (no Playwright/Puppeteer install),
seeds `scripts/demo-data.mjs` into local storage, and captures each route at
390x844 @2x.

Two of the six screens only exist mid-run, so a shot may carry a `press` list
of control labels to activate first. `@tier:1` and `@option:0` index a
repeated control — every tier card has the same button label, and every option
row shows a figure that changes with the seed.

**The run seed contains the date**, so which question appears changes daily.
That is the seed doing its job and is not worth defeating here: these are
images of a real run rather than of a fixture.

The fixture is written at **schema version 3** on purpose, so every capture
run also exercises `migrateAppData` rather than only ever testing a
freshly-written document. That is not theoretical: it is how the 1 -> 2
migration was caught discarding the stored language — the zh-TW screenshots
came out byte-identical to the English ones.

It also carries a usage event from the retired dependency tracker, so every
run exercises the 3 -> 4 archive: after migration that event is under
`retired`, not on the live document.

**The data is fictional.** `demo-data.mjs` describes an invented player: they
answer alone and get it right more often than not, they rarely buy help they
do not need — and when the host argues badly, they move to the host's answer
about half the time. It exists only for documentation and never ships in the
app. No real user data is ever collected, exported, or shown here (see
[privacy architecture](../../architecture/privacy.md)).
