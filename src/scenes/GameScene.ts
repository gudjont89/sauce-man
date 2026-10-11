import Phaser from 'phaser';

const SAUCES = [
  'Tómatsósa',
  'Hamborgarasósa',
  'Pítusósa',
  'Majónes',
  'Pizzusósa',
  'Trufflumajó',
  'Tabasco-sósa',
  'Sinnep',
];

const SPAWN_INTERVAL_MS = 1200;
const FALL_SPEED_MIN = 220;
const FALL_SPEED_MAX = 220;
const FLASH_DURATION_MS = 250;
const SCORE_BAR_HEIGHT = 120;
const SCORE_BAR_DEPTH = 100;

type FallingSauce = { text: Phaser.GameObjects.Text; speed: number };
type CircleState = 'empty' | 'filled' | 'crossed';

export class GameScene extends Phaser.Scene {
  private sauces: FallingSauce[] = [];
  private circleStates: CircleState[] = [];
  private scoreBar!: Phaser.GameObjects.Graphics;
  private finished = false;

  constructor() {
    super('Game');
  }

  create() {
    this.sauces = [];
    this.circleStates = SAUCES.map(() => 'empty');
    this.finished = false;
    this.scoreBar = this.add.graphics().setDepth(SCORE_BAR_DEPTH);
    this.drawScoreBar();

    this.time.addEvent({
      delay: SPAWN_INTERVAL_MS,
      loop: true,
      callback: this.spawnSauce,
      callbackScope: this,
    });
    this.spawnSauce();
  }

  update(_time: number, delta: number) {
    const bottom = this.scale.height - SCORE_BAR_HEIGHT;
    const seconds = delta / 1000;

    this.sauces = this.sauces.filter((sauce) => {
      sauce.text.y += sauce.speed * seconds;
      if (sauce.text.y - sauce.text.height > bottom) {
        sauce.text.destroy();
        return false;
      }
      return true;
    });
  }

  private spawnSauce() {
    const name = Phaser.Utils.Array.GetRandom(SAUCES);
    const text = this.add
      .text(0, 0, name, { fontSize: '44px', fontStyle: 'bold', color: '#ffcc00' })
      .setOrigin(0.5, 1);

    const halfWidth = text.width / 2;
    text.x = Phaser.Math.Between(halfWidth, Math.max(halfWidth, this.scale.width - halfWidth));

    const sauce: FallingSauce = {
      text,
      speed: Phaser.Math.Between(FALL_SPEED_MIN, FALL_SPEED_MAX),
    };
    this.sauces.push(sauce);

    text.setInteractive({ useHandCursor: true });
    text.on('pointerdown', () => this.catchSauce(sauce));
  }

  private catchSauce(sauce: FallingSauce) {
    if (this.finished) {
      return;
    }
    this.sauces = this.sauces.filter((s) => s !== sauce);
    const name = sauce.text.text;
    sauce.text.destroy();
    this.flash(name);
    this.markCircle(SAUCES.indexOf(name));
  }

  private markCircle(index: number) {
    const state = this.circleStates[index];
    if (state === 'empty') {
      this.circleStates[index] = 'filled';
    } else if (state === 'filled') {
      this.circleStates[index] = 'crossed';
    }
    this.drawScoreBar();

    if (this.circleStates.every((s) => s !== 'empty')) {
      this.finished = true;
      const score = this.circleStates.filter((s) => s === 'filled').length;
      this.time.delayedCall(FLASH_DURATION_MS, () => {
        this.scene.start('Result', { score, total: SAUCES.length });
      });
    }
  }

  private drawScoreBar() {
    const { width, height } = this.scale;
    const top = height - SCORE_BAR_HEIGHT;
    const spacing = width / SAUCES.length;
    const radius = Math.min(spacing * 0.35, SCORE_BAR_HEIGHT * 0.3);
    const centerY = top + SCORE_BAR_HEIGHT / 2;
    const g = this.scoreBar;

    g.clear();
    g.fillStyle(0x111118);
    g.fillRect(0, top, width, SCORE_BAR_HEIGHT);

    this.circleStates.forEach((state, i) => {
      const x = spacing * (i + 0.5);
      if (state !== 'empty') {
        g.fillStyle(0xffcc00);
        g.fillCircle(x, centerY, radius);
      }
      g.lineStyle(4, 0xffcc00);
      g.strokeCircle(x, centerY, radius);

      if (state === 'crossed') {
        const d = radius * 0.9;
        g.lineStyle(6, 0xff3333);
        g.lineBetween(x - d, centerY - d, x + d, centerY + d);
        g.lineBetween(x - d, centerY + d, x + d, centerY - d);
      }
    });
  }

  private flash(name: string) {
    const { width, height } = this.scale;

    const background = this.add
      .rectangle(0, 0, width, height, 0xffffff)
      .setOrigin(0)
      .setDepth(1000);
    const label = this.add
      .text(width / 2, height / 2, name, { fontSize: '120px', fontStyle: 'bold', color: '#000000' })
      .setOrigin(0.5)
      .setDepth(1001);

    const maxWidth = width * 0.9;
    if (label.width > maxWidth) {
      label.setScale(maxWidth / label.width);
    }

    this.time.delayedCall(FLASH_DURATION_MS, () => {
      background.destroy();
      label.destroy();
    });
  }
}
