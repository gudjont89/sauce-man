import { describe, expect, it } from 'vitest';
import {
  advanceHistory,
  EMPTY_HISTORY,
  sampleIndex,
  SauceSpawner,
  spawnProbabilities,
  type SpawnHistory,
} from './sauceSpawner';

const SAUCES = ['A', 'B', 'C', 'D', 'E'];

function history(recent: string[], spawnsSinceUnclicked = 0): SpawnHistory {
  return { recent, spawnsSinceUnclicked };
}

function expectDistribution(actual: number[], expected: number[]) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((p, i) => expect(actual[i]).toBeCloseTo(p, 10));
}

describe('spawnProbabilities', () => {
  it('weights unclicked sauces twice as high as clicked ones', () => {
    const p = spawnProbabilities(['A', 'B'], [true, false], EMPTY_HISTORY);
    expectDistribution(p, [2 / 3, 1 / 3]);
  });

  it('sums to 1', () => {
    const p = spawnProbabilities(SAUCES, [true, false, true, false, false], history(['A']));
    expect(p.reduce((sum, x) => sum + x, 0)).toBeCloseTo(1, 10);
  });

  it('gives sauces in the recent window probability 0', () => {
    const p = spawnProbabilities(SAUCES, [false, false, false, false, false], history(['B', 'D']));
    expectDistribution(p, [1 / 3, 0, 1 / 3, 0, 1 / 3]);
  });

  it('only allows unclicked sauces after 3 spawns without one', () => {
    const unclicked = [false, false, true, false, true];
    const p = spawnProbabilities(SAUCES, unclicked, history(['A', 'B'], 3));
    expectDistribution(p, [0, 0, 0.5, 0, 0.5]);
  });

  it('does not force an unclicked sauce after only 2 spawns without one', () => {
    const unclicked = [false, false, true, false, false];
    const p = spawnProbabilities(SAUCES, unclicked, history(['A', 'B'], 2));
    expectDistribution(p, [0, 0, 0.5, 0.25, 0.25]);
  });

  it('skips the unclicked rule when the only unclicked sauces were just spawned', () => {
    const unclicked = [false, false, true, false, false];
    const p = spawnProbabilities(SAUCES, unclicked, history(['C', 'D'], 3));
    expectDistribution(p, [1 / 3, 1 / 3, 0, 0, 1 / 3]);
  });

  it('drops the uniqueness rule when every sauce was recently spawned', () => {
    const p = spawnProbabilities(['A', 'B'], [false, false], history(['A', 'B']));
    expectDistribution(p, [0.5, 0.5]);
  });

  it('works with a single sauce', () => {
    expectDistribution(spawnProbabilities(['A'], [false], history(['A'], 5)), [1]);
  });
});

describe('sampleIndex', () => {
  const p = [0.5, 0, 0.25, 0.25];

  it('picks by cumulative probability', () => {
    expect(sampleIndex(p, 0)).toBe(0);
    expect(sampleIndex(p, 0.49)).toBe(0);
    expect(sampleIndex(p, 0.5)).toBe(2);
    expect(sampleIndex(p, 0.74)).toBe(2);
    expect(sampleIndex(p, 0.75)).toBe(3);
  });

  it('never picks an index with probability 0', () => {
    for (let roll = 0; roll < 1; roll += 0.01) {
      expect(sampleIndex(p, roll)).not.toBe(1);
    }
  });

  it('falls back to the last possible index when rounding leaves a remainder', () => {
    expect(sampleIndex([0.5, 0.25, 0.25, 0], 0.9999999999999999 + 1e-9)).toBe(2);
  });
});

describe('advanceHistory', () => {
  it('appends the spawned sauce and keeps only the last 2', () => {
    let h = advanceHistory(EMPTY_HISTORY, 'A', false);
    expect(h.recent).toEqual(['A']);
    h = advanceHistory(h, 'B', false);
    h = advanceHistory(h, 'C', false);
    expect(h.recent).toEqual(['B', 'C']);
  });

  it('counts spawns without an unclicked sauce and resets on an unclicked one', () => {
    let h = advanceHistory(EMPTY_HISTORY, 'A', false);
    h = advanceHistory(h, 'B', false);
    expect(h.spawnsSinceUnclicked).toBe(2);
    h = advanceHistory(h, 'C', true);
    expect(h.spawnsSinceUnclicked).toBe(0);
  });

  it('does not mutate the previous history', () => {
    const before = history(['A'], 1);
    advanceHistory(before, 'B', false);
    expect(before).toEqual(history(['A'], 1));
  });
});

describe('SauceSpawner', () => {
  it('feeds each pick back into the next one', () => {
    // Roll 0 always picks the first sauce that is allowed.
    const spawner = new SauceSpawner(SAUCES, () => 0);
    const unclicked = [false, false, false, false, true];
    expect(Array.from({ length: 4 }, () => spawner.next(unclicked))).toEqual(['A', 'B', 'C', 'E']);
  });
});
