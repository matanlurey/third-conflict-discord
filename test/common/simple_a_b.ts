import { Game } from '../../src/game/state/game';
import { defaultSettings } from '../../src/game/state/settings';
import { System } from '../../src/game/state/system';
import { Session } from '../../src/session';
import { SimpleUI } from '../../src/ui/simple';

export function simpleABSession(): {
  alfa: System;
  game: Game;
  parse: (input: string) => string;
  session: Session;
} {
  let messages: string[] = [];
  function read(): string[] {
    const reference = messages;
    messages = [];
    return reference;
  }
  const game = new Game({
    fleets: [],
    scouts: [],
    players: [
      {
        endedTurn: true,
        fogOfWar: {},
        name: 'Empire',
        userId: 'Empire',
        ratings: {
          naval: 100,
          ground: 100,
        },
        reports: [],
      },
      {
        endedTurn: false,
        fogOfWar: {},
        name: 'Player 1',
        userId: '1234',
        ratings: {
          naval: 100,
          ground: 100,
        },
        reports: [],
      },
    ],
    seed: '1000',
    settings: {
      ...defaultSettings,
      enableEmpireBuilds: false,
      enableRandomEvents: false,
    },
    systems: [
      System.create({
        name: 'Alfa',
        position: [0, 0],
        owner: '1234',
      }).state,
      System.create({
        name: 'Bravo',
        position: [10, 0],
        owner: 'Empire',
        factories: 5,
        transports: 10,
        troops: 500,
      }).state,
    ],
    turn: 1,
  });
  const session = new Session(
    game,
    new SimpleUI(),
    {
      message: (_, message): void => {
        messages.push(message as string);
      },
      broadcast: (message): void => {
        messages.push(message as string);
      },
    },
    false,
  );
  function parse(input: string): string {
    session.handle('1234', false, input);
    return '\n' + read().join('\n');
  }
  return {
    alfa: game.mustSystem('Alfa'),
    game,
    parse,
    session,
  };
}
