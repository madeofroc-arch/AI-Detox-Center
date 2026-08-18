#!/usr/bin/env node
/**
 * Compiles the method in `skill/method/` into every platform's artifact, in
 * every language.
 *
 *   method/*.yaml  ──build──▶  plugins/human-mode/skills/human-mode/SKILL.md
 *                              skill/dist/chatgpt.md
 *                              skill/dist/gemini.md
 *                              skill/dist/compact.md
 *                              skill/dist/AGENTS.md
 *   + method/i18n/<locale>.yaml ──▶ skill/dist/<locale>/…
 *
 * Nothing under dist/ or plugins/.../SKILL.md is hand-edited — edit the YAML.
 * `npm run build:skill -- --check` fails if the generated files have drifted,
 * which is what CI runs.
 *
 * TRANSLATIONS ARE OVERLAYS, NOT FORKS. The English YAML is canonical; a
 * locale file supplies the same rungs, signals, domains and examples matched
 * by id (examples by position), and the build FAILS on anything missing. A
 * half-translated prompt is more confusing than an English one, and a
 * translation that silently drifts from the pedagogy is worse than none.
 *
 * Frontmatter is deliberately limited to `name` + `description`: that is the
 * intersection of what Claude Code, the claude.ai upload validator, and
 * Codex's validator all accept, so one SKILL.md installs everywhere.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const METHOD = join(HERE, 'method');
const I18N = join(METHOD, 'i18n');
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

// ── text helpers ───────────────────────────────────────────────────────────
/**
 * English artifacts are ASCII-only on purpose. They get pasted into web
 * instruction boxes, read by tools that open files without declaring an
 * encoding (Anthropic's own skill validator does exactly this and throws on a
 * cp950 Windows locale), and diffed by contributors on every platform. The
 * YAML sources keep their typography; the outputs do not need it.
 *
 * Translated artifacts obviously cannot be ASCII. They are copy-paste files
 * for web instruction boxes, never read by those validators — the installable
 * plugin SKILL.md stays English and stays ASCII, which is what keeps the
 * one-file-installs-everywhere property intact.
 */
const ASCII = [
  [/[—–]/g, '--'],
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/→/g, '->'],
  [/…/g, '...'],
  [/·/g, '-'],
  [/ /g, ' '],
];
const asciify = (s) => ASCII.reduce((acc, [re, to]) => acc.replace(re, to), String(s));

// ── the English strings the renderers used to hardcode ─────────────────────
const EN_STRINGS = {
  promise:
    'The point is not to withhold. It is to hand back the part of the work that is\n' +
    'worth doing yourself, and to do that only when it helps. If the ladder ever costs\n' +
    'someone more than it teaches, drop it and just answer.',
  ladder_heading: 'The ladder',
  ladder_intro: 'Answer at a rung, not at full volume by default. Start at rung {default}.',
  rung_label: 'Rung {level}',
  gives_label: 'Gives',
  withholds_label: 'Withholds',
  withholds_nothing: 'nothing',
  cues_label: 'Cues',
  // Punctuation is part of a translation, not a constant. Chinese uses
  // fullwidth marks and no space before them; a rendered list joined with
  // "; " and closed with "." reads like machine output.
  list_separator: '; ',
  cue_separator: ', ',
  colon: ': ',
  full_stop: '.',
  quote_open: '"',
  quote_close: '"',
  bypass_heading: 'Go straight to the top rung when',
  moves_heading: 'Moving between rungs',
  never_heading: 'Never',
  domains_heading: 'By domain',
  examples_heading: 'Worked examples',
  example_rung: 'rung {level}',
  never_prefix: 'Never',
  always_allowed_label: 'Always fine at any rung',
  skip_label: 'Skip the ladder when',
  tone_heading: 'Tone',
  tone_body:
    'Calm, warm, brief. Never say a person should have known something, should have\n' +
    'tried harder, or is leaning on AI too much — not as a joke, not as\n' +
    'encouragement. Celebrate quietly: "that\'s it" is enough.',
  skill_title: 'Human Mode',
  skill_intro:
    'Detoxing from AI is not about using less AI. It is about not letting AI replace\nyour thinking.',
  chatgpt_title: 'Human Mode — instructions for ChatGPT',
  chatgpt_howto:
    "Paste this into a Custom GPT's *Instructions* field, or into Settings →\nPersonalization → Custom instructions.",
  gemini_title: 'Human Mode — instructions for Gemini',
  gemini_howto: "Paste this into a Gem's *Instructions* field, or into Saved Info.",
  first_person_intro: 'You answer in a way that rebuilds my own thinking instead of replacing it.',
  first_person_tone:
    'Calm, warm, brief. Never tell me I should have known something, should have\ntried harder, or am leaning on AI too much.',
  compact_title: 'Human Mode — compact',
  compact_howto: 'For instruction fields with a tight character limit.',
  compact_body:
    'Default to answering at rung {default} of this ladder, not at full volume:',
  compact_bypass:
    'Go straight to rung {top} — the complete answer, no questions asked — when I say\n' +
    '"just tell me", when something is urgent or broken, when the answer is pure\n' +
    'lookup or syntax, when the work is mechanical, or when I have already shown my\n' +
    'reasoning. Descend a rung whenever I ask for more or repeat myself.',
  compact_never:
    'Never ask a question you have no reason to think I can answer. Never withhold\n' +
    'after I have asked directly. No preamble, no praise inflation, no grading, and\n' +
    'never imply I should have known or am using AI too much.',
  generated_note: 'Generated from skill/method/ — edit the YAML there, not this file.',
  footer:
    'Part of [AI Detox Center](https://github.com/madeofroc-arch/AI-Detox-Center) · MIT',
};

// ── locale overlays ────────────────────────────────────────────────────────
const overlays = existsSync(I18N)
  ? readdirSync(I18N)
      .filter((f) => f.endsWith('.yaml'))
      .sort()
      .map((f) => read(join(I18N, f)))
  : [];

/**
 * Resolve one locale into a fully-translated view of the method, or die
 * listing exactly what is missing. Strictness is the feature: a partially
 * translated prompt reads as a bug to the person using it.
 */
function resolveLocale(overlay) {
  const locale = overlay?.locale ?? 'en';
  const gaps = [];
  const need = (value, what) => {
    if (value === undefined || value === null || String(value).trim() === '') gaps.push(what);
    return value;
  };

  const S = { ...EN_STRINGS };
  if (overlay) {
    for (const key of Object.keys(EN_STRINGS)) {
      const value = overlay.strings?.[key];
      if (value === undefined) gaps.push(`strings.${key}`);
      else S[key] = value;
    }
  }

  const rungs = ladder.rungs.map((r) => {
    if (!overlay) return r;
    const t = overlay.ladder?.rungs?.[r.level];
    if (!t) {
      gaps.push(`ladder.rungs.${r.level}`);
      return r;
    }
    for (const field of ['name', 'intent', 'gives', 'length']) {
      need(t[field], `ladder.rungs.${r.level}.${field}`);
    }
    if (t.withholds === undefined) gaps.push(`ladder.rungs.${r.level}.withholds`);
    if ((r.gives ?? []).length !== (t.gives ?? []).length) {
      gaps.push(`ladder.rungs.${r.level}.gives has ${(t.gives ?? []).length} items, base has ${(r.gives ?? []).length}`);
    }
    // An empty `withholds` is meaningful (the top rung withholds nothing), so
    // it must be present-and-empty rather than absent.
    if ((r.withholds ?? []).length !== (t.withholds ?? []).length) {
      gaps.push(`ladder.rungs.${r.level}.withholds has ${(t.withholds ?? []).length} items, base has ${(r.withholds ?? []).length}`);
    }
    return { ...r, ...t };
  });

  const group = (name) =>
    signals[name].map((s) => {
      if (!overlay) return s;
      const t = overlay.signals?.[name]?.[s.id];
      if (!t) {
        gaps.push(`signals.${name}.${s.id}`);
        return s;
      }
      if (name === 'never') return { ...s, rule: need(t, `signals.never.${s.id}`) };
      need(t.when, `signals.${name}.${s.id}.when`);
      if (s.note !== undefined) need(t.note, `signals.${name}.${s.id}.note`);
      if (s.amount !== undefined) need(t.amount, `signals.${name}.${s.id}.amount`);
      return { ...s, ...t };
    });

  const localizedDomains = domains.map((d) => {
    if (!overlay) return d;
    const t = overlay.domains?.[d.domain];
    if (!t) {
      gaps.push(`domains.${d.domain}`);
      return d;
    }
    need(t.label, `domains.${d.domain}.label`);
    need(t.applies_when, `domains.${d.domain}.applies_when`);
    for (const lvl of levels) need(t.translate?.[`rung_${lvl}`], `domains.${d.domain}.translate.rung_${lvl}`);
    for (const list of ['always_allowed', 'skip_ladder_when', 'good', 'bad']) {
      const baseLen = (d[list] ?? []).length;
      const overLen = (t[list] ?? []).length;
      if (baseLen !== overLen) gaps.push(`domains.${d.domain}.${list}: ${overLen} entries, base has ${baseLen}`);
    }
    for (const field of ['first_encounter_rule', 'rung_5_note']) {
      if (d[field] !== undefined) need(t[field], `domains.${d.domain}.${field}`);
    }
    // Examples are matched by POSITION, so the rung stays with the base entry
    // and only the human text is swapped.
    const good = (d.good ?? []).map((g, i) => ({ ...g, ...(t.good?.[i] ?? {}), rung: g.rung }));
    const bad = (d.bad ?? []).map((b, i) => ({ ...b, ...(t.bad?.[i] ?? {}) }));
    return { ...d, ...t, good, bad };
  });

  if (gaps.length) {
    console.error(
      `Translation "${locale}" is incomplete. A partly translated prompt is worse than an\n` +
        'untranslated one, so this is an error rather than a fallback:\n' +
        gaps.map((g) => '  - ' + g).join('\n'),
    );
    process.exit(1);
  }

  return { locale, S, rungs, signals: { bypass: group('bypass'), descend: group('descend'), ascend: group('ascend'), never: group('never') }, domains: localizedDomains };
}

/** The first sentence, terminator included, in either script. */
const firstSentence = (s) => String(s).match(/^[\s\S]*?[.。]/)?.[0] ?? String(s);

const fill = (template, vars) =>
  String(template).replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? `{${k}}` : vars[k]));

// ── rendering ──────────────────────────────────────────────────────────────
function render(view) {
  const { S } = view;
  // English output is ASCII-normalized; translated output keeps its script.
  const norm = view.locale === 'en' ? asciify : (s) => String(s);
  /**
   * YAML folded scalars (`>-`) join wrapped lines with a space. Between two
   * Latin words that is correct; between two Han characters it is a visible
   * defect, and the method files wrap for readability everywhere. Collapse
   * only CJK-to-CJK whitespace, so "API 或性質" and "shell 指令" keep theirs.
   */
  // Spaces and tabs only, never newlines: collapsing a newline between two Han
  // characters would run consecutive markdown lines together. The doubled dash
  // and ellipsis get their own pass -- a SINGLE em dash keeps its spaces,
  // because that is the label separator in the rung headings.
  const cjk = (s) =>
    s
      .replace(/([⺀-鿿＀-￯])[ \t]+(?=[⺀-鿿＀-￯])/g, '$1')
      .replace(/(——|……)[ \t]+(?=[⺀-鿿＀-￯])/g, '$1');
  const tidy = (s) => cjk(norm(String(s ?? '')).replace(/\s+/g, ' ').trim());
  const block = (s) => cjk(norm(String(s ?? '')));
  const SEP = S.list_separator;
  const COLON = S.colon;
  const STOP = S.full_stop;
  const CUE_SEP = S.cue_separator;
  const quoted = (s) => `${S.quote_open}${tidy(s)}${S.quote_close}`;

  const ladderSection = view.rungs
    .map((r) => {
      const label = fill(S.rung_label, { level: r.level });
      const gives = (r.gives ?? []).map(tidy).join(SEP);
      const holds = (r.withholds ?? []).length
        ? (r.withholds ?? []).map(tidy).join(SEP)
        : tidy(S.withholds_nothing);
      return `**${label} — ${tidy(r.name)}** (${tidy(r.length)})\n${tidy(r.intent)}\n${tidy(S.gives_label)}${COLON}${gives}${STOP}\n${tidy(S.withholds_label)}${COLON}${holds}${STOP}`;
    })
    .join('\n\n');

  const bypassSection = view.signals.bypass
    .map((b) => {
      const cues = b.cues?.length
        ? ` ${tidy(S.cues_label)}${COLON}${b.cues.map(quoted).join(CUE_SEP)}${STOP}`
        : '';
      return `- **${b.id.replace(/_/g, ' ')}** — ${tidy(b.when)}${cues}${b.note ? ` ${tidy(b.note)}` : ''}`;
    })
    .join('\n');

  const moveSection = [...view.signals.descend, ...view.signals.ascend]
    .map((s) => `- ${tidy(s.when)} → ${tidy(s.amount)}${s.note ? ` (${tidy(s.note)})` : ''}`)
    .join('\n');

  const neverSection = view.signals.never.map((n) => `- ${tidy(n.rule)}`).join('\n');

  const sortedLevels = [...levels].sort((a, b) => a - b);
  const domainSection = view.domains
    .map((d) => {
      const rungs = sortedLevels
        .map((l) => `  - ${fill(S.rung_label, { level: l })}${COLON}${tidy(d.translate[`rung_${l}`])}`)
        .join('\n');
      const allowed = d.always_allowed?.length
        ? `\n  ${tidy(S.always_allowed_label)}${COLON}${d.always_allowed.map(tidy).join(SEP)}${STOP}`
        : '';
      const skip = d.skip_ladder_when?.length
        ? `\n  ${tidy(S.skip_label)}${COLON}${d.skip_ladder_when.map(tidy).join(SEP)}${STOP}`
        : '';
      const extra = d.first_encounter_rule ? `\n  ${tidy(d.first_encounter_rule)}` : '';
      const note = d.rung_5_note ? `\n  ${tidy(d.rung_5_note)}` : '';
      return `### ${tidy(d.label)}\n${tidy(d.applies_when)}\n${rungs}${allowed}${skip}${extra}${note}`;
    })
    .join('\n\n');

  const examples = view.domains
    .flatMap((d) =>
      (d.good ?? []).map(
        (g) =>
          `- *${quoted(g.ask)}* → ${fill(S.example_rung, { level: g.rung })}${COLON}${tidy(g.response)}`,
      ),
    )
    .join('\n');

  const antiExamples = view.domains
    .flatMap((d) =>
      (d.bad ?? []).map((b) => `- ${tidy(S.never_prefix)}${COLON}*${quoted(b.response)}* — ${tidy(b.why)}`),
    )
    .join('\n');

  const CORE = `## ${tidy(S.ladder_heading)}

${block(fill(S.ladder_intro, { default: ladder.default_rung }))}

${ladderSection}

## ${tidy(S.bypass_heading)}

${bypassSection}

## ${tidy(S.moves_heading)}

${moveSection}

## ${tidy(S.never_heading)}

${neverSection}

## ${tidy(S.domains_heading)}

${domainSection}

## ${tidy(S.examples_heading)}

${examples}

${antiExamples}`;

  const PROMISE = block(S.promise);

  const skillMd = `---
name: human-mode
description: ${DESCRIPTION}
---

# ${tidy(S.skill_title)}

${block(S.skill_intro)}

${PROMISE}

${CORE}

## ${tidy(S.tone_heading)}

${block(S.tone_body)}

Answer in whatever language the person is writing in. The ladder is about how
much of the thinking you hand back, not which language you hand it back in.

---
${block(S.footer)}
`;

  const chatgptMd = `# ${tidy(S.chatgpt_title)}

${block(S.chatgpt_howto)}

---

${block(S.first_person_intro)}

${PROMISE}

${CORE}

## ${tidy(S.tone_heading)}

${block(S.first_person_tone)}
`;

  const geminiMd = `# ${tidy(S.gemini_title)}

${block(S.gemini_howto)}

---

${block(S.first_person_intro)}

${PROMISE}

${CORE}

## ${tidy(S.tone_heading)}

${block(S.first_person_tone)}
`;

  // Short enough for tight fields (ChatGPT's 1500-char custom-instruction boxes).
  const compactMd = `# ${tidy(S.compact_title)}

${block(S.compact_howto)}

---

${block(fill(S.compact_body, { default: ladder.default_rung }))}
${view.rungs.map((r) => `${r.level}) ${tidy(r.name)}${COLON}${firstSentence(tidy(r.intent))}`).join(' ')}

${block(fill(S.compact_bypass, { top }))}

${block(S.compact_never)}
`;

  const agentsMd = `# ${tidy(S.skill_title)}

<!-- ${tidy(S.generated_note)} -->

${PROMISE}

${CORE}
`;

  // Finish the WHOLE document, not each field: the templates themselves carry
  // an em dash, an arrow, and the spaces that join fragments together, so
  // per-field normalization leaves all three behind.
  const finish = (doc) => cjk(norm(doc));
  return {
    skillMd: finish(skillMd),
    chatgptMd: finish(chatgptMd),
    geminiMd: finish(geminiMd),
    compactMd: finish(compactMd),
    agentsMd: finish(agentsMd),
  };
}

// ── outputs ────────────────────────────────────────────────────────────────
const DESCRIPTION =
  'Answer in a way that rebuilds the user\'s own thinking instead of replacing it. ' +
  'Use when helping with code, writing, decisions, or learning and the goal is for the person to ' +
  'end up understanding, not just holding an answer. Leads with orientation and hints, descends to ' +
  'the full answer on request, and always gives it immediately when asked, when time is short, or ' +
  'when the question is pure lookup.';

const english = render(resolveLocale(null));
const outputs = [
  [SKILL_OUT, english.skillMd, true],
  [join(DIST, 'chatgpt.md'), english.chatgptMd, true],
  [join(DIST, 'gemini.md'), english.geminiMd, true],
  [join(DIST, 'compact.md'), english.compactMd, true],
  [join(DIST, 'AGENTS.md'), english.agentsMd, true],
];

for (const overlay of overlays) {
  const view = resolveLocale(overlay);
  const out = render(view);
  const dir = join(DIST, view.locale);
  // No SKILL.md per language: two installable skills with near-identical
  // descriptions would make the agent guess which to load. One skill, told to
  // answer in the person's language, plus copy-paste artifacts for the
  // platforms where a human reads the instructions before pasting them.
  outputs.push(
    [join(dir, 'chatgpt.md'), out.chatgptMd, false],
    [join(dir, 'gemini.md'), out.geminiMd, false],
    [join(dir, 'compact.md'), out.compactMd, false],
    [join(dir, 'AGENTS.md'), out.agentsMd, false],
  );
}

for (const [path, content, asciiOnly] of outputs) {
  if (!asciiOnly) continue;
  // eslint-disable-next-line no-control-regex
  const nonAscii = content.match(/[^\x09\x0a\x20-\x7e]/g);
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
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (existing === content) continue;
  if (check) {
    console.error(`out of date: ${path.replace(REPO + '\\', '').replace(REPO + '/', '')}`);
    drifted += 1;
  } else {
    writeFileSync(path, content);
    console.log(`wrote ${path.replace(REPO + '\\', '').replace(REPO + '/', '')}`);
  }
}

if (check) {
  if (drifted) {
    console.error(`\n${drifted} generated file(s) differ from skill/method/. Run: npm run build:skill`);
    process.exit(1);
  }
  console.log('generated artifacts are up to date with skill/method/');
}
