/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Coordinate, createSystem, Scout } from '../../src/game/sector';
import { GameState } from '../../src/game/state';
import { noRngPlayer, simpleSettings } from '../common';

let state: GameState;
let messages: string[];

beforeEach(() => {
  messages = [];
  state = new GameState(
    {
      fleets: [],
      scouts: [],
      players: [
        noRngPlayer('Empire'),
        noRngPlayer('A', 'Player A'),
        noRngPlayer('B', 'Player B'),
      ],
      systems: [
        createSystem({
          name: 'Alfa',
          home: true,
          owner: 1,
          position: [0, 0] as Coordinate,
        }),
        createSystem({
          name: 'Bravo',
          home: true,
          owner: 2,
          factories: 10,
          position: [4, 0] as Coordinate,
        }),
      ],
      settings: simpleSettings(),
      turn: 1,
    },
    (message) => messages.push(message),
  );
});

test('Alfa cannot see Beta', () => {
  const player = state.as('Player A');
  const bravo = player.find('B')!;
  expect(bravo).toBeDefined();
  expect(player.scan(bravo)).toEqual({
    name: 'Bravo',
    position: [4, 0],
  });
});

test('Alfa can scout Beta', () => {
  // Add a WarShip for Scouting.
  const player = state.as('Player A');
  player.find('Alfa')!.fleet.warShips++;

  // Do a Scout action.
  const alfa = player.source(player.find('Alfa')!)!;
  const bravo = player.find('Bravo')!;
  alfa.scout(bravo);
  expect(state.data.scouts).toEqual<Scout[]>([
    {
      owner: 1,
      type: 'WarShip',
      destination: 'Bravo',
      distance: 4,
    },
  ]);

  // End turns.
  state.as('Player A').endTurn();
  state.as('Player B').endTurn();

  // Assert scout mission complete.
  expect(state.data.scouts).toHaveLength(0);
  expect(player.scan(bravo)).toMatchObject({
    name: 'Bravo',
    position: [4, 0],
    factories: 10,
  });
});
