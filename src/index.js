import * as PIXI from 'pixi.js';
import { Dungeon } from './dungeon.js';
import { TILES } from './tiles';

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

const dungeon = new Dungeon({ cols: 80, rows: 60 });

for (let row = 0; row < dungeon.rows; row++) {
  for (let col = 0; col < dungeon.cols; col++) {
    const tile = dungeon.tiles[row][col];
    if (tile === TILES.EMPTY) {
      continue;
    } else if (tile === TILES.WALL) {
      graphics.beginFill(0xff0000);
    } else if (tile === TILES.FLOOR) {
      continue;
    } else if (tile === TILES.DOOR) {
      graphics.beginFill(0x0000ff);
    }
    graphics.drawRect(col * 10, row * 10, 10, 10);
  }
}
