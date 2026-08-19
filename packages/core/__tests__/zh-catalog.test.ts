import { describe, expect, it } from 'vitest';
import { ADVERSARY_CATALOG, getCoreStrings, localizeRound } from '../src/index';

/**
 * Gates on the 繁體中文 round catalog.
 *
 * A bilingual content catalog rots in ways a type checker cannot see: a round
 * added in English and never translated, a Simplified character that came in
 * with a paste, an ASCII comma in the middle of Chinese prose, an argument that
 * starts addressing the reader. Each of these shipped in some product
 * somewhere; none of them is caught by anything else in this repo.
 *
 * What is NOT tested here is whether the localisation is any good — whether the
 * bluff still hides its flaw in Chinese. That is a reading job, and it was done
 * by a reader who did not write it.
 */

const zh = getCoreStrings('zh-TW');
const translated = ADVERSARY_CATALOG.filter((r) => zh.adversaryRounds[r.id] !== undefined);

/** Fields a player reads. Everything else about a round is computed with. */
function visibleText(id: string): string[] {
  const t = zh.adversaryRounds[id]!;
  return [
    t.question,
    t.unit,
    t.sourceNote,
    t.honest.argument,
    t.honest.verdict,
    t.bluff.argument,
    t.bluff.verdict,
    t.bluff.fallacy,
  ];
}

describe('the 繁體中文 catalog', () => {
  it('has something to test', () => {
    expect(translated.length).toBeGreaterThan(0);
  });

  it('covers every round in the catalog', () => {
    const missing = ADVERSARY_CATALOG.filter((r) => zh.adversaryRounds[r.id] === undefined).map(
      (r) => r.id,
    );
    expect(
      missing,
      `${missing.length} rounds have no 繁體中文 text: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('leaves no field empty', () => {
    for (const round of translated) {
      for (const text of visibleText(round.id)) {
        expect(text.trim(), `${round.id} has an empty field`).not.toBe('');
      }
    }
  });

  /**
   * 繁體中文, 台灣用語 — not Simplified. A handful of Simplified-only forms is
   * enough to catch a paste from the wrong source, which is how this gets in.
   */
  it('is written in Traditional characters', () => {
    const SIMPLIFIED = /[个们时长问产电车东马龙学国实对应会说数据网体亿万与为这么无发点开关业务经济]/;
    for (const round of translated) {
      for (const text of visibleText(round.id)) {
        const hit = text.match(SIMPLIFIED);
        expect(hit, `${round.id} contains the Simplified form "${hit?.[0]}"`).toBeNull();
      }
    }
  });

  /**
   * Fullwidth marks carry their own trailing space. A half-width space after
   * one is a translation that was typed in English rhythm.
   */
  it('does not put a space after a fullwidth mark', () => {
    for (const round of translated) {
      for (const text of visibleText(round.id)) {
        expect(/[。，、；：？！] /.test(text), `${round.id}: space after a fullwidth mark`).toBe(
          false,
        );
      }
    }
  });

  it('uses fullwidth punctuation inside Chinese prose', () => {
    for (const round of translated) {
      for (const text of visibleText(round.id)) {
        // An ASCII comma or full stop between two CJK characters is the tell.
        const hit = text.match(/[一-鿿][,.;][一-鿿]/);
        expect(hit, `${round.id}: ASCII punctuation inside Chinese prose — "${hit?.[0]}"`).toBeNull();
      }
    }
  });

  /**
   * The host states its own position; it is not correcting anyone. An argument
   * that says 「你」 has turned a claim about a number into a claim about the
   * player, which principle 7 forbids and which the English catalog was already
   * rewritten once to remove.
   */
  it('never addresses the player', () => {
    for (const round of translated) {
      const t = zh.adversaryRounds[round.id]!;
      for (const text of [
        t.honest.argument,
        t.honest.verdict,
        t.bluff.argument,
        t.bluff.verdict,
      ]) {
        expect(/[你您]/.test(text), `${round.id}: an argument addresses the player`).toBe(false);
      }
    }
  });

  it('keeps the fallacy label a phrase rather than a sentence', () => {
    for (const round of translated) {
      const label = zh.adversaryRounds[round.id]!.bluff.fallacy;
      expect(label.length, `${round.id}: fallacy label is too long`).toBeLessThan(40);
      expect(/[。！？]$/.test(label), `${round.id}: fallacy label ends as a sentence`).toBe(false);
    }
  });

  /**
   * The verdict is the beat the product turns on. One that only asserts
   * 「這是唬人的」 without naming where the reasoning broke fails the bar this
   * content exists to clear.
   */
  it('gives every bluff verdict enough room to name the break', () => {
    for (const round of translated) {
      const verdict = zh.adversaryRounds[round.id]!.bluff.verdict;
      expect(verdict.length, `${round.id}: bluff verdict is too short to explain anything`)
        .toBeGreaterThan(40);
    }
  });

  it('changes nothing a board is built from', () => {
    for (const round of translated) {
      const localized = localizeRound(round, zh);
      expect(localized.trueValue).toBe(round.trueValue);
      expect(localized.band).toBe(round.band);
      expect(localized.bluff.bluffValue).toBe(round.bluff.bluffValue);
      expect(localized.bluff.direction).toBe(round.bluff.direction);
      expect(localized.question).not.toBe(round.question);
    }
  });
});
