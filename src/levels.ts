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

// Number of sauces (taken from the start of SAUCES) in each level.
export const LEVEL_SAUCE_COUNTS = [8, 11];

export function saucesForLevel(level: number): string[] {
  return SAUCES.slice(0, LEVEL_SAUCE_COUNTS[level]);
}
