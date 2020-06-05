import { Chance } from 'chance';
import { PoissonDiskSampler } from '../../src/game/map/poisson-disk';
import { RandomMap } from '../../src/game/map/random';
import { simpleVisualize } from '../../src/game/map/visualize';
import { defaultSettings } from '../../src/game/state/settings';

test('should generate a random 26 system map', () => {
  const chance = new Chance('4160df3af7c0d5c2440cb31430a83357a958bab8');
  const sampler = new PoissonDiskSampler([50, 30], 4, undefined, chance);
  const map = new RandomMap(sampler, chance);
  const output = map.generateMap(defaultSettings, [
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
  ]);
  const visualize =
    '\n' +
    simpleVisualize(output)
      .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
      .join('\n') +
    '\n';
  expect(visualize).toMatchInlineSnapshot(`
    "
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    D • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • F • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • P • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • G • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • U • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • T • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • Y • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • H • • • • • • • K • • • • • • S • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • Q • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • W
    • • • • • • • • • • • • • • • • V • • • • • L • • • • • • E • • • • • • M • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • A • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • J • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • X • •
    • • • • • • • • • • • • • • • • • • Z • • • • • • • • • • • • • • • • • • • • R • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • O • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • I • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • C • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • B • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • N • • • • • • •
    "
  `);
  expect(output).toMatchInlineSnapshot(`
    Array [
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 10,
          "factories": 10,
          "home": true,
          "missiles": 25,
          "name": "Juliett",
          "owner": "Player 1",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 3,
              "troops": 21,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 4,
              "troops": 64,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 6,
              "troops": 39,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 4,
              "troops": 65,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 5,
              "troops": 23,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 10,
              "troops": 30,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 4,
              "troops": 71,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 4,
              "troops": 23,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 3,
              "troops": 64,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 2,
              "troops": 41,
            },
          ],
          "position": Array [
            25,
            20,
          ],
          "production": "warships",
          "stealthShips": 16,
          "transports": 0,
          "troops": 0,
          "warShips": 207,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 25,
          "factories": 10,
          "home": true,
          "missiles": 17,
          "name": "India",
          "owner": "Player 2",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 5,
              "troops": 53,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 2,
              "troops": 70,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 9,
              "troops": 39,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 2,
              "troops": 28,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 8,
              "troops": 24,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 1,
              "troops": 73,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 6,
              "troops": 49,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 4,
              "troops": 55,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 9,
              "troops": 63,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 3,
              "troops": 41,
            },
          ],
          "position": Array [
            26,
            24,
          ],
          "production": "warships",
          "stealthShips": 34,
          "transports": 0,
          "troops": 0,
          "warShips": 167,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 21,
          "factories": 10,
          "home": true,
          "missiles": 15,
          "name": "Alfa",
          "owner": "Player 3",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 3,
              "troops": 45,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 1,
              "troops": 38,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 5,
              "troops": 41,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 4,
              "troops": 55,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 4,
              "troops": 28,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 4,
              "troops": 53,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 2,
              "troops": 77,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 10,
              "troops": 55,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 4,
              "troops": 58,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 4,
              "troops": 38,
            },
          ],
          "position": Array [
            43,
            19,
          ],
          "production": "warships",
          "stealthShips": 31,
          "transports": 0,
          "troops": 0,
          "warShips": 179,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 23,
          "factories": 10,
          "home": true,
          "missiles": 14,
          "name": "Oscar",
          "owner": "Player 4",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 10,
              "troops": 42,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 9,
              "troops": 31,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 4,
              "troops": 59,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 3,
              "troops": 57,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 8,
              "troops": 74,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 2,
              "troops": 51,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 9,
              "troops": 21,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 4,
              "troops": 73,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 4,
              "troops": 58,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 2,
              "troops": 26,
            },
          ],
          "position": Array [
            35,
            23,
          ],
          "production": "warships",
          "stealthShips": 35,
          "transports": 0,
          "troops": 0,
          "warShips": 194,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 7,
          "factories": 3,
          "home": false,
          "missiles": 0,
          "name": "Hotel",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 7,
              "troops": 60,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 73,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 62,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 9,
              "troops": 52,
            },
          ],
          "position": Array [
            10,
            11,
          ],
          "production": "warships",
          "stealthShips": 11,
          "transports": 0,
          "troops": 0,
          "warShips": 16,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 6,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Quebec",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 47,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 23,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 51,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 33,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 10,
              "troops": 24,
            },
          ],
          "position": Array [
            31,
            12,
          ],
          "production": "warships",
          "stealthShips": 6,
          "transports": 0,
          "troops": 0,
          "warShips": 21,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 11,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Zulu",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 76,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 20,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 9,
              "troops": 31,
            },
          ],
          "position": Array [
            18,
            22,
          ],
          "production": "warships",
          "stealthShips": 11,
          "transports": 0,
          "troops": 0,
          "warShips": 24,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 6,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Bravo",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 30,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 37,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 27,
            },
          ],
          "position": Array [
            26,
            28,
          ],
          "production": "warships",
          "stealthShips": 5,
          "transports": 0,
          "troops": 0,
          "warShips": 22,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 8,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Echo",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 30,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 68,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 30,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 65,
            },
          ],
          "position": Array [
            29,
            17,
          ],
          "production": "warships",
          "stealthShips": 10,
          "transports": 0,
          "troops": 0,
          "warShips": 12,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 12,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Mike",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 27,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 10,
              "troops": 27,
            },
          ],
          "position": Array [
            36,
            17,
          ],
          "production": "warships",
          "stealthShips": 11,
          "transports": 0,
          "troops": 0,
          "warShips": 19,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 10,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "November",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 9,
              "troops": 73,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 50,
            },
          ],
          "position": Array [
            42,
            29,
          ],
          "production": "warships",
          "stealthShips": 14,
          "transports": 0,
          "troops": 0,
          "warShips": 21,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 12,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Romeo",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 38,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 9,
              "troops": 33,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 80,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 67,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 30,
            },
          ],
          "position": Array [
            39,
            22,
          ],
          "production": "warships",
          "stealthShips": 10,
          "transports": 0,
          "troops": 0,
          "warShips": 15,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 7,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Golf",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 63,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 79,
            },
          ],
          "position": Array [
            18,
            4,
          ],
          "production": "warships",
          "stealthShips": 13,
          "transports": 0,
          "troops": 0,
          "warShips": 23,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 12,
          "factories": 3,
          "home": false,
          "missiles": 0,
          "name": "Xray",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 34,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 78,
            },
          ],
          "position": Array [
            47,
            21,
          ],
          "production": "warships",
          "stealthShips": 11,
          "transports": 0,
          "troops": 0,
          "warShips": 16,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 11,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Charlie",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 26,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 41,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 44,
            },
          ],
          "position": Array [
            21,
            26,
          ],
          "production": "warships",
          "stealthShips": 12,
          "transports": 0,
          "troops": 0,
          "warShips": 28,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 8,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Uniform",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 79,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 48,
            },
          ],
          "position": Array [
            11,
            5,
          ],
          "production": "warships",
          "stealthShips": 11,
          "transports": 0,
          "troops": 0,
          "warShips": 21,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 7,
          "factories": 3,
          "home": false,
          "missiles": 0,
          "name": "Papa",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 9,
              "troops": 30,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 68,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 56,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 24,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 45,
            },
          ],
          "position": Array [
            7,
            3,
          ],
          "production": "warships",
          "stealthShips": 15,
          "transports": 0,
          "troops": 0,
          "warShips": 13,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 6,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Tango",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 22,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 10,
              "troops": 53,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 29,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 49,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 45,
            },
          ],
          "position": Array [
            30,
            7,
          ],
          "production": "warships",
          "stealthShips": 13,
          "transports": 0,
          "troops": 0,
          "warShips": 17,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 5,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Whiskey",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 33,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 66,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 47,
            },
          ],
          "position": Array [
            49,
            16,
          ],
          "production": "warships",
          "stealthShips": 6,
          "transports": 0,
          "troops": 0,
          "warShips": 20,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 14,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Kilo",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 48,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 69,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 80,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 23,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 74,
            },
          ],
          "position": Array [
            18,
            11,
          ],
          "production": "warships",
          "stealthShips": 14,
          "transports": 0,
          "troops": 0,
          "warShips": 11,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 7,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Foxtrot",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 63,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 31,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 37,
            },
          ],
          "position": Array [
            14,
            2,
          ],
          "production": "warships",
          "stealthShips": 10,
          "transports": 0,
          "troops": 0,
          "warShips": 27,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 12,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Lima",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 77,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 36,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 36,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 21,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 28,
            },
          ],
          "position": Array [
            22,
            17,
          ],
          "production": "warships",
          "stealthShips": 14,
          "transports": 0,
          "troops": 0,
          "warShips": 16,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 11,
          "factories": 3,
          "home": false,
          "missiles": 0,
          "name": "Sierra",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 68,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 75,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 69,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 55,
            },
          ],
          "position": Array [
            25,
            11,
          ],
          "production": "warships",
          "stealthShips": 11,
          "transports": 0,
          "troops": 0,
          "warShips": 16,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 10,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Victor",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 31,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 27,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 35,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 36,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 41,
            },
          ],
          "position": Array [
            16,
            17,
          ],
          "production": "warships",
          "stealthShips": 12,
          "transports": 0,
          "troops": 0,
          "warShips": 19,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 15,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Delta",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 48,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 9,
              "troops": 65,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 74,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 21,
            },
          ],
          "position": Array [
            0,
            1,
          ],
          "production": "warships",
          "stealthShips": 14,
          "transports": 0,
          "troops": 0,
          "warShips": 16,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 5,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Yankee",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 7,
              "troops": 53,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 7,
              "troops": 21,
            },
          ],
          "position": Array [
            15,
            8,
          ],
          "production": "warships",
          "stealthShips": 5,
          "transports": 0,
          "troops": 0,
          "warShips": 25,
        },
      },
    ]
  `);
});
