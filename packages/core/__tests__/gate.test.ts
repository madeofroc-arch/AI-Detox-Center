import { describe, expect, it } from 'vitest';
import {
  GateTransitionError,
  answerTriedFirst,
  attachGateReflection,
  finishAttempt,
  gateToUsageEvent,
  resolveGate,
  setIntention,
  skipAttempt,
  startGate,
} from '../src/index';

const T0 = '2026-08-18T09:00:00.000Z';
const T1 = '2026-08-18T09:05:00.000Z';

describe('AI Gate state machine', () => {
  it('walks the full path: intention -> tried -> outcome -> completed', () => {
    let s = startGate('g1', T0);
    expect(s.step).toBe('intention');
    s = setIntention(s, { question: 'draft an email', category: 'direct_delegation' });
    expect(s.step).toBe('attempt_check');
    s = answerTriedFirst(s, true);
    expect(s.step).toBe('outcome');
    s = resolveGate(s, 'solved_myself', T1);
    expect(s.step).toBe('completed');
    expect(s.completedAt).toBe(T1);
  });

  it('offers an attempt when the user has not tried yet', () => {
    let s = startGate('g2', T0);
    s = setIntention(s, { question: 'fix this bug', category: 'instant_help' });
    s = answerTriedFirst(s, false);
    expect(s.step).toBe('attempt');
    s = finishAttempt(s, 180);
    expect(s.step).toBe('outcome');
    expect(s.attemptSeconds).toBe(180);
    expect(s.skippedAttempt).toBe(false);
  });

  it('allows skipping the attempt without penalty fields', () => {
    let s = startGate('g3', T0);
    s = setIntention(s, { question: '', category: 'lookup' });
    s = answerTriedFirst(s, false);
    s = skipAttempt(s);
    expect(s.step).toBe('outcome');
    expect(s.attemptSeconds).toBe(0);
    expect(s.skippedAttempt).toBe(true);
  });

  it('rejects invalid transitions with a typed error', () => {
    const s = startGate('g4', T0);
    expect(() => answerTriedFirst(s, true)).toThrow(GateTransitionError);
    expect(() => resolveGate(s, 'proceeded_to_ai', T1)).toThrow(GateTransitionError);
    expect(() => skipAttempt(s)).toThrow(GateTransitionError);
    expect(() => finishAttempt(s, 10)).toThrow(GateTransitionError);
    expect(() => gateToUsageEvent(s, 'e1')).toThrow(GateTransitionError);
  });

  it('rejects negative attempt durations', () => {
    let s = startGate('g5', T0);
    s = setIntention(s, { question: 'x', category: 'lookup' });
    s = answerTriedFirst(s, false);
    expect(() => finishAttempt(s, -1)).toThrow(RangeError);
  });
});

describe('gateToUsageEvent', () => {
  function completed(opts: { tried: boolean; skip?: boolean; outcome: Parameters<typeof resolveGate>[1] }) {
    let s = startGate('g', T0);
    s = setIntention(s, { question: 'q', category: 'decision_outsourcing' });
    s = answerTriedFirst(s, opts.tried);
    if (!opts.tried) {
      s = opts.skip ? skipAttempt(s) : finishAttempt(s, 120);
    }
    return resolveGate(s, opts.outcome, T1);
  }

  it('solved myself: no AI use, attempt credited', () => {
    const e = gateToUsageEvent(completed({ tried: true, outcome: 'solved_myself' }), 'e1');
    expect(e.usedAI).toBe(false);
    expect(e.attemptedFirst).toBe(true);
    expect(e.proceededImmediately).toBe(false);
    expect(e.source).toBe('gate');
  });

  it('skip + proceed to AI: immediate use, no attempt', () => {
    const e = gateToUsageEvent(completed({ tried: false, skip: true, outcome: 'proceeded_to_ai' }), 'e2');
    expect(e.usedAI).toBe(true);
    expect(e.attemptedFirst).toBe(false);
    expect(e.proceededImmediately).toBe(true);
  });

  it('attempt then proceed: AI used but attempt credited', () => {
    const e = gateToUsageEvent(completed({ tried: false, skip: false, outcome: 'proceeded_to_ai' }), 'e3');
    expect(e.usedAI).toBe(true);
    expect(e.attemptedFirst).toBe(true);
    expect(e.proceededImmediately).toBe(false);
  });

  it('carries the attached reflection id', () => {
    let s = completed({ tried: true, outcome: 'hint_then_thinking' });
    s = attachGateReflection(s, 'ref_1');
    expect(gateToUsageEvent(s, 'e4').reflectionId).toBe('ref_1');
  });
});
