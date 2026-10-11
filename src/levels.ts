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
  sauceCount: number; // taken from the start of SAUCES
  fallSpeed: number; // pixels per second
};

export const LEVELS: Level[] = [
  { sauceCount: 8, fallSpeed: 200 },
  { sauceCount: 11, fallSpeed: 250 },
];

export function saucesForLevel(level: number): string[] {
  return SAUCES.slice(0, LEVELS[level].sauceCount);
}
