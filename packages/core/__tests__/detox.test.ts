import { describe, expect, it } from 'vitest';
import {
  DetoxTransitionError,
  completeDetox,
  elapsedFocusedSeconds,
  endDetoxEarly,
  isTimeUp,
  pauseDetox,
  remainingSeconds,
  resumeDetox,
  startDetox,
} from '../src/index';

const T = (min: number, sec = 0) =>
  new Date(Date.UTC(2026, 7, 18, 9, min, sec)).toISOString();

describe('Detox session', () => {
  it('tracks focused time and excludes paused time', () => {
    let s = startDetox('d1', 25, 'write the memo myself', T(0));
    s = pauseDetox(s, T(10));
    s = resumeDetox(s, T(15));
    expect(elapsedFocusedSeconds(s, T(20))).toBe(15 * 60);
    expect(remainingSeconds(s, T(20))).toBe(10 * 60);
  });

  it('freezes elapsed time while paused', () => {
    let s = startDetox('d2', 25, '', T(0));
    s = pauseDetox(s, T(5));
    expect(elapsedFocusedSeconds(s, T(60))).toBe(5 * 60);
  });

  it('completes and records the end time', () => {
    let s = startDetox('d3', 25, '', T(0));
    s = completeDetox(s, T(25));
    expect(s.state).toBe('completed');
    expect(s.endedAt).toBe(T(25));
    expect(elapsedFocusedSeconds(s, T(90))).toBe(25 * 60);
  });

  it('ending early is a first-class outcome with the same neutral shape', () => {
    let s = startDetox('d4', 50, '', T(0));
    s = endDetoxEarly(s, T(18));
    expect(s.state).toBe('ended_early');
    expect(elapsedFocusedSeconds(s, T(90))).toBe(18 * 60);
  });

  it('can end from paused (pause is closed first)', () => {
    let s = startDetox('d5', 25, '', T(0));
    s = pauseDetox(s, T(10));
    s = endDetoxEarly(s, T(12));
    expect(s.state).toBe('ended_early');
    expect(elapsedFocusedSeconds(s, T(20))).toBe(10 * 60);
  });

  it('reports time up at the planned duration', () => {
    const s = startDetox('d6', 25, '', T(0));
    expect(isTimeUp(s, T(24))).toBe(false);
    expect(isTimeUp(s, T(25))).toBe(true);
  });

  it('rejects invalid transitions', () => {
    const s = startDetox('d7', 25, '', T(0));
    expect(() => resumeDetox(s, T(1))).toThrow(DetoxTransitionError);
    const done = completeDetox(s, T(25));
    expect(() => pauseDetox(done, T(26))).toThrow(DetoxTransitionError);
    expect(() => completeDetox(done, T(26))).toThrow(DetoxTransitionError);
  });

  it('rejects non-positive planned durations', () => {
    expect(() => startDetox('d8', 0, '', T(0))).toThrow(RangeError);
  });
});
