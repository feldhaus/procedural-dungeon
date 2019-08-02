import { Random } from './random.js';
import { Room } from './Room.js';
import { TILES } from './tiles.js';

const defaultConfig = {
  cols: 40,
  rows: 40,
  randomSeed: undefined,
  doorPadding: 1,
  rooms: {
    cols: { min: 5, max: 10 },
    rows: { min: 5, max: 10 },
    maxArea: 150,
    maxRooms: 50,
  },
};

export class Dungeon {
  constructor(config = {}) {
    const rooms = config.rooms || {};
    rooms.cols = Object.assign({}, defaultConfig.rooms.cols, rooms.cols);
    rooms.rows = Object.assign({}, defaultConfig.rooms.rows, rooms.rows);
    rooms.maxArea = rooms.maxArea || defaultConfig.rooms.maxArea;
    rooms.maxRooms = rooms.maxRooms || defaultConfig.rooms.maxRooms;

    // validate room size
    if (rooms.cols.min < 3) rooms.cols.min = 3;
    if (rooms.rows.min < 3) rooms.rows.min = 3;
    if (rooms.cols.max < rooms.cols.min) rooms.cols.max = rooms.cols.min;
    if (rooms.rows.max < rooms.rows.min) rooms.rows.max = rooms.rows.min;

    // avoid an impossibly small maxArea
    const minArea = rooms.cols.min * rooms.rows.min;
    if (rooms.maxArea < minArea) rooms.maxArea = minArea;

    this.doorPadding = config.doorPadding || defaultConfig.doorPadding;
    this.cols = config.cols || defaultConfig.cols;
    this.rows = config.rows || defaultConfig.rows;
    this.roomConfig = rooms;
    this.rooms = [];
    this.random = new Random(config.randomSeed);

    this.roomGrid = [];

    this.generate();
    this.tiles = this.getTiles();
  }

  generate() {
    this.rooms = [];
    this.roomGrid = [];

    for (let row = 0; row < this.rows; row++) {
      this.roomGrid.push([]);
      for (let col = 0; col < this.cols; col++) {
        this.roomGrid[row].push([]);
      }
    }

    // seed the map with a starting randomly sized room in the center of the map
    const room = this.createRandomRoom();
    room.setPosition(
      Math.floor(this.cols / 2) - Math.floor(room.cols / 2),
      Math.floor(this.rows / 2) - Math.floor(room.rows / 2)
    );
    this.addRoom(room);

    // continue generating rooms until we hit our cap or have hit our maximum iterations
    // (generally due to not being able to fit any more rooms in the map)
    let i = this.roomConfig.maxRooms * 5;
    while (this.rooms.length < this.roomConfig.maxRooms && i > 0) {
      this.generateRoom();
      i -= 1;
    }
  }

  addRoom(room) {
    // if the room won't fit, we don't add it
    if (!this.canFitRoom(room)) return false;

    this.rooms.push(room);

    // update all tiles in the roomGrid to indicate that this room is sitting on them
    for (let row = room.top; row <= room.bottom; row++) {
      for (let col = room.left; col <= room.right; col++) {
        this.roomGrid[row][col].push(room);
      }
    }

    return true;
  }

  canFitRoom(room) {
    // make sure the room fits inside the dungeon
    if (room.col < 0 || room.col + room.cols > this.cols - 1) return false;
    if (room.row < 0 || room.row + room.rows > this.rows - 1) return false;

    // make sure this room doesn't intersect any existing rooms
    for (let i = 0; i < this.rooms.length; i++) {
      if (room.overlaps(this.rooms[i])) return false;
    }

    return true;
  }

  createRandomRoom() {
    let cols = 0;
    let rows = 0;
    let area = 0;

    // find cols and rows using min/max sizes while keeping under the maximum area
    const config = this.roomConfig;
    do {
      cols = this.random.randomInteger(config.cols.min, config.cols.max);
      rows = this.random.randomInteger(config.rows.min, config.rows.max);
      area = cols * rows;
    } while (area > config.maxArea);

    return new Room(cols, rows);
  }

  generateRoom() {
    const room = this.createRandomRoom();

    // only allow 150 tries at placing the room
    let i = 150;
    while (i > 0) {
      // attempt to find another room to attach this one to
      const result = this.findRoomAttachment(room);

      room.setPosition(result.col, result.row);

      // try to add it. If successful, add the door between the rooms and break the loop.
      if (this.addRoom(room)) {
        const [door1, door2] = this.findNewDoorLocation(room, result.target);
        this.addDoor(door1);
        this.addDoor(door2);
        break;
      }

      i -= 1;
    }
  }

  getTiles() {
    // create the full map for the whole dungeon
    const tiles = Array(this.rows);
    for (let row = 0; row < this.rows; row++) {
      tiles[row] = Array(this.cols);
      for (let col = 0; col < this.cols; col++) {
        tiles[row][col] = TILES.EMPTY;
      }
    }

    // fill in the map with details from each room
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      for (let row = 0; row < room.rows; row++) {
        for (let col = 0; col < room.cols; col++) {
          tiles[row + room.row][col + room.col] = room.tiles[row][col];
        }
      }
    }

    return tiles;
  }

  findNewDoorLocation(room1, room2) {
    const door1 = { col: -1, row: -1 };
    const door2 = { col: -1, row: -1 };

    if (room1.row === room2.row - room1.rows) {
      // North
      door1.col = door2.col = this.random.randomInteger(
        Math.floor(Math.max(room2.left, room1.left) + this.doorPadding),
        Math.floor(Math.min(room2.right, room1.right) - this.doorPadding)
      );
      door1.row = room1.row + room1.rows - 1;
      door2.row = room2.row;
    } else if (room1.col == room2.col - room1.cols) {
      // West
      door1.col = room1.col + room1.cols - 1;
      door2.col = room2.col;
      door1.row = door2.row = this.random.randomInteger(
        Math.floor(Math.max(room2.top, room1.top) + this.doorPadding),
        Math.floor(Math.min(room2.bottom, room1.bottom) - this.doorPadding)
      );
    } else if (room1.col == room2.col + room2.cols) {
      // East
      door1.col = room1.col;
      door2.col = room2.col + room2.cols - 1;
      door1.row = door2.row = this.random.randomInteger(
        Math.floor(Math.max(room2.top, room1.top) + this.doorPadding),
        Math.floor(Math.min(room2.bottom, room1.bottom) - this.doorPadding)
      );
    } else if (room1.row == room2.row + room2.rows) {
      // South
      door1.col = door2.col = this.random.randomInteger(
        Math.floor(Math.max(room2.left, room1.left) + this.doorPadding),
        Math.floor(Math.min(room2.right, room1.right) - this.doorPadding)
      );
      door1.row = room1.row;
      door2.row = room2.row + room2.rows - 1;
    }

    return [door1, door2];
  }

  findRoomAttachment(room) {
    const target = this.random.randomPick(this.rooms);

    let col = 0;
    let row = 0;
    let pad = 2 * this.doorPadding; // 2x padding to account for the padding both rooms need

    // randomly position this room on one of the sides of the random room.
    switch (this.random.randomInteger(0, 3)) {
      // north
      case 0:
        col = this.random.randomInteger(
          target.left - (room.cols - 1) + pad,
          target.right - pad
        );
        row = target.top - room.rows;
        break;
      // west
      case 1:
        col = target.left - room.cols;
        row = this.random.randomInteger(
          target.top - (room.rows - 1) + pad,
          target.bottom - pad
        );
        break;
      // east
      case 2:
        col = target.right + 1;
        row = this.random.randomInteger(
          target.top - (room.rows - 1) + pad,
          target.bottom - pad
        );
        break;
      // south
      case 3:
        col = this.random.randomInteger(
          target.left - (room.cols - 1) + pad,
          target.right - pad
        );
        row = target.bottom + 1;
        break;
    }

    // return the position for this new room and the target room
    return {
      col: col,
      row: row,
      target: target,
    };
  }

  addDoor(doorPos) {
    // get all the rooms at the location of the door
    const rooms = this.roomGrid[doorPos.row][doorPos.col];
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];

      // convert the door position from world space to room space
      const col = doorPos.col - room.col;
      const row = doorPos.row - room.row;

      // set the tile to be a door
      room.tiles[row][col] = TILES.DOOR;
    }
  }
}
