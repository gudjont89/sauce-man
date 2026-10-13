import '@fontsource/vt323/latin-400.css';
import Phaser from 'phaser';
import { FONT_FAMILY } from './font';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { LevelIntroScene } from './scenes/LevelIntroScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#1d1d2b',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.EXPAND,       // keeps 720x1280 visible, grows to fill the rest
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
},
  scene: [BootScene, LevelIntroScene, GameScene, ResultScene],
};

// Canvas text can't wait on font-display, so make sure VT323 is ready first.
export default document.fonts
  .load(`16px ${FONT_FAMILY}`)
  .catch(() => undefined)
  .then(() => new Phaser.Game(config));
