import * as PIXI from 'pixi.js';
import { Dungeon } from './dungeon.js';
import { TILES, TILE_MAPPING } from './tiles';
import dat from 'dat.GUI';

const config = {
  tileSize: 20,
  cols: 40,
  rows: 30,
  randomSeed: '0',
  doorPadding: 2,
  roomColsMin: 5,
  roomColsMax: 10,
  roomRowsMin: 5,
  roomRowsMax: 10,
  tilemap: false,
};

const app = new PIXI.Application({ backgroundColor: 0x223843 });
const graphics = new PIXI.Graphics();
const container = new PIXI.Container();
const size = new PIXI.Point(0, 0);

window.onload = () => {
  const loader = PIXI.Loader.shared;
  loader.add('assets/tilesets/dungeon_tileset.json').load(() => {
    setupGUI();

    document.body.appendChild(app.view);
    app.stage.addChild(graphics);
    app.stage.addChild(container);

    generateDungeon(config);
  });
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

  size.set(dungeon.cols, dungeon.rows);

  graphics.clear();
  container.removeChild(...container.children);

  if (config.tilemap) {
    drawDungeonTiles(dungeon, config.tileSize);
  } else {
    drawDungeon(dungeon, config.tileSize);
  }
}

function drawDungeon(dungeon, tileSize) {
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
      graphics.drawRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

function drawDungeonTiles(dungeon, tileSize) {
  container.removeChild(...container.children);

  for (let row = 0; row < dungeon.rows; row++) {
    for (let col = 0; col < dungeon.cols; col++) {
      const tile = PIXI.Sprite.from('tile078.png');
      container.addChild(tile);
      tile.width = tileSize;
      tile.height = tileSize;
      tile.anchor.set(0);
      tile.position.set(col * tileSize, row * tileSize);
    }
  }

  dungeon.rooms.forEach(room => {
    const { col, row, cols, rows, left, right, top, bottom } = room;

    // walls
    putTileAt(TILE_MAPPING.WALL.TOP_LEFT, left, top);
    putTileAt(TILE_MAPPING.WALL.TOP_RIGHT, right, top);
    putTileAt(TILE_MAPPING.WALL.BOTTOM_LEFT, left, bottom);
    putTileAt(TILE_MAPPING.WALL.BOTTOM_RIGHT, right, bottom);
    fillTiles(TILE_MAPPING.WALL.TOP, left + 1, top, cols - 2, 1);
    fillTiles(TILE_MAPPING.WALL.BOTTOM, left + 1, bottom, cols - 2, 1);
    fillTiles(TILE_MAPPING.WALL.LEFT, left, top + 1, 1, rows - 2);
    fillTiles(TILE_MAPPING.WALL.RIGHT, right, top + 1, 1, rows - 2);

    // floors
    fillTiles(TILE_MAPPING.FLOOR, col + 1, row + 1, cols - 2, rows - 2);

    // doors
    const doors = room.getDoorLocations();
    for (let i = 0; i < doors.length; i++) {
      if (doors[i].row === 0) {
        putTileAt(6, col + doors[i].col, row + doors[i].row);
      } else if (doors[i].row === room.rows - 1) {
        putTileAt(53, col + doors[i].col - 1, row + doors[i].row);
        putTileAt(6, col + doors[i].col, row + doors[i].row);
        putTileAt(50, col + doors[i].col + 1, row + doors[i].row);
      } else if (doors[i].col === 0) {
        putTileAt(1, col + doors[i].col, row + doors[i].row - 1);
        putTileAt(6, col + doors[i].col, row + doors[i].row);
        putTileAt(53, col + doors[i].col, row + doors[i].row + 1);
      } else if (doors[i].col === room.cols - 1) {
        putTileAt(1, col + doors[i].col, row + doors[i].row - 1);
        putTileAt(6, col + doors[i].col, row + doors[i].row);
        putTileAt(50, col + doors[i].col, row + doors[i].row + 1);
      }
    }
  });
}

function putTileAt(value, col, row) {
  const id = value.toString().padStart(3, '0');
  container.children[col + row * size.x].texture = PIXI.Texture.from(`tile${id}.png`);
}

function fillTiles(values, startCol, startRow, cols, rows, ) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      putTileAt(
        values[Math.floor(Math.random() * values.length)],
        startCol + col,
        startRow + row
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
  gui.add(config, 'tilemap').onFinishChange(() => generateDungeon(config));

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
