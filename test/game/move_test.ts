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

      [A] • • • • • • • • • [B]

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

      [A] • • • • • • • • • [B]

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

      [A] • • • • • • • • • [B]

      REPORTS:
        System Bravo garrison reports unrest

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

      [A] • • • • • • • • • [B]

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

      [A] • • • • • • • • • [B]

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

      [A] • • • • • • • • • [B]

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

      [A] • • • • • • • • •  B 

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

      [A] • • • • • • • • •  B 

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

  test('should attack and invade an enemy system', () => {
    alfa.state.warShips = 50;
    alfa.state.transports = 10;
    alfa.state.troops = 500;
    bravo.state.warShips = 25;
    bravo.state.planets.push(
      {
        morale: 1,
        owner: 'Empire',
        recruit: 0,
        troops: 100,
      },
      {
        morale: 1,
        owner: 'Empire',
        recruit: 0,
        troops: 130,
      },
    );
    expect(parse('attack B -w 50 -r 10 -t 500')).toMatchInlineSnapshot(`
      "
      Attack \\"60 ships\\" sent from \\"Alfa\\" to \\"Bravo\\"; eta 3 turns."
    `);
    parse('end');
    parse('end');
    expect(bravo.state).toMatchInlineSnapshot(`
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 5,
        "home": false,
        "missiles": 0,
        "name": "Bravo",
        "owner": "Empire",
        "planets": Array [
          Object {
            "morale": 1,
            "owner": "Empire",
            "recruit": 0,
            "troops": 100,
          },
          Object {
            "morale": 1,
            "owner": "Empire",
            "recruit": 0,
            "troops": 130,
          },
        ],
        "position": Array [
          10,
          0,
        ],
        "production": "nothing",
        "stealthShips": 0,
        "transports": 10,
        "troops": 500,
        "warShips": 25,
      }
    `);
    expect(parse('end')).toMatchInlineSnapshot(`
      "
      Ended your turn.
      Summary of Admiral Player 1 on turn 4 of 150.

      SCORE: 91

      [A] • • • • • • • • • [B]

      REPORTS:
        Combat @ Bravo resulted in victory.
        YOU:
          War Ships: -25
        THEM:
          Transports: -10
          Troops: -500
          War Ships: -25

      SYSTEMS:
        Alfa. P: nothing, T: 0, M: 0
        Bravo. P: nothing, T: 35, M: -1

      SCOUTS:
        <None>

      FLEETS:
        <None>"
    `);
    expect(bravo.state.warShips).toEqual(25);
    expect(bravo.state.transports).toEqual(10);
    expect(bravo.state.troops).toEqual(500);
    expect(bravo.state.owner).toEqual('1234');
    expect(parse('troops invade B')).toMatchInlineSnapshot(`
      "
      System Bravo planet 1 was invaded with 151 troops.
      System Bravo planet 2 was invaded with 125 troops."
    `);
    expect(parse('scan B')).toMatchInlineSnapshot(`
      "
      Report on \\"Bravo\\" (You control this system):

      Home System: No
      Producing: nothing

      Factories: 5
      Planets: 2

      WarShips: 25
      StealthShips: 0
      Missiles: 0
      Transports: 10
      Troops: 0
      Points: 4
      "
    `);
  });
});
