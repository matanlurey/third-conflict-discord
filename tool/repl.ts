import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import readLine from 'readline';
import { simpleVisualize } from '../src/game/map/visualize';
import { Game } from '../src/game/state/game';
import { Session } from '../src/session';
import { SimpleUI } from '../src/ui';

const args = minimist(process.argv.slice(2));
const load = args._[0];
const game = Game.start(fs.readJsonSync(path.join('data', load)), [
  {
    fogOfWar: {},
    name: 'Local',
    // TODO: A better way to determine this.
    ratings: {
      ground: 70,
      naval: 70,
    },
    reports: [],
    userId: 'local',
    endedTurn: false,
  },
]);
const session = new Session(game, new SimpleUI(), {
  message: (user, message): void => {
    console.log(`@${user}: ${message}`);
  },
  broadcast: (message): void => {
    console.log(message);
  },
});

console.log('Started new session', `(${game.systems.length} systems).\n`);
const visualize =
  simpleVisualize(game.systems)
    .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
    .join('\n') + '\n';
console.log(visualize);

readLine.createInterface(process.stdin).on('line', (line) => {
  session.handle('local', false, line);
});
