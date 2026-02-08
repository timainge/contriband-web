// Built-in sprite patterns for stamp mode
// Each sprite is a 2D array of intensity levels (0-4)

import { ref } from 'vue';

export interface Sprite {
  name: string;
  grid: number[][];
  width: number;
  height: number;
}

// Module-level selected sprite (shared singleton)
export const selectedSprite = ref<Sprite | null>(null);

function parse(rows: string[]): number[][] {
  return rows.map(row => [...row].map(c => {
    if (c >= '1' && c <= '4') return parseInt(c);
    if (c === '#') return 4;
    return 0;
  }));
}

export const SPRITES: Sprite[] = [
  {
    name: 'Heart',
    width: 5,
    height: 7,
    grid: parse([
      '.#.#.',
      '#####',
      '#####',
      '.###.',
      '.###.',
      '..#..',
      '.....',
    ]),
  },
  {
    name: 'Star',
    width: 5,
    height: 7,
    grid: parse([
      '..#..',
      '.###.',
      '#####',
      '.###.',
      '.#.#.',
      '#...#',
      '.....',
    ]),
  },
  {
    name: 'Diamond',
    width: 5,
    height: 7,
    grid: parse([
      '..#..',
      '.###.',
      '#####',
      '#####',
      '.###.',
      '..#..',
      '.....',
    ]),
  },
  {
    name: 'Arrow R',
    width: 5,
    height: 7,
    grid: parse([
      '..#..',
      '...#.',
      '#####',
      '#####',
      '#####',
      '...#.',
      '..#..',
    ]),
  },
  {
    name: 'Arrow L',
    width: 5,
    height: 7,
    grid: parse([
      '..#..',
      '.#...',
      '#####',
      '#####',
      '#####',
      '.#...',
      '..#..',
    ]),
  },
  {
    name: 'Dino',
    width: 11,
    height: 7,
    grid: parse([
      '....33..32.',
      '...3443.3..',
      '.22.344432.',
      '.234444432.',
      '2233.2342..',
      '.22..233...',
      '2.2..22....',
    ]),
  },
  {
    name: 'Invader',
    width: 9,
    height: 7,
    grid: parse([
      '.3.....3.',
      '..3...3..',
      '..34343..',
      '.33.3.33.',
      '343434343',
      '3.3...3.3',
      '..33.33..',
    ]),
  },
  {
    name: 'Fish',
    width: 9,
    height: 7,
    grid: parse([
      '.........',
      '.2..233..',
      '22.23443.',
      '.2234.432',
      '22.23443.',
      '.2..233..',
      '.........',
    ]),
  },
  {
    name: 'Whale',
    width: 11,
    height: 7,
    grid: parse([
      '22.........',
      '.22.23332..',
      '..2234443..',
      '..2234.4432',
      '..2234443..',
      '.22.23332..',
      '22.........',
    ]),
  },
  {
    name: 'UFO',
    width: 11,
    height: 7,
    grid: parse([
      '....222....',
      '...23332...',
      '..2234322..',
      '34343434343',
      '.233333332.',
      '..2.2.2.2..',
      '...........',
    ]),
  },
];
