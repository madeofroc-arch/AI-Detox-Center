import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ADVERSARY_CATALOG,
  DEFAULT_ADVERSARY_CONFIG,
  bandFactor,
  buildRecord,
  missFactor,
  normalizeBand,
  openingBand,
  potentialPoints,
  resolveRound,
  selectSession,
} from '@ai-detox/core';
import type { Band, RoundResult } from '@ai-detox/core';
import { AxisReveal } from '../components/game/AxisReveal';
import { BandSlider } from '../components/game/BandSlider';
import { GameButton, NudgeRow } from '../components/game/GameButton';
import { useI18n } from '../i18n/useI18n';
import { compactFormatter, exactFormatter, formatFactor } from '../lib/numbers';
import { todayKey } from '../lib/clock';
import { decorative } from '../theme/a11y';
import { gamePalette, gameRadius, gameSpace, gameType } from '../theme/game';

/**
 * A session of The Adversary. See docs/product/adversary.md.
 *
 * One screen, five phases, and it ends itself — there is no affordance
 * anywhere that offers a sixth round (principle 8: no unbounded sessions).
 *
 * All state is in this component and nothing is persisted yet, so the record
 * covers the session you just played. Persisting it across sessions is what
 * makes calibration mean something, and it is the next piece of work.
 */
type Phase = 'intro' | 'commit' | 'pushback' | 'moving' | 'reveal' | 'record';

const config = DEFAULT_ADVERSARY_CONFIG;

export default function Adversary() {
  const { t, locale } = useI18n();
  const compact = useMemo(() => compactFormatter(locale), [locale]);
  const exact = useMemo(() => exactFormatter(locale), [locale]);
  const insets = useSafeAreaInsets();

  // A session is reproducible from its seed, so a bug report is a seed. The
  // index moves on "play again" and is shown on the record.
  const [sessionIndex, setSessionIndex] = useState(0);
  const seed = `${todayKey()}#${sessionIndex}`;
  const session = useMemo(
    () => selectSession(seed, ADVERSARY_CATALOG, [], config),
    [seed],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [band, setBand] = useState<Band>(() => openingBand(session[0]!.round));
  const [committed, setCommitted] = useState<Band | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);

  const current = session[Math.min(index, session.length - 1)]!;
  const round = current.round;
  const pushback = current.pushback === 'bluff' ? round.bluff : round.honest;
  const lastResult = results[results.length - 1];

  const startRound = (next: number) => {
    setIndex(next);
    setBand(openingBand(session[next]!.round));
    setCommitted(null);
    setPhase('commit');
  };

  const nudge = (factor: number) => {
    const centre = Math.sqrt(band.lo * band.hi);
    const half = Math.sqrt(band.hi / band.lo) ** factor;
    setBand(normalizeBand(round, { lo: centre / half, hi: centre * half }));
  };

  const settle = (moved: boolean) => {
    const result = resolveRound(
      round,
      { initialBand: committed ?? band, band, moved, pushback: current.pushback },
      config,
    );
    setResults((prev) => [...prev, result]);
    setPhase('reveal');
  };

  const record = buildRecord(results, config);

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
      }}
    >
      {phase === 'intro' ? (
        <View style={{ flex: 1, justifyContent: 'center', gap: gameSpace.lg }}>
          <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
            {t.game.introTitle}
          </Text>
          <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
            {t.game.introBody}
          </Text>
          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
            {t.game.introLength(session.length)}
          </Text>
          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
            {t.game.englishOnly}
          </Text>
          <GameButton label={t.game.begin} tone="you" onPress={() => startRound(0)} />
        </View>
      ) : null}

      {phase === 'commit' || phase === 'pushback' || phase === 'moving' ? (
        <View style={{ gap: gameSpace.lg }}>
          <Text style={[gameType.label, { color: gamePalette.quiet }]}>
            {t.game.roundOf(index + 1, session.length)}
          </Text>
          <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
            {round.question}
          </Text>
          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>{round.unit}</Text>

          <BandSlider
            round={round}
            band={band}
            onChange={setBand}
            disabled={phase === 'pushback'}
            format={compact}
            label={t.game.sliderA11y}
          />

          <View style={{ gap: gameSpace.xs }}>
            <Text style={[gameType.caption, { color: gamePalette.inkMuted }]}>{t.game.claim}</Text>
            <Text style={[gameType.figure, { color: gamePalette.you }]}>
              {compact(band.lo)} – {compact(band.hi)}
            </Text>
            <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
              {t.game.rangeFactor(formatFactor(bandFactor(round, band)))}
            </Text>
          </View>

          <Text style={[gameType.body, { color: gamePalette.gold }]}>
            {t.game.ifRight(potentialPoints(round, band, config))}
          </Text>

          {phase !== 'pushback' ? (
            <NudgeRow
              onNarrower={() => nudge(0.75)}
              onWider={() => nudge(1 / 0.75)}
              narrowerLabel={t.game.narrower}
              widerLabel={t.game.wider}
            />
          ) : null}

          {phase === 'commit' ? (
            <GameButton
              label={t.game.lockIn}
              tone="you"
              onPress={() => {
                setCommitted(band);
                setPhase('pushback');
              }}
            />
          ) : null}

          {phase === 'moving' ? (
            <GameButton label={t.game.lockAgain} tone="you" onPress={() => settle(true)} />
          ) : null}

          {phase === 'pushback' ? (
            <View style={{ gap: gameSpace.md }}>
              <View
                style={{
                  backgroundColor: gamePalette.opponentSoft,
                  borderRadius: gameRadius.md,
                  borderLeftWidth: 3,
                  borderLeftColor: gamePalette.opponent,
                  padding: gameSpace.lg,
                  gap: gameSpace.sm,
                }}
              >
                <Text style={[gameType.label, { color: gamePalette.opponent }]}>
                  {t.game.opponent}
                </Text>
                <Text style={[gameType.argument, { color: gamePalette.ink }]}>
                  {pushback.argument}
                </Text>
              </View>
              <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
                {t.game.holdMoveHelp}
              </Text>
              <View style={{ flexDirection: 'row', gap: gameSpace.md }}>
                <GameButton
                  label={t.game.hold}
                  tone="you"
                  style={{ flex: 1 }}
                  onPress={() => settle(false)}
                />
                <GameButton
                  label={t.game.move}
                  style={{ flex: 1 }}
                  onPress={() => setPhase('moving')}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {phase === 'reveal' && lastResult ? (
        <View style={{ gap: gameSpace.lg }}>
          <Text style={[gameType.label, { color: gamePalette.quiet }]}>
            {t.game.roundOf(index + 1, session.length)}
          </Text>
          <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>{round.question}</Text>

          <AxisReveal
            round={round}
            band={lastResult.band}
            hit={lastResult.hit}
            format={compact}
            label={
              lastResult.hit
                ? t.game.inside
                : t.game.outsideHigh(formatFactor(missFactor(round, lastResult.band)))
            }
          />

          <View style={{ gap: gameSpace.xs }}>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.answer}</Text>
            <Text style={[gameType.figure, { color: gamePalette.gold }]}>
              {exact(round.trueValue)}
            </Text>
            <Text style={[gameType.caption, { color: gamePalette.inkMuted }]}>{round.unit}</Text>
            <Text style={[gameType.body, { color: gamePalette.ink, marginTop: gameSpace.sm }]}>
              {lastResult.hit
                ? t.game.inside
                : round.trueValue < lastResult.band.lo
                  ? t.game.outsideLow(formatFactor(lastResult.missFactor))
                  : t.game.outsideHigh(formatFactor(lastResult.missFactor))}
            </Text>
          </View>

          {/* Beat two: the opponent is graded. The beat the product turns on. */}
          <View
            style={{
              backgroundColor: gamePalette.surface,
              borderRadius: gameRadius.md,
              padding: gameSpace.lg,
              gap: gameSpace.sm,
            }}
          >
            <Text style={[gameType.label, { color: gamePalette.opponent }]}>
              {t.game.verdictLead(
                current.pushback === 'bluff' ? t.game.wasBluff : t.game.wasHonest,
                lastResult.moved ? t.game.andMoved : t.game.andHeld,
              )}
            </Text>
            <Text style={[gameType.argument, { color: gamePalette.ink }]}>
              {pushback.verdict}
            </Text>
          </View>

          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>{round.sourceNote}</Text>

          <Text style={[gameType.figure, { color: gamePalette.you }]}>
            {t.game.scored(lastResult.points)}
          </Text>

          <GameButton
            label={index + 1 < session.length ? t.game.next : t.game.finish}
            tone="you"
            onPress={() =>
              index + 1 < session.length ? startRound(index + 1) : setPhase('record')
            }
          />
        </View>
      ) : null}

      {phase === 'record' ? (
        <View style={{ gap: gameSpace.lg }}>
          <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
            {t.game.recordTitle}
          </Text>

          <Text style={[gameType.figure, { color: gamePalette.gold }]}>
            {t.game.totalPoints(record.points)}
          </Text>

          <View style={{ gap: gameSpace.xs }}>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>
              {t.game.calibration}
            </Text>
            <Text style={[gameType.argument, { color: gamePalette.ink }]}>
              {record.calibration === null
                ? t.game.calibrationEmpty
                : t.game.calibrationLine(
                    record.hits,
                    record.bands,
                    Math.round(record.calibration * 100),
                  )}
            </Text>
          </View>

          <View style={{ gap: gameSpace.sm }}>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.nerve}</Text>
            {(
              [
                ['heldFirm', t.game.nerveHeldFirm],
                ['taken', t.game.nerveTaken],
                ['updated', t.game.nerveUpdated],
                ['missedUpdate', t.game.nerveMissedUpdate],
              ] as const
            ).map(([cell, label]) => (
              <View
                key={cell}
                accessible
                accessibilityLabel={`${label}: ${record.nerve[cell]}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: gameSpace.md,
                  backgroundColor: gamePalette.surface,
                  borderRadius: gameRadius.sm,
                  padding: gameSpace.md,
                }}
              >
                <Text
                  {...decorative}
                  style={[gameType.body, { color: gamePalette.inkMuted, flexShrink: 1 }]}
                >
                  {label}
                </Text>
                <Text
                  {...decorative}
                  style={[
                    gameType.body,
                    {
                      color:
                        cell === 'heldFirm' || cell === 'updated'
                          ? gamePalette.you
                          : gamePalette.quiet,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {record.nerve[cell]}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ gap: gameSpace.sm }}>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.gotYou}</Text>
            {results.filter((r) => r.nerve === 'taken').length === 0 ? (
              <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>
                {t.game.gotYouEmpty}
              </Text>
            ) : (
              results
                .filter((r) => r.nerve === 'taken')
                .map((r) => {
                  const entry = session.find((s) => s.round.id === r.roundId)!;
                  return (
                    <View
                      key={r.roundId}
                      style={{
                        backgroundColor: gamePalette.opponentSoft,
                        borderRadius: gameRadius.sm,
                        borderLeftWidth: 3,
                        borderLeftColor: gamePalette.opponent,
                        padding: gameSpace.md,
                        gap: gameSpace.xs,
                      }}
                    >
                      <Text style={[gameType.caption, { color: gamePalette.inkMuted }]}>
                        {entry.round.question}
                      </Text>
                      <Text style={[gameType.body, { color: gamePalette.ink }]}>
                        {entry.round.bluff.argument}
                      </Text>
                    </View>
                  );
                })
            )}
          </View>

          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
            {t.game.seed(seed)} · {t.game.seedNote}
          </Text>

          <GameButton
            label={t.game.playAgain}
            tone="you"
            onPress={() => {
              setSessionIndex((n) => n + 1);
              setResults([]);
              setIndex(0);
              setPhase('intro');
            }}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
