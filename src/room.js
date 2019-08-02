import { TILES } from './tiles.js';

export class Room {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;

    this.setPosition(0, 0);

    this.doors = [];
    this.tiles = [];

    // surround the room with walls, and fill the rest with floors
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        if (y === 0 || y === this.rows - 1 || x === 0 || x === this.cols - 1) {
          row.push(TILES.WALL);
        } else {
          row.push(TILES.FLOOR);
        }
      }
      this.tiles.push(row);
    }
  }

  setPosition(col, row) {
    this.col = col;
    this.row = row;
    this.left = col;
    this.right = col + this.cols - 1;
    this.top = row;
    this.bottom = row + this.rows - 1;
    this.centerX = col + Math.floor(this.cols / 2);
    this.centerY = row + Math.floor(this.rows / 2);
  }

  getDoorLocations() {
    const doors = [];

    // find all the doors and add their positions to the list
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col] === TILES.DOOR) {
          doors.push({ col: col, row: row });
        }
      }
    }

    return doors;
  }

  overlaps(otherRoom) {
    if (this.right < otherRoom.left) return false;
    else if (this.left > otherRoom.right) return false;
    else if (this.bottom < otherRoom.top) return false;
    else if (this.top > otherRoom.bottom) return false;
    else return true;
  }
}
