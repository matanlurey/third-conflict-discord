import { Game } from '../../src/game/state/game';
import { System } from '../../src/game/state/system';
import { simpleABSession } from '../common/simple_a_b';

describe('', () => {
  let alfa: System;
  let bravo: System;
  let game: Game;
  let parse: (input: string) => string;

  beforeEach(() => {
    const create = simpleABSession();
    alfa = create.alfa;
    game = create.game;
    parse = create.parse;
    bravo = game.mustSystem('Bravo');
  });

  test('should move a friendly fleet', () => {
    bravo.state.owner = alfa.state.owner;
    alfa.state.warShips = 50;
    expect(parse('move B -w 25')).toMatchInlineSnapshot(`
      "
      Reinforcements of \\"25 ships\\" sent from \\"Alfa\\" to \\"Bravo\\"; eta 3 turns."
    `);
    const fleet = game.fleets[0];
    expect(fleet.state.target).toEqual('Bravo');
    expect(fleet.state.source).toEqual('Alfa');
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 96

      A • • • • • • • • • B

      REPORTS:
        System Bravo garrison reports unrest

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        #1 Alfa -> Bravo: 25 [Returning] (ETA Turn 4)"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 96

      A • • • • • • • • • B

      REPORTS:
        System Bravo garrison reports unrest

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        #1 Alfa -> Bravo: 25 [Returning] (ETA Turn 4)"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4 of 150.

      SCORE: 96

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 35, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
  });

  test('should recall a friendly fleet', () => {
    bravo.state.owner = alfa.state.owner;
    alfa.state.warShips = 50;
    expect(parse('move B -w 25')).toMatchInlineSnapshot(`
      "
      Reinforcements of \\"25 ships\\" sent from \\"Alfa\\" to \\"Bravo\\"; eta 3 turns."
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 96

      A • • • • • • • • • B

      REPORTS:
        System Bravo garrison reports unrest

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        #1 Alfa -> Bravo: 25 [Returning] (ETA Turn 4)"
    `);
    expect(parse('recall 1')).toMatchInlineSnapshot(`
      "
      Recalled fleet #1 to Alfa."
    `);
    expect(alfa.state.warShips).toEqual(25);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 96

      A • • • • • • • • • B

      REPORTS:
        System Bravo garrison reports unrest

      SYSTEMS:
        Alfa. P: nothing, T: 50, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(alfa.state.warShips).toEqual(50);
  });

  test('should recall a friendly fleet automatically', () => {
    bravo.state.owner = alfa.state.owner;
    alfa.state.warShips = 50;
    expect(parse('move B -w 25')).toMatchInlineSnapshot(`
      "
      Reinforcements of \\"25 ships\\" sent from \\"Alfa\\" to \\"Bravo\\"; eta 3 turns."
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 96

      A • • • • • • • • • B

      REPORTS:
        System Bravo garrison reports unrest

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        #1 Alfa -> Bravo: 25 [Returning] (ETA Turn 4)"
    `);
    bravo.state.owner = 'Empire';
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3 of 150.

      SCORE: 35

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0

      SCOUTS:
        <None>

      FLEETS:
        #1 Bravo -> Alfa: 25 [Returning] (ETA Turn 3)"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4 of 150.

      SCORE: 35

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 50, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
  });
});
