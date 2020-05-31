/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
import { program } from 'commander';
import readLine from 'readline';
import stringArgv from 'string-argv';
import { adminCommand } from '../src/commands';

const reader = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
  prompt: 'OHAI> ',
});

program.exitOverride((err) => {
  throw err;
});

// TODO: Move this to a common place for the bot too.
program.addCommand(
  adminCommand({
    create: () => {},
    load: () => {},
    save: () => {},
    start: () => {},
  }),
);

/*
program.addCommand(
  viewCommand({
    fleets: {
      all: () => {},
      from: () => {},
      missiles: () => {},
      scouts: () => {},
      to: () => {},
    },
    currentPlayerStats: () => {},
    incomingEnemyFleets: () => {},
    lastTurnResults: () => {},
    map: () => {},
    productionLimits: () => {},
    scan: () => {},
    scoreOfAllPlayers: () => {},
    systemsWithUnrest: () => {},
  }),
);
*/

reader.on('line', (line) => {
  if (line === 'exit') {
    process.exit(0);
  }
  try {
    program.parse(stringArgv(`${process.argv[0]} ${process.argv[1]} ${line}`));
  } catch (_) {
    // Ignore.
  } finally {
    console.log();
    reader.prompt();
  }
});

console.log();
reader.prompt();
