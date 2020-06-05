import { Chance } from 'chance';
import { PoissonDiskSampler } from '../src/game/map/poisson-disk';
import { RandomMap } from '../src/game/map/random';
import { simpleVisualize } from '../src/game/map/visualize';
import { defaultSettings } from '../src/game/state/settings';

const seed = new Chance().hash();
const chance = new Chance(seed);
const sampler = new PoissonDiskSampler([50, 30], 4, undefined, chance);
const map = new RandomMap(sampler, chance);
const output = map.generateMap(defaultSettings, []);
const visualize =
  '\n' +
  simpleVisualize(output)
    .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
    .join('\n') +
  '\n';

console.log('Seed', seed);
console.log(visualize);
