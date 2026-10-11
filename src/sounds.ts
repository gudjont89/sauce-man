// Sound played when a sauce is clicked, keyed by sauce name.
// Files live in public/assets/sounds/. Sauces without an entry, or whose file
// is missing, are silent.
export const SAUCE_SOUNDS: Record<string, string> = {
  'Tómatsósa': 'tomatsosa.m4a',
  'Hamborgarasósa': 'hamborgarasosa.m4a',
  'Pítusósa': 'pitusosa.m4a',
  'Majónes': 'majones.m4a',
  'Pizzusósa': 'pizzusosa.m4a',
  'Trufflumajó': 'trufflumajo.m4a',
  'Tabasco-sósa': 'tabasco-sosa.m4a',
  'Sinnep': 'sinnep.m4a',
  'BBQ-sósa': 'bbq-sosa.m4a',
  'Sriracha-sósa': 'sriracha-sosa.m4a',
  'Satay-sósa': 'satay-sosa.m4a',
};

export function sauceSoundKey(name: string): string {
  return `sauce:${name}`;
}
