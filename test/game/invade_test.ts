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
    bravo.state.owner = alfa.state.owner;
    bravo.state.planets.push(
      {
        morale: 1,
        owner: 'Empire',
        recruit: 0,
        troops: 30,
      },
      {
        morale: 1,
        owner: 'Empire',
        recruit: 0,
        troops: 20,
      },
      {
        morale: 1,
        owner: '1234',
        recruit: 0,
        troops: 100,
      },
    );
  });

  test('should invade a planet successfully', () => {
    bravo.state.troops = 50;
    expect(parse('invade B -p 1')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 was invaded with 21 troops."
    `);
  });

  test('should fail to invade a planet', () => {
    bravo.state.troops = 20;
    expect(parse('invade B -p 1')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 defended an attack with 10 troops left."
    `);
  });

  test('should invade a system sucessfully', () => {
    bravo.state.troops = 60;
    expect(parse('invade B')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 was invaded with 1 troops.
      System Bravo planet 2 was invaded with 11 troops."
    `);
  });

  test('should fail to invade a system', () => {
    bravo.state.troops = 40;
    expect(parse('invade B')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 defended an attack with 10 troops left.
      System Bravo planet 2 was invaded with 1 troops."
    `);
  });
});
