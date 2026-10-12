import Phaser from 'phaser';

const LEVEL_1_SAUCES = [
  'Tómatsósa',
  'Hamborgarasósa',
  'Pítusósa',
  'Majónes',
  'Kokteilsósa',
  'BBQ-sósa',
  'Pizzusósa',
];

const LEVEL_2_SAUCES = [
  'Tabasco-sósa',
  'Sinnep',
  'Salsa',
  'Remúlaði',
  'Sriracha-sósa',
  'Bearnaise-sósa',
  'Sojasósa',
  'Worcestershire-sósa',
  'Piri piri-sósa',
];

const LEVEL_3_SAUCES = [
  'Hvítlaukssósa',
  'Black garlic sósa',
  'Hunangssinnep',
  'Tahini',
  'Teriyaki-sósa',
  'Tzatziki-sósa',
  'Chilimajó',
  'Trufflumajó',
  'Satay-sósa',
  'Hoisinsósa',
  'Graflaxsósa',
];

type Level = {
  sauces: string[]; // every sauce in the array is used in the level
  fallSpeed: number; // pixels per second
};

export const LEVELS: Level[] = [
  { sauces: LEVEL_1_SAUCES, fallSpeed: 200 },
  { sauces: LEVEL_2_SAUCES, fallSpeed: 225 },
  { sauces: LEVEL_3_SAUCES, fallSpeed: 250 },
];

// Returns the level's sauces in a new random order each time it's called.
export function pickSaucesForLevel(level: number): string[] {
  return Phaser.Utils.Array.Shuffle([...LEVELS[level].sauces]);
}
