import Phaser from 'phaser';
import { SAUCE_SOUNDS, sauceSoundKey } from '../sounds';
import { LEVEL_DURATION_MS, STARTING_LIVES } from './GameScene';

const RULES = [
  'Sósunöfn falla niður skjáinn.',
  'Smelltu á hverja sósu einu sinni til að fylla hringinn hennar.',
  'Ef þú smellir aftur á sósu sem þú hefur þegar náð missir þú líf.',
  `Þú hefur ${STARTING_LIVES} líf og ${LEVEL_DURATION_MS / 1000} sekúndur í hverju borði.`,
  'Náðu öllum sósunum til að komast á næsta borð.',
  'Ef þú tapar byrjar þú aftur á 1. borði.',
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load assets from public/assets here, e.g.:
    // this.load.image('player', 'assets/player.png');
    for (const [name, file] of Object.entries(SAUCE_SOUNDS)) {
      this.load.audio(sauceSoundKey(name), `assets/sounds/${file}`);
    }
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 160, 'Sauce Man', { fontSize: '80px', fontStyle: 'bold', color: '#ffcc00' })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 300, 'Reglur', { fontSize: '52px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5, 0);

    this.add.text(60, 400, RULES.map((rule) => `•  ${rule}`).join('\n\n'), {
      fontSize: '32px',
      color: '#ffffff',
      wordWrap: { width: width - 120 },
    });

    this.add
      .text(width / 2, height - 160, 'Smelltu til að byrja', { fontSize: '44px', color: '#ffcc00' })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('LevelIntro'));
  }
}
