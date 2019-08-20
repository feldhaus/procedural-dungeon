export const TILES = {
  EMPTY: 0,
  WALL: 1,
  FLOOR: 2,
  DOOR: 3,
};

export const TILE_MAPPING = {
  WALL: {
    TOP_LEFT: 0,
    TOP_RIGHT: 5,
    BOTTOM_LEFT: 40,
    BOTTOM_RIGHT: 45,
    TOP: [1, 2, 3, 4],
    LEFT: [10, 20, 30],
    RIGHT: [15, 25, 35],
    BOTTOM: [41, 42, 43, 44],
  },
  FLOOR: [6, 7, 8, 9, 16, 17, 18, 19, 26, 27, 27, 29],
};
