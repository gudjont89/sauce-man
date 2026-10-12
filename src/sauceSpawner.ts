// Relative chance of a sauce being picked to fall, depending on whether it has been clicked.
export const UNCLICKED_WEIGHT = 2;
export const CLICKED_WEIGHT = 1;
// At least every 4th spawned sauce must be an unclicked one.
export const MAX_SPAWNS_WITHOUT_UNCLICKED = 3;
// Any run of this many successive spawns must contain no repeats.
export const UNIQUE_WINDOW = 3;

export type SpawnHistory = {
  /** The most recently spawned sauces, oldest first. */
  recent: readonly string[];
  /** Consecutive spawns since a sauce that was unclicked at spawn time. */
  spawnsSinceUnclicked: number;
};

export const EMPTY_HISTORY: SpawnHistory = { recent: [], spawnsSinceUnclicked: 0 };

/**
 * Chance of each sauce being spawned next, in the same order as `sauces`.
 * `unclicked[i]` says whether `sauces[i]` is still unclicked right now.
 */
export function spawnProbabilities(
  sauces: readonly string[],
  unclicked: readonly boolean[],
  history: SpawnHistory,
): number[] {
  const all = sauces.map((_, i) => i);
  const fresh = all.filter((i) => !history.recent.includes(sauces[i]));
  const freshUnclicked = fresh.filter((i) => unclicked[i]);
  const mustBeUnclicked = history.spawnsSinceUnclicked >= MAX_SPAWNS_WITHOUT_UNCLICKED;

  // Uniqueness wins over the unclicked rule if the two can't both be met (e.g. fewer than 3 sauces).
  const candidates =
    mustBeUnclicked && freshUnclicked.length > 0 ? freshUnclicked : fresh.length > 0 ? fresh : all;

  const weights = sauces.map((_, i): number => {
    if (!candidates.includes(i)) {
      return 0;
    }
    return unclicked[i] ? UNCLICKED_WEIGHT : CLICKED_WEIGHT;
  });
  const total = weights.reduce((sum, w) => sum + w, 0);
  return weights.map((w) => w / total);
}

/** Maps `roll` in [0, 1) to an index, never returning one with probability 0. */
export function sampleIndex(probabilities: readonly number[], roll: number): number {
  let remaining = roll;
  let lastPossible = -1;
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] === 0) {
      continue;
    }
    lastPossible = i;
    remaining -= probabilities[i];
    if (remaining < 0) {
      return i;
    }
  }
  // Floating-point rounding can leave a sliver of the roll unaccounted for.
  return lastPossible;
}

export function advanceHistory(
  history: SpawnHistory,
  spawned: string,
  wasUnclicked: boolean,
): SpawnHistory {
  return {
    recent: [...history.recent, spawned].slice(-(UNIQUE_WINDOW - 1)),
    spawnsSinceUnclicked: wasUnclicked ? 0 : history.spawnsSinceUnclicked + 1,
  };
}

/** Holds the spawn history between calls; all the actual logic is in the functions above. */
export class SauceSpawner {
  private history = EMPTY_HISTORY;

  constructor(
    private readonly sauces: readonly string[],
    private readonly random: () => number = Math.random,
  ) {}

  /** `unclicked[i]` says whether `sauces[i]` is still unclicked right now. */
  next(unclicked: readonly boolean[]): string {
    const probabilities = spawnProbabilities(this.sauces, unclicked, this.history);
    const picked = sampleIndex(probabilities, this.random());
    this.history = advanceHistory(this.history, this.sauces[picked], unclicked[picked]);
    return this.sauces[picked];
  }
}
