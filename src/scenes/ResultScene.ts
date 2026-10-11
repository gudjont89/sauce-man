import Phaser from 'phaser';
import type { GameData, Outcome } from './GameScene';

type ResultData = {
  outcome: Outcome;
  score: number;
  total: number;
  level: number;
  hasNextLevel: boolean;
};

const HEADLINES: Record<Outcome, string> = {
  complete: 'Borð {level}',
  timeUp: 'Tíminn er búinn!',
  outOfLives: 'Engin líf eftir!',
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create({ outcome, score, total, level, hasNextLevel }: ResultData) {
    const { width, height } = this.scale;
    const won = outcome === 'complete';

    this.add
      .text(width / 2, height / 2 - 200, HEADLINES[outcome].replace('{level}', `${level + 1}`), {
        fontSize: '48px',
        color: won ? '#ffffff' : '#ff3333',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 80, `${score} / ${total}`, {
        fontSize: '140px',
        fontStyle: 'bold',
        color: '#ffcc00',
      })
      .setOrigin(0.5);

    let prompt = 'Smelltu til að spila aftur';
    let next: GameData = { level: 0 };
    if (!won) {
      prompt = 'Smelltu til að byrja upp á nýtt';
    } else if (hasNextLevel) {
      prompt = 'Smelltu til að halda áfram';
      next = { level: level + 1 };
    }

    this.add
      .text(width / 2, height / 2 + 80, prompt, {
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('LevelIntro', next));
  }
}
