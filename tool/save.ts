import { Chance } from 'chance';
import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import { PoissonDiskSampler } from '../src/game/map/poisson-disk';
import { RandomMap } from '../src/game/map/random';
import { simpleVisualize } from '../src/game/map/visualize';
import { Settings } from '../src/game/state/settings';

// npm run save <name.json> \
//   --initial-factories    \ -f \
//   --ship-speed-a-turn    \ -s \
//   --game-difficulty      \ -d \
//   --max-game-length      \ -l \
//   --display-level        \ -v \
//   --enable-novice-mode   \ -n \
//   --no-system-defenses   \
//   --no-random-events     \
//   --no-empire-builds
//   --seed
const args = minimist(process.argv, {
  '--': false,
  alias: {
    'initial-factories': 'f',
    'ship-speed-a-turn': 's',
    'game-difficulty': 'd',
    'max-game-length': 'l',
    'display-level': 'v',
    'enable-novice-mode': 'n',
    players: 'p',
  },
  boolean: [
    'enable-novice-mode',
    'system-defenses',
    'random-events',
    'empire-builds',
  ],
  default: {
    'initial-factories': 10,
    'ship-speed-a-turn': 4,
    'game-difficulty': 'easy',
    'max-game-length': 150,
    'display-level': 'combat-and-events',
    'enable-novice-mode': false,
    players: 4,
    'system-defenses': true,
    'random-events': true,
    'empire-builds': true,
  },
  string: ['game-difficulty', 'dislay-level'],
});

const settings: Settings = {
  initialFactories: args['initial-factories'],
  shipSpeedATurn: args['ship-speed-a-turn'],
  gameDifficulty: args['game-difficulty'],
  maxGameLength: args['max-game-length'],
  displayLevel: args['display-level'],
  enableNoviceMode: args['enable-novice-mode'],
  enableSystemDefenses: args['system-defenses'],
  enableRandomEvents: args['random-events'],
  enableEmpireBuilds: args['empire-builds'],
};

const seed = args['seed'] || new Chance().hash({ length: 15 });
const chance = new Chance(seed);
const sampler = new PoissonDiskSampler([50, 30], 4, undefined, chance);
const players = new Array(args['players'])
  .fill('')
  .map((_, i) => `PLAYER:${i + 1}`);
const map = new RandomMap(sampler, chance);
const output = map.generateMap(settings, players);

const visualize =
  output
    .filter((s) => s.state.home)
    .map((s) => `${s.state.owner}: ${s.state.name}`)
    .sort()
    .join('\n') +
  '\n' +
  simpleVisualize(output)
    .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
    .join('\n') +
  '\n';

const file = args._[2];

console.log('File', file || '<Not Specified>');
console.log('Players', players.length);
console.log('Seed', seed);
console.log('Settings', JSON.stringify(settings, undefined, 2));
console.log(visualize);

if (file) {
  fs.writeJsonSync(
    path.join('data', file),
    {
      seed: seed,
      systems: output.map((s) => s.state),
    },
    { spaces: 2 },
  );
}
