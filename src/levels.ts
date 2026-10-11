import Phaser from 'phaser';

export const SAUCES = [
  'Tómatsósa',
  'Hamborgarasósa',
  'Pítusósa',
  'Majónes',
  'Pizzusósa',
  'Trufflumajó',
  'Tabasco-sósa',
  'Sinnep',
  'BBQ-sósa',
  'Sriracha-sósa',
  'Satay-sósa'
  
];

type Level = {
  sauceCount: number; // picked at random from SAUCES
  fallSpeed: number; // pixels per second
};

export const LEVELS: Level[] = [
  { sauceCount: 7, fallSpeed: 200 },
  { sauceCount: 9, fallSpeed: 225 },
  { sauceCount: 11, fallSpeed: 250 },
];

// Returns a new random selection, in random order, each time it's called.
export function pickSaucesForLevel(level: number): string[] {
  return Phaser.Utils.Array.Shuffle([...SAUCES]).slice(0, LEVELS[level].sauceCount);
}
