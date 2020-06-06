import { Fleet } from '../../src/game/state/fleet';
import { Game } from '../../src/game/state/game';
import { System } from '../../src/game/state/system';
import { Session } from '../../src/session';
import { simpleABSession } from '../common/simple_a_b';

describe('', () => {
  let alfa: System;
  let bravo: System;
  let game: Game;
  let session: Session;
  let parse: (input: string) => string;

  beforeEach(() => {
    const create = simpleABSession();
    alfa = create.alfa;
    game = create.game;
    parse = create.parse;
    session = create.session;
    bravo = game.mustSystem('Bravo');
  });

  test('should not detect if < 25 defenses', () => {
    bravo.state.warShips = 50;
    session.attack(bravo, alfa, Fleet.create({ warShips: 30 }));
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2.

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3.

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4.

      A • • • • • • • • • B

      REPORTS:
        Combat @ Alfa resulted in defeat.
        YOU:
          <No Changes>
        THEM:
          <No Changes>

      SYSTEMS:
        <None>

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
  });

  test('should not detect if size <= 10', () => {
    alfa.state.defenses = 25;
    bravo.state.warShips = 10;
    session.attack(bravo, alfa, Fleet.create({ warShips: 10 }));
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2.

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3.

      A • • • • • • • • • B

      REPORTS:
        <None>

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4.

      A • • • • • • • • • B

      REPORTS:
        Combat @ Alfa resulted in victory.
        YOU:
          <No Changes>
        THEM:
          War Ships: -10

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
  });

  test('should detect incoming missiles', () => {
    alfa.state.defenses = 25;
    alfa.state.factories = 2;
    bravo.state.missiles = 30;
    const missles = Fleet.create({ missiles: 30 });
    session.attack(bravo, alfa, missles);
    const fleet = game.fleets[0];
    expect(alfa.detectionRange).toEqual(4);
    expect(fleet.state.distance).toEqual(10);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2.

      A • • • • • • • • • B

      REPORTS:
        Incoming approximately 22 missile(s) to Alfa; eta turn 3

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(fleet.state.distance).toEqual(2);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 3.

      A • • • • • • • • • B

      REPORTS:
        Combat @ Alfa resulted in victory.
        YOU:
          Defenses: -25
          Factories: -1
        THEM:
          Missiles: -30

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
  });
});
