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
      {
        morale: 1,
        owner: '1234',
        recruit: 0,
        troops: 50,
      },
    );
  });

  test('should load troops automatically', () => {
    bravo.state.transports = 3;
    bravo.state.troops = 0;
    expect(parse('troops load B')).toMatchInlineSnapshot(`
      "
      Loaded 150 troop(s) from 2 planet(s). You now have 150 troops in orbit."
    `);
    expect(bravo.state.troops).toEqual(150);
  });

  test('should load troops up to capacity', () => {
    bravo.state.transports = 3;
    bravo.state.troops = 50;
    expect(parse('troops load B')).toMatchInlineSnapshot(`
      "
      Loaded 100 troop(s) from 2 planet(s). You now have 150 troops in orbit."
    `);
    expect(bravo.state.troops).toEqual(150);
    expect(bravo.state.planets.map((p) => p.troops)).toEqual([30, 20, 50, 0]);
  });

  test('should load troops from one planet [to max capacity]', () => {
    bravo.state.transports = 1;
    bravo.state.troops = 0;
    expect(parse('troops load B -p 3')).toMatchInlineSnapshot(`
      "
      Loaded 50 troop(s) from planet 3. You now have 50 in orbit."
    `);
    expect(bravo.state.planets.map((p) => p.troops)).toEqual([30, 20, 0, 50]);
  });

  test('should load troops [specific amount] from one planet', () => {
    bravo.state.transports = 1;
    bravo.state.troops = 0;
    expect(bravo.state.troops).toBe(0);
    expect(parse('troops load B 50 -p 3')).toMatchInlineSnapshot(`
      "
      Loaded 50 troop(s) from planet 3. You now have 50 troops remaining on the planet and 50 in orbit."
    `);
    expect(bravo.state.troops).toBe(50);
  });

  test('should unload troops automatically', () => {
    expect(parse('troops unload B')).toMatchInlineSnapshot(`
      "
      Unloaded 500 troops equally across 2 planet(s). You now have 0 troops in orbit."
    `);
    expect(bravo.state.troops).toEqual(0);
    expect(bravo.state.planets.map((p) => p.troops)).toEqual([
      30,
      20,
      350,
      300,
    ]);
  });

  test('should invade a planet successfully', () => {
    bravo.state.troops = 50;
    expect(parse('troops invade B -p 1')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 was invaded with 21 troops."
    `);
  });

  test('should fail to invade a planet', () => {
    bravo.state.troops = 20;
    expect(parse('troops invade B -p 1')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 defended an attack with 10 troops left."
    `);
  });

  test('should invade a system sucessfully', () => {
    bravo.state.troops = 60;
    expect(parse('troops invade B')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 was invaded with 1 troops.
      System Bravo planet 2 was invaded with 12 troops."
    `);
  });

  test('should fail to invade a system', () => {
    bravo.state.troops = 40;
    expect(parse('troops invade B')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 defended an attack with 10 troops left.
      System Bravo planet 2 defended an attack with 1 troops left."
    `);
  });

  test('should unload < capacity of troops, and load back', () => {
    bravo.state.troops = 50;
    expect(parse('troops unload B 25')).toMatchInlineSnapshot(`
      "
      Unloaded 24 troops equally across 2 planet(s). You now have 26 troops in orbit."
    `);
    expect(bravo.state.troops).toEqual(26);
  });
});
