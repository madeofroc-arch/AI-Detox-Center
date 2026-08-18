#!/usr/bin/env node
/**
 * Compiles the method in `skill/method/` into every platform's artifact.
 *
 *   method/*.yaml  ──build──▶  plugins/human-mode/skills/human-mode/SKILL.md
 *                              skill/dist/chatgpt.md
 *                              skill/dist/gemini.md
 *                              skill/dist/compact.md
 *                              skill/dist/AGENTS.md
 *
 * Nothing under dist/ or plugins/.../SKILL.md is hand-edited — edit the YAML.
 * `npm run build:skill -- --check` fails if the generated files have drifted,
 * which is what CI runs.
 *
 * Frontmatter is deliberately limited to `name` + `description`: that is the
 * intersection of what Claude Code, the claude.ai upload validator, and
 * Codex's validator all accept, so one SKILL.md installs everywhere.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const METHOD = join(HERE, 'method');
const DIST = join(HERE, 'dist');
const SKILL_OUT = join(REPO, 'plugins', 'human-mode', 'skills', 'human-mode', 'SKILL.md');

const check = process.argv.includes('--check');

const read = (p) => parse(readFileSync(p, 'utf8'));
const ladder = read(join(METHOD, 'ladder.yaml'));
const signals = read(join(METHOD, 'signals.yaml'));
const domains = readdirSync(join(METHOD, 'domains'))
  .filter((f) => f.endsWith('.yaml'))
  .sort()
  .map((f) => read(join(METHOD, 'domains', f)));

// ── validation ─────────────────────────────────────────────────────────────
// A malformed method file must fail the build, not ship a broken prompt.
const problems = [];
if (!Array.isArray(ladder.rungs) || ladder.rungs.length < 2) problems.push('ladder.yaml: needs at least 2 rungs');
for (const r of ladder.rungs ?? []) {
  for (const field of ['level', 'name', 'intent', 'gives', 'withholds']) {
    if (r[field] === undefined) problems.push(`ladder.yaml: rung ${r.level ?? '?'} missing "${field}"`);
  }
}
const levels = (ladder.rungs ?? []).map((r) => r.level);
if (new Set(levels).size !== levels.length) problems.push('ladder.yaml: duplicate rung levels');
if (!levels.includes(ladder.default_rung)) problems.push(`ladder.yaml: default_rung ${ladder.default_rung} is not a rung`);
const top = Math.max(...levels);
if (!(ladder.rungs ?? []).some((r) => r.level === top && (r.withholds ?? []).length === 0)) {
  problems.push('ladder.yaml: the top rung must withhold nothing — the ladder must never lock');
}
for (const group of ['bypass', 'descend', 'ascend', 'never']) {
  if (!Array.isArray(signals[group]) || signals[group].length === 0) problems.push(`signals.yaml: "${group}" is empty`);
  for (const s of signals[group] ?? []) if (!s.id) problems.push(`signals.yaml: an entry in "${group}" has no id`);
}
for (const d of domains) {
  for (const field of ['domain', 'label', 'applies_when', 'translate']) {
    if (d[field] === undefined) problems.push(`domains/${d.domain ?? '?'}: missing "${field}"`);
  }
  for (const lvl of levels) {
    if (d.translate?.[`rung_${lvl}`] === undefined) problems.push(`domains/${d.domain}: missing translate.rung_${lvl}`);
  }
}
if (problems.length) {
  console.error('Method validation failed:\n' + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}

// ── shared prose ───────────────────────────────────────────────────────────
/**
 * Generated artifacts are ASCII-only on purpose. They get pasted into web
 * instruction boxes, read by tools that open files without declaring an
 * encoding (Anthropic's own skill validator does exactly this and throws on a
 * cp950 Windows locale), and diffed by contributors on every platform. The
 * YAML sources keep their typography; the outputs do not need it.
 */
const ASCII = [
  [/[—–]/g, '--'],
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/→/g, '->'],
  [/…/g, '...'],
  [/·/g, '-'],
  [/ /g, ' '],
];
const ascii = (s) => ASCII.reduce((acc, [re, to]) => acc.replace(re, to), String(s));
const tidy = (s) => ascii(String(s ?? '')).replace(/\s+/g, ' ').trim();
const bullets = (xs) => (xs ?? []).map((x) => `- ${tidy(x)}`).join('\n');

const ladderSection = ladder.rungs
  .map((r) => {
    const gives = (r.gives ?? []).map((g) => tidy(g)).join('; ');
    const holds = (r.withholds ?? []).length ? (r.withholds ?? []).map((g) => tidy(g)).join('; ') : 'nothing';
    return `**Rung ${r.level} — ${r.name}** (${tidy(r.length)})\n${tidy(r.intent)}\nGives: ${gives}.\nWithholds: ${holds}.`;
  })
  .join('\n\n');

const bypassSection = signals.bypass
  .map((b) => {
    const cues = b.cues?.length ? ` Cues: ${b.cues.map((c) => `"${c}"`).join(', ')}.` : '';
    return `- **${b.id.replace(/_/g, ' ')}** — ${tidy(b.when)}${cues}${b.note ? ` ${tidy(b.note)}` : ''}`;
  })
  .join('\n');

const moveSection = [...signals.descend, ...signals.ascend]
  .map((s) => `- ${tidy(s.when)} → ${tidy(s.amount)}${s.note ? ` (${tidy(s.note)})` : ''}`)
  .join('\n');

const neverSection = signals.never.map((n) => `- ${tidy(n.rule)}`).join('\n');

const domainSection = domains
  .map((d) => {
    const rungs = levels
      .sort((a, b) => a - b)
      .map((l) => `  - Rung ${l}: ${tidy(d.translate[`rung_${l}`])}`)
      .join('\n');
    const allowed = d.always_allowed?.length
      ? `\n  Always fine at any rung: ${d.always_allowed.map(tidy).join('; ')}.`
      : '';
    const skip = d.skip_ladder_when?.length
      ? `\n  Skip the ladder when: ${d.skip_ladder_when.map(tidy).join('; ')}.`
      : '';
    const extra = d.first_encounter_rule ? `\n  ${tidy(d.first_encounter_rule)}` : '';
    const note = d.rung_5_note ? `\n  ${tidy(d.rung_5_note)}` : '';
    return `### ${d.label}\n${tidy(d.applies_when)}\n${rungs}${allowed}${skip}${extra}${note}`;
  })
  .join('\n\n');

const examples = domains
  .flatMap((d) => (d.good ?? []).map((g) => `- *"${tidy(g.ask)}"* → rung ${g.rung}: ${tidy(g.response)}`))
  .join('\n');

const antiExamples = domains
  .flatMap((d) => (d.bad ?? []).map((b) => `- Never: *"${tidy(b.response)}"* — ${tidy(b.why)}`))
  .join('\n');

const CORE = `## The ladder

Answer at a rung, not at full volume by default. Start at rung ${ladder.default_rung}.

${ladderSection}

## Go straight to the top rung when

${bypassSection}

## Moving between rungs

${moveSection}

## Never

${neverSection}

## By domain

${domainSection}

## Worked examples

${examples}

${antiExamples}`;

const PROMISE = `The point is not to withhold. It is to hand back the part of the work that is
worth doing yourself, and to do that only when it helps. If the ladder ever costs
someone more than it teaches, drop it and just answer.`;

// ── outputs ────────────────────────────────────────────────────────────────
const DESCRIPTION =
  'Answer in a way that rebuilds the user\'s own thinking instead of replacing it. ' +
  'Use when helping with code, writing, decisions, or learning and the goal is for the person to ' +
  'end up understanding, not just holding an answer. Leads with orientation and hints, descends to ' +
  'the full answer on request, and always gives it immediately when asked, when time is short, or ' +
  'when the question is pure lookup.';

const skillMd = `---
name: human-mode
description: ${DESCRIPTION}
---

# Human Mode

Detoxing from AI is not about using less AI. It is about not letting AI replace
your thinking.

${PROMISE}

${CORE}

## Tone

Calm, warm, brief. Never say a person should have known something, should have
tried harder, or is leaning on AI too much — not as a joke, not as
encouragement. Celebrate quietly: "that's it" is enough.

---
Part of [AI Detox Center](https://github.com/madeofroc-arch/AI-Detox-Center) · MIT
`;

const chatgptMd = `# Human Mode — instructions for ChatGPT

Paste this into a Custom GPT's *Instructions* field, or into Settings →
Personalization → Custom instructions.

---

You answer in a way that rebuilds my own thinking instead of replacing it.

${PROMISE}

${CORE}

## Tone

Calm, warm, brief. Never tell me I should have known something, should have
tried harder, or am leaning on AI too much.
`;

const geminiMd = `# Human Mode — instructions for Gemini

Paste this into a Gem's *Instructions* field, or into Saved Info.

---

You answer in a way that rebuilds my own thinking instead of replacing it.

${PROMISE}

${CORE}

## Tone

Calm, warm, brief. Never tell me I should have known something, should have
tried harder, or am leaning on AI too much.
`;

// Short enough for tight fields (ChatGPT's 1500-char custom-instruction boxes).
const compactMd = `# Human Mode — compact

For instruction fields with a tight character limit.

---

Default to answering at rung ${ladder.default_rung} of this ladder, not at full volume:
${ladder.rungs.map((r) => `${r.level}) ${r.name}: ${tidy(r.intent).split('.')[0]}.`).join(' ')}

Go straight to rung ${top} — the complete answer, no questions asked — when I say
"just tell me", when something is urgent or broken, when the answer is pure
lookup or syntax, when the work is mechanical, or when I have already shown my
reasoning. Descend a rung whenever I ask for more or repeat myself.

Never ask a question you have no reason to think I can answer. Never withhold
after I have asked directly. No preamble, no praise inflation, no grading, and
never imply I should have known or am using AI too much.
`;

const agentsMd = `# Human Mode

<!-- Generated from skill/method/ — edit the YAML there, not this file. -->

${PROMISE}

${CORE}
`;

const outputs = [
  [SKILL_OUT, ascii(skillMd)],
  [join(DIST, 'chatgpt.md'), ascii(chatgptMd)],
  [join(DIST, 'gemini.md'), ascii(geminiMd)],
  [join(DIST, 'compact.md'), ascii(compactMd)],
  [join(DIST, 'AGENTS.md'), ascii(agentsMd)],
];

for (const [path, content] of outputs) {
  // eslint-disable-next-line no-control-regex
  const nonAscii = content.match(/[^ -]/g);
  if (nonAscii) {
    console.error(`${path} contains non-ASCII: ${[...new Set(nonAscii)].join(' ')}`);
    process.exit(1);
  }
}

// Frontmatter limits enforced by Anthropic's and Codex's validators.
if (DESCRIPTION.length > 1024) {
  console.error(`description is ${DESCRIPTION.length} chars; the limit is 1024`);
  process.exit(1);
}
if (/[<>]/.test(DESCRIPTION)) {
  console.error('description must not contain angle brackets');
  process.exit(1);
}

let drifted = 0;
for (const [path, content] of outputs) {
  mkdirSync(dirname(path), { recursive: true });
  let existing = null;
  try {
    existing = readFileSync(path, 'utf8');
  } catch {
    // not generated yet
  }
  if (existing === content) continue;
  if (check) {
    drifted += 1;
    console.error(`out of date: ${path.replace(REPO, '.')}`);
  } else {
    writeFileSync(path, content, 'utf8');
    console.log(`wrote ${path.replace(REPO, '.')}`);
  }
}

if (check && drifted) {
  console.error(`\n${drifted} generated file(s) do not match skill/method/. Run: npm run build:skill`);
  process.exit(1);
}
if (check) console.log('generated artifacts are up to date with skill/method/');
if (!check) {
  const compactLen = compactMd.split('---')[1].trim().length;
  console.log(`\nmethod: ${ladder.rungs.length} rungs, ${domains.length} domains, ` +
    `${signals.bypass.length} bypasses, ${signals.never.length} prohibitions`);
  console.log(`skill description: ${DESCRIPTION.length}/1024 chars`);
  console.log(`compact body: ${compactLen} chars`);
}
