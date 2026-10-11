import Phaser from 'phaser';
import { SAUCE_SOUNDS, sauceSoundKey } from '../sounds';

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
    this.scene.start('LevelIntro');
  }
}
