import { Game } from '../../src/game/state/game';
import { System } from '../../src/game/state/system';
import { simpleABSession } from '../common/simple_a_b';

describe('', () => {
  let alfa: System;
  let game: Game;
  let parse: (input: string) => string;

  beforeEach(() => {
    const create = simpleABSession();
    alfa = create.alfa;
    game = create.game;
    parse = create.parse;
  });

  test('should have visibility on own system', () => {
    expect(parse('scan A')).toMatchInlineSnapshot(`
      "
      Report on \\"Alfa\\" (You control this system):

      Home System: No
      Producing: nothing

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
      Summary of Admiral Player 1 on turn 1 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 1, M: 0

      SCOUTS: 0

      FLEETS:
        <None>"
    `);
    expect(parse('scout B')).toMatchInlineSnapshot(`
      "
      Scout \\"WarShip\\" sent from \\"Bravo\\" to \\"Alfa\\"; eta 2 turns."
    `);
    expect(parse('summary --show-scouts')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 1 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        #1 Alfa -> Bravo (ETA Turn 3)

      FLEETS:
        <None>"
    `);
    expect(game.state.turn).toEqual(1);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS: 1

      FLEETS:
        <None>"
    `);
    expect(game.state.turn).toEqual(2);
    expect(parse('summary --show-scouts')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        #1 Alfa -> Bravo (ETA Turn 3)

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        Scout reaches system Bravo

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS: 1

      FLEETS:
        <None>"
    `);
    expect(game.state.turn).toEqual(3);
    expect(parse('summary --show-scouts')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        Scout reaches system Bravo

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        #1 Bravo -> Alfa [Returning] (ETA Turn 5)

      FLEETS:
        <None>"
    `);
    expect(parse('scan B')).toMatchInlineSnapshot(`
      "
      Report on \\"Bravo\\" (Last updated on turn 3)

      Factories: 5
      Planets: ?

      WarShips: 0
      StealthShips: ?
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
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        Scout reaches system Bravo

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS: 1

      FLEETS:
        <None>"
    `);
    expect(alfa.state.warShips).toEqual(0);

    // Return
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS: 1

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 5 of 150.

      SCORE: 25

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 1, M: 0

      SCOUTS: 0

      FLEETS:
        <None>"
    `);
    expect(alfa.state.warShips).toEqual(1);
  });

  test('stress test scouting', () => {
    alfa.state.stealthShips = 5;
    parse('scout B');
    parse('scout B');
    parse('scout B');
    parse('scout B');
    parse('scout B');
    expect(parse('summary --show-scouts')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 1 of 150.

      SCORE: 28

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        #1 Alfa -> Bravo (ETA Turn 3)
        #2 Alfa -> Bravo (ETA Turn 3)
        #3 Alfa -> Bravo (ETA Turn 3)
        #4 Alfa -> Bravo (ETA Turn 3)
        #5 Alfa -> Bravo (ETA Turn 3)

      FLEETS:
        <None>"
    `);
    parse('end');
    parse('end');
    expect(parse('summary --show-scouts')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 28

      A • • • • • • • • • B

      REPORTS:
        Scout reaches system Bravo
        Scout reaches system Bravo
        Scout reaches system Bravo
        Scout reaches system Bravo
        Scout reaches system Bravo

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        #1 Bravo -> Alfa [Returning] (ETA Turn 5)
        #2 Bravo -> Alfa [Returning] (ETA Turn 5)
        #3 Bravo -> Alfa [Returning] (ETA Turn 5)
        #4 Bravo -> Alfa [Returning] (ETA Turn 5)
        #5 Bravo -> Alfa [Returning] (ETA Turn 5)

      FLEETS:
        <None>"
    `);
    parse('end');
    parse('end');
    expect(parse('summary --show-scouts')).toMatchInlineSnapshot(`
      "
      Summary of Admiral Player 1 on turn 5 of 150.

      SCORE: 28

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 5, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(game.scouts).toHaveLength(0);
  });
});
