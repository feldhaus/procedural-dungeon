import * as PIXI from 'pixi.js';
import { Dungeon } from './dungeon.js';
import { TILES } from './tiles';
import dat from 'dat.GUI';

const config = {
  tileSize: 10,
  cols: 80,
  rows: 60,
  randomSeed: '',
  doorPadding: 1,
  roomColsMin: 5,
  roomColsMax: 10,
  roomRowsMin: 5,
  roomRowsMax: 10,
};

let app;
let graphics;

window.onload = function() {
  setupGUI();

  app = new PIXI.Application({ backgroundColor: 0x223843 });
  document.body.appendChild(app.view);

  graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  generateDungeon(config);
};

function generateDungeon(config = {}) {
  const dungeon = new Dungeon({
    cols: config.cols,
    rows: config.rows,
    randomSeed: config.randomSeed || null,
    doorPadding: config.doorPadding,
    rooms: {
      cols: { min: config.roomColsMin, max: config.roomColsMax },
      rows: { min: config.roomRowsMin, max: config.roomRowsMax },
      maxRooms: 50,
    },
  });

  graphics.clear();

  for (let row = 0; row < dungeon.rows; row++) {
    for (let col = 0; col < dungeon.cols; col++) {
      const tile = dungeon.tiles[row][col];
      if (tile === TILES.EMPTY) {
        continue;
      } else if (tile === TILES.WALL) {
        graphics.beginFill(0xd77a61);
      } else if (tile === TILES.FLOOR) {
        graphics.beginFill(0xd8b4a0);
      } else if (tile === TILES.DOOR) {
        graphics.beginFill(0xdbd3d8);
      }
      graphics.drawRect(
        col * config.tileSize,
        row * config.tileSize,
        config.tileSize,
        config.tileSize
      );
    }
  }
}

function setupGUI() {
  const gui = new dat.GUI();
  gui.add(config, 'tileSize').onFinishChange(() => generateDungeon(config));
  gui.add(config, 'cols').onFinishChange(() => generateDungeon(config));
  gui.add(config, 'rows').onFinishChange(() => generateDungeon(config));
  gui.add(config, 'randomSeed').onFinishChange(() => generateDungeon(config));
  gui.add(config, 'doorPadding').onFinishChange(() => generateDungeon(config));

  const rooms = gui.addFolder('Rooms');
  rooms
    .add(config, 'roomColsMin')
    .name('minCols')
    .onFinishChange(() => generateDungeon(config));
  rooms
    .add(config, 'roomColsMax')
    .name('maxCols')
    .onFinishChange(() => generateDungeon(config));
  rooms
    .add(config, 'roomRowsMin')
    .name('minRows')
    .onFinishChange(() => generateDungeon(config));
  rooms
    .add(config, 'roomRowsMax')
    .name('maxRows')
    .onFinishChange(() => generateDungeon(config));
}
