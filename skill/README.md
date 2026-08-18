# Human Mode — the skill

An installable skill that changes how an AI assistant answers you, so you keep
the thinking instead of outsourcing it.

The app in this repo measures AI dependency *after* it happens. This skill
intervenes *while* it happens — inside the tool where the behavior actually
occurs.

## What it does

It answers on a **hint ladder** instead of at full volume by default:

| Rung | | What you get |
| --- | --- | --- |
| 1 | Orient | The shape of the problem and where to look |
| 2 | Nudge | One question or observation that unblocks you |
| 3 | Hint | The concept you need, not applied to your case |
| 4 | Approach | The full method, step by step — you do the doing |
| 5 | Full answer | The complete thing, well, with no reluctance |

Conversations start at rung 2 and descend whenever you ask for more.

**The ladder never locks.** "Just give me the answer" works instantly, every
time, with no lecture attached. It also skips straight to rung 5 on its own when
something is urgent or broken, when the question is pure lookup or syntax, when
the work is mechanical, or when you have already shown your reasoning. A
teaching mode that cannot tell "help me understand recursion" from "prod is
down" is not a teaching mode, it is an obstacle — and an obstacle gets
uninstalled, after which it teaches nobody.

## Install

### Claude Code

```bash
claude plugin marketplace add madeofroc-arch/AI-Detox-Center
claude plugin install human-mode@ai-detox
```

Or from inside an interactive session, `/plugin marketplace add
madeofroc-arch/AI-Detox-Center` then `/plugin install human-mode@ai-detox`. If
the install summary asks you to, run `/reload-plugins`.

Third-party marketplaces do not auto-update, so pull new versions with
`claude plugin marketplace update ai-detox`.

### Codex

Codex reads the same manifests this repo already ships:

```bash
codex plugin marketplace add madeofroc-arch/AI-Detox-Center --ref main
codex plugin add human-mode@ai-detox
```

Then start a new thread — Codex picks up plugin changes at thread boundaries.

### Cursor, and any tool that reads `.agents/skills`

```bash
git clone https://github.com/madeofroc-arch/AI-Detox-Center /tmp/aidetox
mkdir -p .agents/skills
cp -r /tmp/aidetox/plugins/human-mode/skills/human-mode .agents/skills/
```

`.agents/skills/` is the neutral location shared by Codex and Cursor. Cursor
also reads `.claude/skills/`, so a Claude-shaped skill usually works with no
extra step.

### claude.ai / Claude Desktop

```bash
cd plugins/human-mode/skills
zip -r human-mode.zip human-mode/
```

Then **Customize → Skills → + → Upload a skill** and pick the zip. The zip's
single root entry must be the `human-mode` folder.

### ChatGPT

Paste [`dist/chatgpt.md`](dist/chatgpt.md) into a Custom GPT's *Instructions*
field. For the smaller Settings → Personalization box, use
[`dist/compact.md`](dist/compact.md) instead — it is written to fit.

### Gemini

Paste [`dist/gemini.md`](dist/gemini.md) into a Gem's *Instructions* field, or
[`dist/compact.md`](dist/compact.md) into Saved Info.

### Any coding agent that reads AGENTS.md

Append [`dist/AGENTS.md`](dist/AGENTS.md) to your project's `AGENTS.md`. That
one file is honored by Codex, Cursor, Gemini CLI, Copilot's coding agent,
Windsurf, Aider, Zed, and around twenty other tools.

## Other languages

繁體中文: [`dist/zh-TW/chatgpt.md`](dist/zh-TW/chatgpt.md) ·
[`dist/zh-TW/gemini.md`](dist/zh-TW/gemini.md) ·
[`dist/zh-TW/compact.md`](dist/zh-TW/compact.md) ·
[`dist/zh-TW/AGENTS.md`](dist/zh-TW/AGENTS.md)

These are for the platforms where a human reads the instructions before pasting
them — you should be able to read what you are installing.

There is deliberately **no per-language `SKILL.md`**. Two installable skills
with near-identical descriptions would make the agent guess which to load, so
there is one skill, and it is told to answer in whatever language you write in.
That is also the honest division: the ladder is about how much of the thinking
it hands back, not which language it hands it back in.

To add a language, copy [`method/i18n/zh-TW.yaml`](method/i18n/zh-TW.yaml) and
translate it. It is an **overlay, not a fork**: rungs, signals, domains and
examples are matched to the English source by id, and the build fails on
anything missing, so a translation cannot silently drift away from the
pedagogy. Punctuation is part of the translation — the list separator, colon,
full stop and quotation marks are all translatable keys, because a Chinese list
joined with "; " and closed with "." reads like machine output.

## Improving the method — this is the point

The pedagogy lives in [`method/`](method/) as YAML, not buried in prose inside a
prompt. Everything every platform sees is generated from those files, so one
edit reaches all of them:

```
method/ladder.yaml          the five rungs: what each gives and withholds
method/signals.yaml         when to skip the ladder, descend, ascend, and never
method/domains/*.yaml       calibration for coding, writing, deciding, learning
method/i18n/*.yaml          translations, matched to the above by id
```

Change the pedagogy in the English files and update every `i18n/` file in the
same PR — the build will tell you exactly which keys you left behind.

To change how it teaches:

```bash
# edit method/*.yaml
npm run build:skill         # regenerate every platform artifact
git diff                    # review what your change did to each one
```

Then open a PR. Good contributions include a rung whose wording is too vague to
act on, a bypass case we missed, a domain we do not cover, and — most valuable —
a **real transcript where it behaved badly**. Bad behavior with a reproduction
is worth more than an opinion about the wording.

The build validates structure and fails on a malformed method, and CI checks
that the generated files match the YAML, so drift cannot ship.

### One rule that is not up for negotiation

The top rung must withhold nothing, and "just tell me" must always work
immediately. The build enforces the first mechanically; the second is on
reviewers. See [principle 7](../docs/product/vision.md) — no shame-based design.

## Why the frontmatter is so plain

`SKILL.md` carries only `name` and `description`. That is deliberate: it is the
exact intersection of what Claude Code, the claude.ai upload validator, and
Codex's validator all accept. Claude Code allows many more fields, but any one
of them makes the file a hard error on the other two platforms. One file, every
install path.

The English artifacts are also ASCII-only, because they get pasted into web
instruction boxes and read by tools that open files without declaring an
encoding — Anthropic's own validator does exactly that and throws on a cp950
Windows locale. Translated artifacts obviously cannot be, which is another
reason the installable `SKILL.md` stays English: it is the one file those
validators read.
