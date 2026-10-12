import Phaser from 'phaser';
import { SAUCE_SOUNDS, sauceSoundKey } from '../sounds';

const LINE_DELAY_MS = 1000;

const PAGES = [
  [
    'Veturinn 2015 til 2016 drýgði Jóhann Alfreð Kristinsson sannkallaða hetjudáð, þegar hann mætti vikulega í Þjóðleikhúskjallarann til þess að telja upp sósur.',
    'Markmið hans var göfugt: að telja upp allar sósur sem notaðar eru í íslenskum eldhúsum.',
    'Því miður lést Jóhann Alfreð á sviðinu föstudagskvöldið 27. mars árið 2017, áður en verkið var fullunnið.',
  ],
  [
    'Þessi leikur er tileinkaður minningu Jóhanns Alfreðs.',
    'Getur þú lokið verkefni hans og talið upp allar sósur á Íslandi fyrir framan stappfullan og æstan Þjóðleikhúskjallara?',
  ],
  [
    'Verkefni þitt er einfalt en erfitt: teldu upp allar sósurnar, en aðeins einu sinni hverja',
    'Fleiri sósur bætast við í hverju borði',
  ],
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

    const body = this.add.text(60, 320, '', {
      fontSize: '36px',
      color: '#ffffff',
      wordWrap: { width: width - 120 },
    });

    const prompt = this.add
      .text(width / 2, height - 160, '', { fontSize: '44px', color: '#ffcc00' })
      .setOrigin(0.5)
      .setVisible(false);

    let page = 0;
    let shownLines = 0;
    let lineTimer: Phaser.Time.TimerEvent | undefined;

    const render = () => {
      body.setText(PAGES[page].slice(0, shownLines).join('\n\n'));
      if (shownLines === PAGES[page].length) {
        lineTimer?.remove();
        prompt.setText(page === PAGES.length - 1 ? 'Smelltu til að byrja' : 'Smelltu til að halda áfram');
        prompt.setVisible(true);
      }
    };

    const startPage = () => {
      prompt.setVisible(false);
      shownLines = 1;
      render();
      lineTimer = this.time.addEvent({
        delay: LINE_DELAY_MS,
        repeat: PAGES[page].length - 2,
        callback: () => {
          shownLines++;
          render();
        },
      });
    };

    this.input.on('pointerdown', () => {
      if (shownLines < PAGES[page].length) {
        shownLines = PAGES[page].length;
        render();
      } else if (page < PAGES.length - 1) {
        page++;
        startPage();
      } else {
        this.scene.start('LevelIntro');
      }
    });

    startPage();
  }
}
