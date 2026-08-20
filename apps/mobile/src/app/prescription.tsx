import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { diagnose } from '@ai-detox/core';
import type { FindingId } from '@ai-detox/core';
import { GameButton } from '../components/game/GameButton';
import { RungTower } from '../components/game/RungTower';
import { useI18n } from '../i18n/useI18n';
import { confirmAsync } from '../lib/confirm';
import { exportJsonToUser } from '../lib/exportData';
import { copyPrescription, prescriptionBlock } from '../lib/prescription';
import { useAppStore } from '../state/store';
import { decorative, group } from '../theme/a11y';
import { gamePalette, gameRadius, gameSpace, gameType } from '../theme/game';

/**
 * What the game says about the AI you already use.
 *
 * The last screen of Human Mode is not a report. It is a configuration for the
 * hint ladder in `skill/method/`, and every line on it was earned by something
 * that happened in a run — shown with the plays that earned it, never as a
 * judgement (principle 7).
 *
 * The screen has to be able to say three different things, and the third is the
 * one products usually cannot say:
 *
 *   - not enough measured yet, here is how much is missing
 *   - here is what was measured and what it prescribes
 *   - enough was measured and nothing needs changing
 *
 * `signals.yaml` forbids inventing difficulty to make something feel
 * educational. Without the third case every player gets told something is
 * wrong with them, which is the failure mode the previous product shipped.
 *
 * ## The ladder is drawn as the show's tower
 *
 * The rung used to be a number and a name on one line, which is accurate and
 * says nothing. It is a five-rung ladder with one rung lit and one rung that
 * can always be reached — which is a money tower with a safe point, and the
 * player has already read one of those on the mode screen. `RungTower` carries
 * the rest of the reasoning, including why rung 1 is at the top.
 *
 * ## Export and erase live here now
 *
 * They were on the settings tab, and the settings tab was part of the tracker
 * that this product replaced. They are the two things a local-first app owes
 * the person whose device it is (ADR-0003), so they moved onto the record
 * rather than being deleted with the screens around them.
 */

const RUNG_KEYS = [1, 2, 3, 4, 5] as const;

export default function Prescription() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const runs = useAppStore((s) => s.data.adversaryRuns);
  const deleteAllData = useAppStore((s) => s.deleteAllData);
  const exportJson = useAppStore((s) => s.exportJson);
  const [copied, setCopied] = useState(false);

  const diagnosis = useMemo(() => diagnose(runs), [runs]);
  const block = useMemo(() => prescriptionBlock(diagnosis, t), [diagnosis, t]);

  const rung = diagnosis.prescription.defaultRung;
  const rungName = RUNG_KEYS.includes(rung as (typeof RUNG_KEYS)[number])
    ? t.game.rungName[rung as (typeof RUNG_KEYS)[number]]
    : '';

  const tower = RUNG_KEYS.map((level) => ({
    level,
    name: t.game.rungName[level],
    gives: t.game.rungGives[level],
  }));

  // Two findings can move the rung and they pull opposite ways, so a shift of
  // zero is ambiguous: it means either nothing fired or both did. Saying
  // "nothing moved it" in the second case would hide a real result.
  const fired = (id: FindingId) => diagnosis.prescription.triggered.some((f) => f.id === id);
  const rungExplanation =
    diagnosis.prescription.rungShift < 0
      ? t.game.rungWhyLess
      : diagnosis.prescription.rungShift > 0
        ? t.game.rungWhyMore
        : fired('unnecessary_reliance') && fired('unaided_misses')
          ? t.game.rungWhyBoth
          : t.game.rungDefault;

  const backToGame = () => {
    // `back` keeps whatever the game screen was showing; `replace` is the
    // fallback for a deep link, where there is no screen behind this one.
    if (router.canGoBack()) router.back();
    else router.replace('/adversary');
  };

  const onDelete = async () => {
    const first = await confirmAsync(
      t.game.deleteTitle1,
      t.game.deleteBody1,
      t.common.continue,
      t.common.cancel,
    );
    if (!first) return;
    const second = await confirmAsync(
      t.game.deleteTitle2,
      t.game.deleteBody2,
      t.game.deleteAll,
      t.common.cancel,
    );
    if (!second) return;
    await deleteAllData();
    router.replace('/adversary');
  };

  return (
    <ScrollView
      style={{ backgroundColor: gamePalette.bg }}
      contentContainerStyle={{
        paddingHorizontal: gameSpace.xl,
        paddingTop: insets.top + gameSpace.xl,
        paddingBottom: insets.bottom + gameSpace.xxl,
        flexGrow: 1,
        maxWidth: 560,
        width: '100%',
        alignSelf: 'center',
        gap: gameSpace.lg,
      }}
    >
      {/* First, not last: a screen you cannot leave without the system back
          gesture is a screen the web build strands you on. */}
      <GameButton
        label={t.game.backToGame}
        tone="quiet"
        onPress={backToGame}
        style={{ alignSelf: 'flex-start', minHeight: 44, paddingVertical: gameSpace.sm }}
      />

      <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
        {t.game.prescriptionTitle}
      </Text>
      <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
        {t.game.prescriptionIntro}
      </Text>
      <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
        {t.game.prescriptionRuns(diagnosis.runs, diagnosis.levelsAttempted)}
      </Text>

      {diagnosis.pending ? (
        <View style={{ gap: gameSpace.sm }}>
          <Text style={[gameType.question, { color: gamePalette.ink, fontSize: 20 }]}>
            {t.game.pendingTitle}
          </Text>
          <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
            {t.game.pendingBody}
          </Text>
        </View>
      ) : null}

      {diagnosis.clean ? (
        <View style={{ gap: gameSpace.sm }}>
          <Text style={[gameType.question, { color: gamePalette.you, fontSize: 20 }]}>
            {t.game.cleanTitle}
          </Text>
          <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
            {t.game.cleanBody}
          </Text>
        </View>
      ) : null}

      {/* Every finding, ready or not, with the plays behind it. A screen that
          showed only what fired would hide the denominators, and the
          denominators are what make this honest. */}
      <View style={{ gap: gameSpace.sm }}>
        {diagnosis.findings.map((finding) => {
          const id = finding.id as FindingId;
          const label = t.game.findingLabel[id];
          // The card already carries the label above this line, so a
          // not-ready one must not repeat it.
          const line = finding.ready
            ? t.game.evidence[id](finding.numerator, finding.denominator)
            : t.game.needMore(finding.needed);
          return (
            <View
              key={id}
              {...group(`${label}. ${line}`)}
              style={{
                backgroundColor: gamePalette.surface,
                borderRadius: gameRadius.sm,
                borderLeftWidth: 3,
                borderLeftColor: finding.triggered ? gamePalette.opponent : gamePalette.line,
                padding: gameSpace.md,
                gap: gameSpace.xs,
                opacity: finding.ready ? 1 : 0.6,
              }}
            >
              <Text {...decorative} style={[gameType.label, { color: gamePalette.quiet }]}>
                {label}
              </Text>
              <Text {...decorative} style={[gameType.body, { color: gamePalette.ink }]}>
                {line}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ gap: gameSpace.sm }}>
        <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.rungTitle}</Text>
        <RungTower
          rungs={tower}
          current={rung}
          hereLabel={t.game.rungHere}
          alwaysOpenLabel={t.game.rungAlwaysOpen}
          label={t.game.rungTowerLabel(rung, rungName)}
        />
        <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>{rungExplanation}</Text>
      </View>

      {diagnosis.prescription.instructions.length > 0 ? (
        <View style={{ gap: gameSpace.sm }}>
          <Text style={[gameType.label, { color: gamePalette.quiet }]}>
            {t.game.instructionsTitle}
          </Text>
          {diagnosis.prescription.instructions.map((id) => (
            <View
              key={id}
              style={{
                backgroundColor: gamePalette.surface,
                borderRadius: gameRadius.sm,
                borderLeftWidth: 3,
                borderLeftColor: gamePalette.you,
                padding: gameSpace.md,
              }}
            >
              <Text style={[gameType.argument, { color: gamePalette.ink }]}>
                {t.game.instruction[id]}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Selectable, always. The copy button is a convenience; the text being
          reachable without it is the guarantee. */}
      <View
        style={{
          backgroundColor: gamePalette.surfaceAlt,
          borderRadius: gameRadius.md,
          padding: gameSpace.md,
        }}
      >
        <Text
          selectable
          accessibilityLabel={block}
          style={[gameType.caption, { color: gamePalette.ink, fontFamily: 'monospace' }]}
        >
          {block}
        </Text>
      </View>

      <GameButton
        label={copied ? t.game.copied : t.game.copyBlock}
        tone="you"
        onPress={() => {
          void copyPrescription(block).then(setCopied);
        }}
      />
      <Text style={[gameType.caption, { color: gamePalette.quiet }]}>{t.game.copyHelp}</Text>

      <View style={{ gap: gameSpace.sm, marginTop: gameSpace.lg }}>
        <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.whatIsThis}</Text>
        <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>
          {t.game.whatIsThisBody}
        </Text>
      </View>

      <View style={{ gap: gameSpace.sm, marginTop: gameSpace.lg }}>
        <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.dataTitle}</Text>
        <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>{t.game.dataNote}</Text>
        <GameButton
          label={t.game.exportData}
          tone="quiet"
          onPress={() => void exportJsonToUser(exportJson())}
        />
        <GameButton label={t.game.deleteAll} tone="danger" onPress={() => void onDelete()} />
      </View>

      <GameButton label={t.game.backToGame} tone="quiet" onPress={backToGame} />
    </ScrollView>
  );
}
