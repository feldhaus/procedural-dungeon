import seedrandom from 'seedrandom';

export class Random {
  constructor(seed) {
    this.rng = seedrandom(seed);
  }

  randomInteger(min, max) {
    return Math.floor(this.rng() * (max - min + 1) + min);
  }

  randomPick(array) {
    return array[this.randomInteger(0, array.length - 1)];
  }
}
