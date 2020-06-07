import { System } from '../../src/game/state/system';
import { simpleABSession } from '../common/simple_a_b';

describe('', () => {
  let alfa: System;
  let parse: (input: string) => string;

  beforeEach(() => {
    const create = simpleABSession();
    alfa = create.alfa;
    parse = create.parse;
  });

  test('privateers should capture WarShips', () => {
    alfa.state.warShips = 50;
    alfa.state.planets.push(
      {
        owner: '1234',
        morale: 0,
        recruit: 0,
        troops: 100,
      },
      {
        owner: 'Empire',
        morale: 0,
        recruit: 0,
        troops: 50,
      },
    );
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 42

      A • • • • • • • • • B

      REPORTS:
        Discontent builds on planet 1 of Alfa
        Privateers capture 1 WarShip(s) in Alfa

      SYSTEMS:
        Alfa. P: nothing, T: 49, M: 0

      SCOUTS: 0

      FLEETS:
        <None>
      SCORE SO FAR: Turn 2 of 150

      Empire: 61
      Player 1: 42"
    `);
    expect(alfa.state.privateers).toBeGreaterThan(0);
  });

  test('privateers should overthrow System', () => {
    alfa.state.privateers = 50;
    alfa.state.warShips = 25;
    alfa.state.planets.push(
      {
        owner: '1234',
        morale: 0,
        recruit: 0,
        troops: 100,
      },
      {
        owner: 'Empire',
        morale: 0,
        recruit: 0,
        troops: 50,
      },
    );
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 2 of 150.

      SCORE: 0

      A • • • • • • • • • B

      REPORTS:
        Discontent builds on planet 1 of Alfa
        Privateers capture 1 WarShip(s) in Alfa
        System Alfa overthrows Player 1, control reverts to Empire

      SYSTEMS:
        <None>

      SCOUTS: 0

      FLEETS:
        <None>
      SCORE SO FAR: Turn 2 of 150

      Empire: 110
      Player 1: 0"
    `);
    expect(alfa.state.owner).toBe('Empire');
    expect(alfa.state.planets.map((p) => p.owner)).toEqual([
      'Empire',
      'Empire',
    ]);
  });
});
