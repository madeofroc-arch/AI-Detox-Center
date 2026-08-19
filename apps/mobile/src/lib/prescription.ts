import { Platform, Share } from 'react-native';
import type { Diagnosis, FindingId } from '@ai-detox/core';
import type { AppStrings } from '../i18n/en';

/**
 * The block the game hands to the skill.
 *
 * This is the joint between the two halves of Human Mode, and it is a piece of
 * text on purpose. Nothing is transmitted: the measurement happened on the
 * device, the block is assembled on the device, and it moves only if the person
 * copies it. A local-first product that phoned a profile home would be a
 * different product (ADR-0003).
 *
 * It is valid YAML so it can be saved as `skill/method/profile.yaml` and picked
 * up by `skill/build.mjs`, and it is plain enough to paste straight into an
 * AI's custom instructions. Those are the same file doing both jobs rather than
 * two formats to keep in step.
 */

/** A double-quoted YAML scalar, which is the only form that needs no thought. */
function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function prescriptionBlock(diagnosis: Diagnosis, t: AppStrings): string {
  const g = t.game;
  const lines = [
    `# ${g.blockHeader}`,
    `# ${g.blockFrom(diagnosis.runs, diagnosis.levelsAttempted)}`,
    '',
    'profile:',
    `  default_rung: ${diagnosis.prescription.defaultRung}  # ${g.blockRung}`,
  ];

  if (diagnosis.prescription.instructions.length === 0) {
    lines.push(`  instructions: []  # ${g.blockNothing}`);
    return lines.join('\n');
  }

  lines.push('  instructions:');
  for (const finding of diagnosis.prescription.triggered) {
    const id = finding.id as FindingId;
    const instruction = instructionFor(id, diagnosis);
    if (!instruction) continue;
    // The evidence sits above the line it earned. A prescription with no
    // reason attached is indistinguishable from a horoscope.
    lines.push(`    # ${g.evidence[id](finding.numerator, finding.denominator)}`);
    lines.push(`    - ${quote(g.instruction[instruction])}`);
  }
  return lines.join('\n');
}

/** Which instruction a finding earned, read back off the prescription. */
function instructionFor(id: FindingId, diagnosis: Diagnosis) {
  const map: Partial<Record<FindingId, (typeof diagnosis.prescription.instructions)[number]>> = {
    takes_the_bluff: 'flag_uncertainty',
    wont_update: 'hold_your_position',
    host_first: 'ask_my_estimate_first',
    unaided_misses: 'name_the_check',
  };
  const instruction = map[id];
  return instruction && diagnosis.prescription.instructions.includes(instruction)
    ? instruction
    : null;
}

/**
 * Put the block where the person can use it.
 *
 * Web writes to the clipboard; native opens the share sheet, the same route
 * `exportJsonToUser` takes. Either way it goes where they send it and nowhere
 * else. A failure returns false rather than throwing — the block is on screen
 * and selectable regardless, so a refused clipboard permission is a smaller
 * problem than a crashed screen.
 */
export async function copyPrescription(text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  try {
    await Share.share({ message: text });
    return true;
  } catch {
    return false;
  }
}
