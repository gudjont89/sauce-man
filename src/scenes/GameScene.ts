import Phaser from 'phaser';
import { LEVELS, pickSaucesForLevel } from '../levels';
import { sauceSoundKey } from '../sounds';

const SPAWN_INTERVAL_MS = 1200;
const FLASH_DURATION_MS = 300;
const SCORE_BAR_HEIGHT = 120;
const SCORE_BAR_DEPTH = 100;
const TOP_BAR_HEIGHT = 100;
export const STARTING_LIVES = 3;
export const LEVEL_DURATION_MS = 60_000;
// Relative chance of a sauce being picked to fall, depending on whether it has been clicked.
const UNCLICKED_WEIGHT = 2;
const CLICKED_WEIGHT = 1;
// At least every 4th spawned sauce must be an unclicked one.
const MAX_SPAWNS_WITHOUT_UNCLICKED = 3;
// Any run of this many successive spawns must contain no repeats.
const UNIQUE_WINDOW = 3;

type FallingSauce = { text: Phaser.GameObjects.Text };
type CircleState = 'empty' | 'filled' | 'crossed';
export type GameData = { level?: number; sauces?: string[] };
export type Outcome = 'complete' | 'timeUp' | 'outOfLives';

export class GameScene extends Phaser.Scene {
  private sauces: FallingSauce[] = [];
  private circleStates: CircleState[] = [];
  private scoreBar!: Phaser.GameObjects.Graphics;
  private finished = false;
  private level = 0;
  private levelSauces: string[] = [];
  private recentSauces: string[] = [];
  private spawnsSinceUnclicked = 0;
  private lives = STARTING_LIVES;
  private remainingMs = LEVEL_DURATION_MS;
  private livesDisplay!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create({ level = 0, sauces }: GameData = {}) {
    this.level = level;
    this.levelSauces = sauces ?? pickSaucesForLevel(level);
    this.sauces = [];
    this.recentSauces = [];
    this.spawnsSinceUnclicked = 0;
    this.circleStates = this.levelSauces.map(() => 'empty');
    this.finished = false;
    this.lives = STARTING_LIVES;
    this.remainingMs = LEVEL_DURATION_MS;
    this.scoreBar = this.add.graphics().setDepth(SCORE_BAR_DEPTH);
    this.drawScoreBar();
    this.createTopBar();

    // Stop clicks on the bars from catching sauces hidden behind them.
    const { width, height } = this.scale;
    this.blockInput(0, TOP_BAR_HEIGHT, width);
    this.blockInput(height - SCORE_BAR_HEIGHT, SCORE_BAR_HEIGHT, width);

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

    if (!this.finished) {
      this.remainingMs = Math.max(0, this.remainingMs - delta);
      this.timerText.setText(`${Math.ceil(this.remainingMs / 1000)} s`);
      if (this.remainingMs === 0) {
        this.endLevel('timeUp');
      }
    }

    this.sauces = this.sauces.filter((sauce) => {
      sauce.text.y += LEVELS[this.level].fallSpeed * seconds;
      if (sauce.text.y - sauce.text.height > bottom) {
        sauce.text.destroy();
        return false;
      }
      return true;
    });
  }

  private spawnSauce() {
    const name = this.pickSauceToSpawn();
    const text = this.add
      .text(0, 0, name, { fontSize: '44px', fontStyle: 'bold', color: '#ffcc00' })
      .setOrigin(0.5, 1);
    text.y = TOP_BAR_HEIGHT;

    const halfWidth = text.width / 2;
    text.x = Phaser.Math.Between(halfWidth, Math.max(halfWidth, this.scale.width - halfWidth));

    const sauce: FallingSauce = { text };
    this.sauces.push(sauce);

    text.setInteractive({ useHandCursor: true });
    text.on('pointerdown', () => this.catchSauce(sauce));
  }

  private pickSauceToSpawn(): string {
    const mustBeUnclicked = this.spawnsSinceUnclicked >= MAX_SPAWNS_WITHOUT_UNCLICKED;
    const all = this.levelSauces.map((_, i) => i);
    const fresh = all.filter((i) => !this.recentSauces.includes(this.levelSauces[i]));
    const unclicked = fresh.filter((i) => this.circleStates[i] === 'empty');

    // Uniqueness wins over the unclicked rule if the two can't both be met (e.g. fewer than 3 sauces).
    const candidates =
      mustBeUnclicked && unclicked.length > 0 ? unclicked : fresh.length > 0 ? fresh : all;

    const weights = candidates.map((i) =>
      this.circleStates[i] === 'empty' ? UNCLICKED_WEIGHT : CLICKED_WEIGHT,
    );
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    let picked = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i++) {
      roll -= weights[i];
      if (roll < 0) {
        picked = candidates[i];
        break;
      }
    }

    this.spawnsSinceUnclicked = this.circleStates[picked] === 'empty' ? 0 : this.spawnsSinceUnclicked + 1;
    this.recentSauces.push(this.levelSauces[picked]);
    if (this.recentSauces.length > UNIQUE_WINDOW - 1) {
      this.recentSauces.shift();
    }
    return this.levelSauces[picked];
  }

  private catchSauce(sauce: FallingSauce) {
    if (this.finished) {
      return;
    }
    this.sauces = this.sauces.filter((s) => s !== sauce);
    const name = sauce.text.text;
    sauce.text.destroy();
    this.flash(name);
    this.playSauceSound(name);
    this.markCircle(this.levelSauces.indexOf(name));
  }

  private playSauceSound(name: string) {
    const key = sauceSoundKey(name);
    if (this.cache.audio.exists(key)) {
      this.sound.play(key);
    }
  }

  private markCircle(index: number) {
    const state = this.circleStates[index];
    if (state === 'empty') {
      this.circleStates[index] = 'filled';
    } else if (state === 'filled') {
      this.circleStates[index] = 'crossed';
      this.lives -= 1;
      this.drawLives();
    }
    this.drawScoreBar();

    if (this.lives === 0) {
      this.endLevel('outOfLives');
    } else if (this.circleStates.every((s) => s !== 'empty')) {
      this.endLevel('complete');
    }
  }

  private endLevel(outcome: Outcome) {
    this.finished = true;
    // A sauce earns its point on the first click; a later cross doesn't take it away.
    const score = this.circleStates.filter((s) => s !== 'empty').length;
    this.time.delayedCall(FLASH_DURATION_MS, () => {
      this.scene.start('Result', {
        outcome,
        score,
        total: this.levelSauces.length,
        level: this.level,
        hasNextLevel: this.level + 1 < LEVELS.length,
      });
    });
  }

  private blockInput(y: number, height: number, width: number) {
    this.add.zone(0, y, width, height).setOrigin(0).setDepth(SCORE_BAR_DEPTH).setInteractive();
  }

  private createTopBar() {
    const { width } = this.scale;
    this.add
      .rectangle(0, 0, width, TOP_BAR_HEIGHT, 0x111118)
      .setOrigin(0)
      .setDepth(SCORE_BAR_DEPTH);
    this.livesDisplay = this.add.graphics().setDepth(SCORE_BAR_DEPTH);
    this.drawLives();
    this.timerText = this.add
      .text(width - 30, TOP_BAR_HEIGHT / 2, '', { fontSize: '44px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(1, 0.5)
      .setDepth(SCORE_BAR_DEPTH);
  }

  private drawLives() {
    const size = 50;
    const gap = 20;
    const top = (TOP_BAR_HEIGHT - size) / 2;
    const g = this.livesDisplay;

    g.clear();
    for (let i = 0; i < STARTING_LIVES; i++) {
      const left = 30 + i * (size + gap);
      const points = [
        new Phaser.Math.Vector2(left + size / 2, top),
        new Phaser.Math.Vector2(left + size, top + size),
        new Phaser.Math.Vector2(left, top + size),
      ];
      if (i < this.lives) {
        g.fillStyle(0xff3333);
        g.fillPoints(points, true);
      }
      g.lineStyle(4, 0xff3333);
      g.strokePoints(points, true);
    }
  }

  private drawScoreBar() {
    const { width, height } = this.scale;
    const top = height - SCORE_BAR_HEIGHT;
    const spacing = width / this.levelSauces.length;
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
