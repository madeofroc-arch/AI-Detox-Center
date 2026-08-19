import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ADVERSARY_CATALOG,
  DEFAULT_QUIZ_CONFIG,
  LOCALES,
  LOCALE_NAMES,
  LIFELINE_IDS,
  TIER_ORDER,
  advance,
  audienceShares,
  buildRunRecord,
  canSpend,
  chooseGrant,
  friendCall,
  grantableLifelines,
  hostCall,
  ladder,
  lifelineCount,
  lockInstinct,
  playedRoundIds,
  selectOption,
  spendLifeline,
  startRun,
  submit,
  swapQuestion,
  walkAway,
} from '@ai-detox/core';
import type { LanguagePreference, RunState, TierId } from '@ai-detox/core';
import { GameButton } from '../components/game/GameButton';
import { LadderRail, LifelineBar } from '../components/game/LifelineBar';
import { OptionRow } from '../components/game/OptionRow';
import type { OptionState } from '../components/game/OptionRow';
import { useI18n } from '../i18n/useI18n';
import { todayKey } from '../lib/clock';
import { exactFormatter } from '../lib/numbers';
import { useAppStore } from '../state/store';
import { MIN_TOUCH_TARGET, decorative, group } from '../theme/a11y';
import { gamePalette, gameRadius, gameSpace, gameType } from '../theme/game';

/**
 * The Adversary. See docs/product/adversary.md.
 *
 * One screen, and the run's phase decides what is on it. Every rule lives in
 * core's reducer (`quiz-run.ts`); this file reads the state, renders it, and
 * calls transitions. No business rule is allowed to live here (CLAUDE.md
 * rule 7) — including, in particular, anything about what is measured.
 *
 * A run ends itself. There is no affordance anywhere that offers one more
 * question (principle 8).
 */

const config = DEFAULT_QUIZ_CONFIG;

export default function Adversary() {
  const { t, locale } = useI18n();
  const exact = useMemo(() => exactFormatter(locale), [locale]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const history = useAppStore((s) => s.data.adversaryRuns);
  const recordAdversaryRun = useAppStore((s) => s.recordAdversaryRun);
  const language = useAppStore((s) => s.data.settings.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const [run, setRun] = useState<RunState | null>(null);
  const [runIndex, setRunIndex] = useState(0);

  /**
   * Every transition goes through here, and a run that has just ended is kept.
   *
   * At the transition rather than in an effect watching for `over`: an effect
   * would have to guard itself against re-running, which means holding "have I
   * saved this one" in state and setting it during the effect — a cascading
   * render, and one more place the two could disagree. The phase comparison
   * here is exact, because `apply` is the only thing that moves the run.
   */
  const apply = (next: RunState) => {
    setRun(next);
    if (next.phase === 'over' && run?.phase !== 'over') {
      void recordAdversaryRun(buildRunRecord(next, config));
    }
  };

  const begin = (tier: TierId) => {
    setRun(
      startRun(
        `${todayKey()}#${tier}#${runIndex}`,
        tier,
        ADVERSARY_CATALOG,
        playedRoundIds(history),
        config,
      ),
    );
  };

  const body = (children: React.ReactNode) => (
    <ScrollView
      style={{ backgroundColor: gamePalette.bg }}
      contentContainerStyle={{
        paddingHorizontal: gameSpace.xl,
        paddingTop: insets.top + gameSpace.lg,
        paddingBottom: insets.bottom + gameSpace.xxl,
        flexGrow: 1,
        maxWidth: 560,
        width: '100%',
        alignSelf: 'center',
        gap: gameSpace.lg,
      }}
    >
      {children}
    </ScrollView>
  );

  if (!run) {
    return body(
      <>
        <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
          {t.game.chooseTier}
        </Text>
        <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
          {t.game.chooseTierHelp}
        </Text>

        {TIER_ORDER.map((id) => {
          const tier = config.tiers[id];
          const items = Object.values(tier.startingInventory).reduce(
            (sum, n) => sum + (n ?? 0),
            0,
          );
          const rungs = ladder(tier);
          return (
            <View
              key={id}
              style={{
                backgroundColor: gamePalette.surface,
                borderRadius: gameRadius.md,
                padding: gameSpace.lg,
                gap: gameSpace.sm,
              }}
            >
              <Text style={[gameType.question, { color: gamePalette.ink, fontSize: 21 }]}>
                {t.game.tierName[id]}
              </Text>
              <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>
                {t.game.tierBlurb[id]}
              </Text>
              <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
                {t.game.tierSpec(tier.levels, tier.lives, items)}
              </Text>
              {/* Stated before the run, not discovered during it. The finding
                  this game produces is that fluent confident prose moves people
                  who have already been told it is unreliable. */}
              <Text style={[gameType.caption, { color: gamePalette.opponent }]}>
                {t.game.hostHonesty[id]}
              </Text>
              <Text style={[gameType.caption, { color: gamePalette.gold }]}>
                {rungs.map((v) => exact(v)).join(' · ')}
              </Text>
              <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
                {tier.safePoints.length > 0
                  ? t.game.safePointAt(tier.safePoints)
                  : t.game.noSafePoint}
              </Text>
              <GameButton label={t.game.begin} tone="you" onPress={() => begin(id)} />
            </View>
          );
        })}

        <Text style={[gameType.caption, { color: gamePalette.quiet }]}>{t.game.englishOnly}</Text>

        {history.length > 0 ? (
          <GameButton
            label={t.game.seePrescription}
            tone="quiet"
            onPress={() => router.push('/prescription')}
          />
        ) : null}

        {/* The game is the whole app now, so the one setting it cannot do
            without lives here rather than behind a tab bar belonging to a
            product nothing links to any more. */}
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t.game.language}
          style={{ gap: gameSpace.sm, marginTop: gameSpace.lg }}
        >
          <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.language}</Text>
          <View style={{ flexDirection: 'row', gap: gameSpace.sm }}>
            {(['system', ...LOCALES] as LanguagePreference[]).map((option) => (
              <GameButton
                key={option}
                label={option === 'system' ? t.game.languageSystem : LOCALE_NAMES[option]}
                tone={language === option ? 'you' : 'quiet'}
                role="radio"
                selected={language === option}
                style={{ flex: 1, minHeight: MIN_TOUCH_TARGET }}
                onPress={() => void setLanguage(option)}
              />
            ))}
          </View>
        </View>
      </>,
    );
  }

  const tier = config.tiers[run.tier];
  const board = run.board;
  const result = run.lastResult;
  const revealing = run.phase === 'reveal';

  const spentIds = new Set(run.spent.map((u) => u.id));
  const audience = spentIds.has('audience') ? audienceShares(run.seed, board) : null;
  const friend = spentIds.has('friend') ? friendCall(run.seed, board) : null;
  /**
   * The host speaks on every reveal, bought or not.
   *
   * Buying it is what lets you hear the argument BEFORE answering; it is not
   * what decides whether the argument exists. An earlier build only ever showed
   * the host when it had been paid for, which meant the beat this product turns
   * on — a confident argument, then its grading — fired about once a run
   * instead of on every question, and the bluffs were content almost nobody
   * would read. Nothing about the measurement changes: `nerve` is still only
   * scored on levels where the host was asked, because only there was a
   * decision actually offered.
   */
  const askedHost = spentIds.has('host');
  const host = askedHost || revealing ? hostCall(board) : null;

  const optionState = (index: number): OptionState => {
    if (revealing && result) {
      if (index === board.correctIndex) return 'correct';
      if (index === result.finalIndex) return 'chosenWrong';
      return run.eliminated.includes(index) ? 'eliminated' : 'idle';
    }
    if (run.eliminated.includes(index)) return 'eliminated';
    return index === run.selectedIndex ? 'selected' : 'idle';
  };

  const optionLabel = (index: number): string => {
    const parts = [`${t.game.optionLetter(index)}. ${exact(board.options[index]!)}`];
    if (audience) parts.push(`${audience[index]}%`);
    if (friend?.index === index) parts.push(t.game.friendLead);
    if (host?.index === index) parts.push(t.game.hostLead);
    const state = optionState(index);
    if (state === 'eliminated') parts.push(t.game.struckOut);
    if (state === 'correct') parts.push(t.game.gotIt);
    if (state === 'chosenWrong') parts.push(t.game.missedIt);
    return parts.join(', ');
  };

  // ── The record ───────────────────────────────────────────────────────────
  if (run.phase === 'over') {
    const record = buildRunRecord(run, config);
    const taken = run.results.filter((r) => r.nerve === 'taken');
    return body(
      <>
        <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
          {t.game.recordTitle}
        </Text>
        <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
          {record.ending === 'cleared'
            ? t.game.endingCleared
            : record.ending === 'outOfLives'
              ? t.game.endingOutOfLives
              : t.game.endingWalkedAway}
        </Text>

        <Text style={[gameType.figure, { color: gamePalette.gold }]}>
          {t.game.banked(exact(record.bank))}
        </Text>
        <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
          {t.game.clearedOf(record.levelsCleared, record.levelsAttempted)}
        </Text>

        <Grid
          title={t.game.relianceTitle}
          rows={[
            ['soloRight', t.game.relianceCell.soloRight, record.reliance.soloRight, true],
            ['soloWrong', t.game.relianceCell.soloWrong, record.reliance.soloWrong, false],
            [
              'aidedUnneeded',
              t.game.relianceCell.aidedUnneeded,
              record.reliance.aidedUnneeded,
              false,
            ],
            ['aidedNeeded', t.game.relianceCell.aidedNeeded, record.reliance.aidedNeeded, true],
          ]}
        />

        {record.bluffsFaced + record.soundArgumentsFaced === 0 ? (
          <View style={{ gap: gameSpace.sm }}>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.nerveTitle}</Text>
            <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>
              {t.game.nerveEmpty}
            </Text>
          </View>
        ) : (
          <Grid
            title={t.game.nerveTitle}
            rows={[
              ['heldFirm', t.game.nerveCell.heldFirm, record.nerve.heldFirm, true],
              ['taken', t.game.nerveCell.taken, record.nerve.taken, false],
              ['updated', t.game.nerveCell.updated, record.nerve.updated, true],
              [
                'missedUpdate',
                t.game.nerveCell.missedUpdate,
                record.nerve.missedUpdate,
                false,
              ],
            ]}
          />
        )}

        <View style={{ gap: gameSpace.sm }}>
          <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.gotYou}</Text>
          {taken.length === 0 ? (
            <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>
              {t.game.gotYouEmpty}
            </Text>
          ) : (
            taken.map((r) => (
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
                  {ADVERSARY_CATALOG.find((c) => c.id === r.roundId)?.question ?? r.roundId}
                </Text>
                <Text style={[gameType.body, { color: gamePalette.ink }]}>{r.host?.argument}</Text>
              </View>
            ))
          )}
        </View>

        <GameButton
          label={t.game.seePrescription}
          tone="you"
          onPress={() => router.push('/prescription')}
        />
        <GameButton
          label={t.game.playAgain}
          tone="quiet"
          onPress={() => {
            setRunIndex((n) => n + 1);
            setRun(null);
          }}
        />
        <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
          {t.game.seed(run.seed)} · {t.game.seedNote}
        </Text>
      </>,
    );
  }

  // ── A lifeline granted ───────────────────────────────────────────────────
  if (run.phase === 'grant') {
    const grantable = grantableLifelines(run, config);
    return body(
      <>
        <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
          {t.game.grantTitle}
        </Text>
        <Text style={[gameType.argument, { color: gamePalette.inkMuted }]}>
          {t.game.grantHelp(run.level)}
        </Text>
        {LIFELINE_IDS.map((id) => {
          const full = !grantable.includes(id);
          return (
            <GameButton
              key={id}
              label={`${t.game.lifelineName[id]} ×${lifelineCount(run.inventory, id)}${
                full ? ` · ${t.game.grantFull}` : ''
              }`}
              tone={full ? 'quiet' : 'plain'}
              accessibilityLabel={`${t.game.lifelineName[id]}. ${t.game.lifelineHelp[id]}`}
              onPress={() => {
                if (!full) apply(chooseGrant(run, id, config));
              }}
            />
          );
        })}
      </>,
    );
  }

  // ── A question ───────────────────────────────────────────────────────────
  return body(
    <>
      <LadderRail
        levels={tier.levels}
        current={run.level}
        safePoints={tier.safePoints}
        label={t.game.levelOf(run.level, tier.levels)}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: gameSpace.md }}>
        <Text style={[gameType.label, { color: gamePalette.quiet, flexShrink: 1 }]}>
          {t.game.levelOf(run.level, tier.levels)} · {t.game.livesLeft(run.livesLeft)}
        </Text>
        <Text style={[gameType.label, { color: gamePalette.gold, textAlign: 'right' }]}>
          {t.game.worth(exact(board.value))}
        </Text>
      </View>

      <Text accessibilityRole="header" style={[gameType.question, { color: gamePalette.ink }]}>
        {board.round.question}
      </Text>
      <Text style={[gameType.caption, { color: gamePalette.quiet }]}>{board.round.unit}</Text>

      <View accessibilityRole="radiogroup" style={{ gap: gameSpace.sm }}>
        {[0, 1, 2, 3].map((index) => (
          <OptionRow
            key={index}
            letter={t.game.optionLetter(index)}
            value={exact(board.options[index]!)}
            state={optionState(index)}
            disabled={revealing}
            hostPick={host?.index === index}
            friendPick={friend?.index === index}
            audience={audience ? audience[index] : undefined}
            accessibilityLabel={optionLabel(index)}
            onPress={() =>
              apply(
                run.phase === 'instinct' ? lockInstinct(run, index) : selectOption(run, index),
              )
            }
          />
        ))}
      </View>

      {/* What the help said, in its own voice. The friend hedges and the host
          never does; that contrast is the product's whole argument, made by
          playing rather than by being told. */}
      {friend ? (
        <Card tone={gamePalette.you} lead={t.game.friendLead}>
          {t.game.friendSays(t.game.optionLetter(friend.index), Math.round(friend.confidence * 100))}
        </Card>
      ) : null}
      {host ? (
        <Card
          tone={gamePalette.opponent}
          lead={askedHost ? t.game.hostLead : t.game.hostLeadUnasked}
        >
          {t.game.hostSays(t.game.optionLetter(host.index), host.argument)}
        </Card>
      ) : null}

      {revealing && result ? (
        <>
          <View style={{ gap: gameSpace.xs }}>
            <Text style={[gameType.argument, { color: result.correct ? gamePalette.you : gamePalette.inkMuted }]}>
              {result.correct ? t.game.gotIt : t.game.missedIt}
            </Text>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>{t.game.theAnswer}</Text>
            <Text style={[gameType.figure, { color: gamePalette.gold }]}>
              {exact(board.round.trueValue)}
            </Text>
            <Text style={[gameType.caption, { color: gamePalette.inkMuted }]}>
              {board.round.unit}
            </Text>
          </View>

          {/* Beat two: the host is graded. The beat the product turns on, and
              it fires whether or not the host was bought. On a level where it
              was not, the verdict states what the argument was and stops —
              never "it would have saved you", which is a shame mechanic wearing
              a tip's clothes (principle 7). */}
          <Card
            tone={board.hostKind === 'bluff' ? gamePalette.opponent : gamePalette.you}
            lead={
              result.host
                ? t.game.verdictLead(
                    result.host.kind === 'bluff' ? t.game.hostWasBluffing : t.game.hostWasSound,
                    result.finalIndex === result.host.index ? t.game.andMoved : t.game.andHeld,
                  )
                : board.hostKind === 'bluff'
                  ? t.game.hostWasBluffing
                  : t.game.hostWasSound
            }
          >
            {(board.hostKind === 'bluff' ? board.round.bluff : board.round.honest).verdict}
          </Card>

          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
            {board.round.sourceNote}
          </Text>

          <Text style={[gameType.figure, { color: result.correct ? gamePalette.you : gamePalette.quiet }]}>
            {result.correct ? t.game.scored(exact(result.points)) : t.game.scoredNothing}
          </Text>
          {!result.correct && run.ending === null ? (
            <Text style={[gameType.caption, { color: gamePalette.quiet }]}>{t.game.lostALife}</Text>
          ) : null}

          <GameButton
            label={run.ending === null ? t.game.nextLevel : t.game.seeRecord}
            tone="you"
            onPress={() => apply(advance(run, config))}
          />
        </>
      ) : (
        <>
          <View style={{ gap: gameSpace.sm }}>
            <Text style={[gameType.label, { color: gamePalette.quiet }]}>
              {t.game.lifelinesLabel}
            </Text>
            <LifelineBar
              items={LIFELINE_IDS.map((id) => {
                const count = lifelineCount(run.inventory, id);
                const spent = spentIds.has(id);
                const cost = Math.round(config.lifelineCost[id] * 100);
                return {
                  id,
                  label: t.game.lifelineName[id],
                  count,
                  spent,
                  available: canSpend(run, id),
                  accessibilityLabel: `${t.game.lifelineName[id]}. ${t.game.lifelineHelp[id]} ${
                    cost === 100 ? t.game.lifelineFree : t.game.lifelineCost(cost)
                  }. ×${count}`,
                  onPress: () =>
                    apply(id === 'swap' ? swapQuestion(run, config) : spendLifeline(run, id)),
                };
              })}
            />
          </View>

          {run.phase === 'instinct' ? (
            <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>{t.game.pickFirst}</Text>
          ) : (
            <>
              {run.selectedIndex === null ? (
                <Text style={[gameType.body, { color: gamePalette.inkMuted }]}>
                  {t.game.reselect}
                </Text>
              ) : (
                <>
                  <Text style={[gameType.argument, { color: gamePalette.ink }]}>
                    {t.game.finalAnswer}
                  </Text>
                  <GameButton
                    label={`${t.game.lockAnswer} — ${t.game.optionLetter(run.selectedIndex)}`}
                    tone="you"
                    onPress={() => apply(submit(run, config))}
                  />
                </>
              )}
            </>
          )}

          <GameButton
            label={t.game.walkAway}
            tone="quiet"
            accessibilityLabel={`${t.game.walkAway}. ${t.game.walkAwayHelp(exact(run.bank))}`}
            onPress={() => apply(walkAway(run))}
          />
          <Text style={[gameType.caption, { color: gamePalette.quiet }]}>
            {t.game.bank(exact(run.bank))} · {t.game.guaranteed(exact(run.guaranteed))}
          </Text>
        </>
      )}
    </>,
  );
}

/** A quoted voice — the friend, the host, or the verdict on the host. */
function Card({
  tone,
  lead,
  children,
}: {
  tone: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: gamePalette.surface,
        borderRadius: gameRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: tone,
        padding: gameSpace.lg,
        gap: gameSpace.sm,
      }}
    >
      <Text style={[gameType.label, { color: tone }]}>{lead}</Text>
      <Text style={[gameType.argument, { color: gamePalette.ink }]}>{children}</Text>
    </View>
  );
}

/** One of the two 2x2s on the record. */
function Grid({
  title,
  rows,
}: {
  title: string;
  rows: readonly (readonly [string, string, number, boolean])[];
}) {
  return (
    <View style={{ gap: gameSpace.sm }}>
      <Text style={[gameType.label, { color: gamePalette.quiet }]}>{title}</Text>
      {rows.map(([key, label, count, good]) => (
        <View
          key={key}
          {...group(`${label}: ${count}`)}
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
              { color: good ? gamePalette.you : gamePalette.quiet, fontWeight: '700' },
            ]}
          >
            {count}
          </Text>
        </View>
      ))}
    </View>
  );
}
