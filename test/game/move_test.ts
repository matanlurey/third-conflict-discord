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
      Summary of Admiral Player 1 on turn 2.

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        Alfa -> Bravo: 25 [Returning] (ETA Turn 4)"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3.

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 25, M: 0
        Bravo. P: nothing, T: 10, M: 0

      SCOUTS:
        <None>

      FLEETS:
        Alfa -> Bravo: 25 [Returning] (ETA Turn 4)"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4.

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
});
