import { Chance } from 'chance';
import { debugMap, SimpleMapGenerator } from '../src/game/map';

let generator: SimpleMapGenerator;

beforeAll(() => {
  generator = new SimpleMapGenerator(
    {
      displayLevel: 'combat-and-events',
      enableEmpireBuilds: true,
      enableNoviceMode: true,
      enableRandomEvents: true,
      enableSystemDefenses: false,
      gameDifficulty: 'easy',
      initialFactories: 10,
      maxGameLength: 150,
      shipSpeedATurn: 4,
    },
    new Chance(1000),
  );
});

test('should generate sectors', () => {
  const map = generator.generate([
    {
      name: 'Player 1',
      userId: '1',
      didEndTurn: false,
      combatRatings: { naval: 90, ground: 90 },
      fogOfWar: {},
    },
    {
      name: 'Player 2',
      userId: '2',
      didEndTurn: false,
      combatRatings: { naval: 90, ground: 90 },
      fogOfWar: {},
    },
    {
      name: 'Player 3',
      userId: '3',
      didEndTurn: false,
      combatRatings: { naval: 90, ground: 90 },
      fogOfWar: {},
    },
    {
      name: 'Player 4',
      userId: '4',
      didEndTurn: false,
      combatRatings: { naval: 90, ground: 90 },
      fogOfWar: {},
    },
  ]);
  expect(debugMap(map)).toMatchInlineSnapshot(`
    "
    B • • G • • • D 
    • • • • • • • • 
    • F • J I • H • 
    • • • • • • • • 
    A • • • E • • C 
    "
  `);
  expect(map).toMatchInlineSnapshot(`
    Array [
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 10,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 20,
          "troops": 1000,
          "warShips": 182,
        },
        "home": true,
        "name": "Alfa",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 9,
            "troops": 20,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 42,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 8,
            "troops": 71,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 3,
            "troops": 20,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 1,
            "troops": 40,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 30,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 3,
            "troops": 71,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 7,
            "troops": 55,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 3,
            "troops": 67,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 6,
            "troops": 75,
          },
        ],
        "position": Array [
          0,
          4,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 10,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 23,
          "troops": 1150,
          "warShips": 203,
        },
        "home": true,
        "name": "Bravo",
        "owner": 1,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 3,
            "troops": 21,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 6,
            "troops": 75,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 2,
            "troops": 69,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 8,
            "troops": 25,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 10,
            "troops": 72,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 9,
            "troops": 34,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 4,
            "troops": 60,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 1,
            "troops": 49,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 10,
            "troops": 69,
          },
          Object {
            "morale": 1,
            "owner": 1,
            "recruit": 4,
            "troops": 34,
          },
        ],
        "position": Array [
          0,
          0,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 10,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 18,
          "troops": 900,
          "warShips": 210,
        },
        "home": true,
        "name": "Charlie",
        "owner": 2,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 4,
            "troops": 70,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 1,
            "troops": 72,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 7,
            "troops": 23,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 5,
            "troops": 55,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 6,
            "troops": 71,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 4,
            "troops": 32,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 8,
            "troops": 21,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 8,
            "troops": 56,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 1,
            "troops": 79,
          },
          Object {
            "morale": 1,
            "owner": 2,
            "recruit": 2,
            "troops": 64,
          },
        ],
        "position": Array [
          7,
          4,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 10,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 25,
          "troops": 1250,
          "warShips": 217,
        },
        "home": true,
        "name": "Delta",
        "owner": 3,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 2,
            "troops": 20,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 5,
            "troops": 37,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 4,
            "troops": 65,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 8,
            "troops": 24,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 3,
            "troops": 67,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 4,
            "troops": 32,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 1,
            "troops": 47,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 5,
            "troops": 71,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 4,
            "troops": 30,
          },
          Object {
            "morale": 1,
            "owner": 3,
            "recruit": 2,
            "troops": 79,
          },
        ],
        "position": Array [
          7,
          0,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 4,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 0,
          "troops": 0,
          "warShips": 16,
        },
        "home": false,
        "name": "Echo",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 5,
            "troops": 56,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 2,
            "troops": 38,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 5,
            "troops": 61,
          },
        ],
        "position": Array [
          4,
          4,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 3,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 0,
          "troops": 0,
          "warShips": 13,
        },
        "home": false,
        "name": "Foxtrot",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 34,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 75,
          },
        ],
        "position": Array [
          1,
          2,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 3,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 0,
          "troops": 0,
          "warShips": 19,
        },
        "home": false,
        "name": "Golf",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 8,
            "troops": 33,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 9,
            "troops": 28,
          },
        ],
        "position": Array [
          3,
          0,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 3,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 0,
          "troops": 0,
          "warShips": 24,
        },
        "home": false,
        "name": "Hotel",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 3,
            "troops": 32,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 21,
          },
        ],
        "position": Array [
          6,
          2,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 4,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 0,
          "troops": 0,
          "warShips": 36,
        },
        "home": false,
        "name": "India",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 2,
            "troops": 39,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 54,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 2,
            "troops": 72,
          },
        ],
        "position": Array [
          4,
          2,
        ],
      },
      Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 3,
        "fleet": Object {
          "buildPoints": 0,
          "missiles": 0,
          "stealthShips": 0,
          "transports": 0,
          "troops": 0,
          "warShips": 19,
        },
        "home": false,
        "name": "Juliett",
        "owner": 0,
        "planets": Array [
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 2,
            "troops": 23,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 48,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 4,
            "troops": 35,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 5,
            "troops": 43,
          },
          Object {
            "morale": 1,
            "owner": 0,
            "recruit": 5,
            "troops": 69,
          },
        ],
        "position": Array [
          3,
          2,
        ],
      },
    ]
  `);
});
