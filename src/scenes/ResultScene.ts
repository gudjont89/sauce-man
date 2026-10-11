import Phaser from 'phaser';

type ResultData = { score: number; total: number };

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create({ score, total }: ResultData) {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 80, `${score} / ${total}`, {
        fontSize: '140px',
        fontStyle: 'bold',
        color: '#ffcc00',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 80, 'Smelltu til að spila aftur', {
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Game'));
  }
}
