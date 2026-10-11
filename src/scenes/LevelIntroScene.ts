import Phaser from 'phaser';
import { saucesForLevel } from '../levels';
import type { GameData } from './GameScene';

const TITLE_DELAY_MS = 500;
const FIRST_SAUCE_DELAY_MS = 500;
const SAUCE_INTERVAL_MS = 250;
const START_DELAY_MS = 3000;

const TITLE_Y = 140;
const LIST_TOP = 280;
const LIST_SPACING = 70;

export class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super('LevelIntro');
  }

  create({ level = 0 }: GameData = {}) {
    const { width } = this.scale;
    const sauces = saucesForLevel(level);

    this.time.delayedCall(TITLE_DELAY_MS, () => {
      this.add
        .text(width / 2, TITLE_Y, `${level + 1}. borð`, {
          fontSize: '80px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);
    });

    const firstSauceAt = TITLE_DELAY_MS + FIRST_SAUCE_DELAY_MS;
    sauces.forEach((name, i) => {
      this.time.delayedCall(firstSauceAt + i * SAUCE_INTERVAL_MS, () => {
        this.add
          .text(width / 2, LIST_TOP + i * LIST_SPACING, name, {
            fontSize: '44px',
            fontStyle: 'bold',
            color: '#ffcc00',
          })
          .setOrigin(0.5);
      });
    });

    const lastSauceAt = firstSauceAt + (sauces.length - 1) * SAUCE_INTERVAL_MS;
    this.time.delayedCall(lastSauceAt + START_DELAY_MS, () => {
      this.scene.start('Game', { level });
    });
  }
}
