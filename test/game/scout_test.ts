import { Game } from '../../src/game/state/game';
import { defaultSettings } from '../../src/game/state/settings';
import { System } from '../../src/game/state/system';
import { Session } from '../../src/session';
import { SimpleUI } from '../../src/ui';

describe('', () => {
  let alfa: System;
  let game: Game;
  let session: Session;
  let messages: string[];

  function read(): string[] {
    const reference = messages;
    messages = [];
    return reference;
  }

  beforeEach(() => {
    messages = [];
    session = new Session(
      (game = new Game({
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
        settings: defaultSettings,
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
      })),
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
    alfa = game.mustSystem('Alfa');
  });

  function parse(input: string): string {
    session.handle('1234', false, input);
    return '\n' + read().join('\n');
  }

  test('should have visibility on own system', () => {
    expect(parse('scan A')).toMatchInlineSnapshot(`
      "
      Report on \\"Alfa\\" (You control this system):

      Home System: No
      Producing: warships

      Factories: 0
      Planets: 0

      WarShips: 0
      StealthShips: 0
      Missiles: 0
      Transports: 0
      Troops: 0
      Points: 0
      "
    `);
  });

  test('should start with no visibility', () => {
    expect(parse('scan B')).toMatchInlineSnapshot(`
      "
      Report on \\"Bravo: No information."
    `);
  });

  test('should be able to dispatch a scout [prefer StealthShip]', () => {
    alfa.state.warShips = 1;
    alfa.state.stealthShips = 1;
    expect(parse('scout B')).toMatchInlineSnapshot(`
      "
      Scout \\"StealthShip\\" sent from \\"Bravo\\" to \\"Alfa\\"; eta 2 turns."
    `);
    expect(alfa.state.warShips).toEqual(1);
    expect(alfa.state.stealthShips).toEqual(0);
  });

  test('should be able to dispatch a scout [fallback WarShip]', () => {
    alfa.state.warShips = 1;
    expect(parse('scout B')).toMatchInlineSnapshot(`
      "
      Scout \\"WarShip\\" sent from \\"Bravo\\" to \\"Alfa\\"; eta 2 turns."
    `);
    expect(alfa.state.warShips).toEqual(0);
    expect(alfa.state.stealthShips).toEqual(0);
  });

  test('should be unable to scout [no ships]', () => {
    expect(parse('scout B')).toMatchInlineSnapshot(`
      "
      No valid units for scouting from \\"Alfa\\"."
    `);
  });

  test('should partially reveal target location', () => {
    alfa.state.warShips = 1;
    expect(parse('scan B')).toMatchInlineSnapshot(`
      "
      Report on \\"Bravo: No information."
    `);
    expect(parse('summary')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 1.

      A • • • • • • • • • B

      SYSTEMS:
        Alfa. P: warships, T: 1, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(parse('scout B')).toMatchInlineSnapshot(`
      "
      Scout \\"WarShip\\" sent from \\"Bravo\\" to \\"Alfa\\"; eta 2 turns."
    `);
    expect(parse('summary')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 1.

      A • • • • • • • • • B

      SYSTEMS:
        Alfa. P: warships, T: 0, M: 0

      SCOUTS:
        Alfa -> Bravo (ETA Turn 3)

      FLEETS:
        <None>"
    `);
    expect(game.state.turn).toEqual(1);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn."
    `);
    expect(game.state.turn).toEqual(2);
    expect(parse('summary')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 2.

      A • • • • • • • • • B

      SYSTEMS:
        Alfa. P: warships, T: 0, M: 0

      SCOUTS:
        Alfa -> Bravo (ETA Turn 3)

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn."
    `);
    expect(parse('reports')).toMatchInlineSnapshot(`
      "
      Scout reaches System Bravo
      Scout reaches System Bravo"
    `);
    expect(game.state.turn).toEqual(3);
    expect(parse('summary')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 3.

      A • • • • • • • • • B

      SYSTEMS:
        Alfa. P: warships, T: 0, M: 0

      SCOUTS:
        Bravo -> Alfa [Returning] (ETA Turn 5)

      FLEETS:
        <None>"
    `);
    expect(parse('scan B')).toMatchInlineSnapshot(`
      "
      Report on \\"Bravo\\" (Last updated on turn 3)

      Factories: 5
      Planets: ?

      WarShips: ?
      StealthShips: 0
      Missiles: 0
      Transports: 10
      "
    `);
  });

  test('should return scout to source', () => {
    alfa.state.warShips = 1;
    parse('scout B');

    // Dispatch
    parse('end');
    parse('end');
    expect(alfa.state.warShips).toEqual(0);

    // Return
    parse('end');
    parse('end');
    expect(alfa.state.warShips).toEqual(1);
  });
});
