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
    output
      .filter((s) => s.state.home)
      .map((s) => `${s.state.owner}: ${s.state.name}`)
      .sort()
      .join('\n') +
    '\n' +
    simpleVisualize(output)
      .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
      .join('\n') +
    '\n';
  expect(visualize).toMatchInlineSnapshot(`
    "
    Player 1: Yankee
    Player 2: Tango
    Player 3: November
    Player 4: Victor
    Y • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • D • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • P • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • B • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • J • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • V • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • W • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • Q • • • • • • • S • • • • • • Z • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • I • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • T
    • • • • • • • • • • • • • • • • H • • • • • K • • • • • • L • • • • • • G • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • A • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • O • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • U • •
    • • • • • • • • • • • • • • • • • • F • • • • • • • • • • • • • • • • • • • • E • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • C • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • R • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • N • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • M • • • • • • • • • • • • • • • • • • • • • • •
    • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • X • • • • • • •
    "
  `);
  expect(output).toMatchInlineSnapshot(`
    Array [
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
              "troops": 32,
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
              "recruit": 9,
              "troops": 32,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 72,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 53,
            },
          ],
          "position": Array [
            18,
            10,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 13,
          "transports": 0,
          "troops": 0,
          "warShips": 10,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 12,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Delta",
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
            14,
            1,
          ],
          "privateers": 0,
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
          "defenses": 12,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Zulu",
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
            25,
            10,
          ],
          "privateers": 0,
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
          "defenses": 26,
          "factories": 10,
          "home": true,
          "missiles": 15,
          "name": "November",
          "owner": "Player 3",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 2,
              "troops": 28,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 8,
              "troops": 24,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 1,
              "troops": 73,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 6,
              "troops": 49,
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
              "recruit": 9,
              "troops": 63,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 3,
              "troops": 41,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 4,
              "troops": 34,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 6,
              "troops": 40,
            },
            Object {
              "morale": 1,
              "owner": "Player 3",
              "recruit": 3,
              "troops": 45,
            },
          ],
          "position": Array [
            21,
            25,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 79,
          "transports": 20,
          "troops": 1000,
          "warShips": 230,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 10,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Golf",
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
            36,
            16,
          ],
          "privateers": 0,
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
          "defenses": 11,
          "factories": 3,
          "home": false,
          "missiles": 0,
          "name": "Lima",
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
            29,
            16,
          ],
          "privateers": 0,
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
          "defenses": 15,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Xray",
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
            42,
            28,
          ],
          "privateers": 0,
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
          "name": "Alfa",
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
            43,
            18,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 5,
          "transports": 0,
          "troops": 0,
          "warShips": 25,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 42,
          "factories": 10,
          "home": true,
          "missiles": 20,
          "name": "Yankee",
          "owner": "Player 1",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 8,
              "troops": 80,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 4,
              "troops": 35,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 6,
              "troops": 43,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 6,
              "troops": 53,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 5,
              "troops": 33,
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
              "recruit": 5,
              "troops": 37,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 6,
              "troops": 60,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 1,
              "troops": 55,
            },
            Object {
              "morale": 1,
              "owner": "Player 1",
              "recruit": 2,
              "troops": 79,
            },
          ],
          "position": Array [
            0,
            0,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 57,
          "transports": 22,
          "troops": 1100,
          "warShips": 236,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 5,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Quebec",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 3,
              "troops": 20,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 63,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 7,
              "troops": 61,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 71,
            },
          ],
          "position": Array [
            10,
            10,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 14,
          "transports": 0,
          "troops": 0,
          "warShips": 19,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 6,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Papa",
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
            7,
            2,
          ],
          "privateers": 0,
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
          "defenses": 7,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Echo",
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
            39,
            21,
          ],
          "privateers": 0,
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
            16,
            16,
          ],
          "privateers": 0,
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
          "defenses": 25,
          "factories": 10,
          "home": true,
          "missiles": 22,
          "name": "Tango",
          "owner": "Player 2",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 4,
              "troops": 37,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 6,
              "troops": 57,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 2,
              "troops": 78,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 3,
              "troops": 41,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 7,
              "troops": 43,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 2,
              "troops": 33,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 6,
              "troops": 27,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 4,
              "troops": 64,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 2,
              "troops": 76,
            },
            Object {
              "morale": 1,
              "owner": "Player 2",
              "recruit": 4,
              "troops": 60,
            },
          ],
          "position": Array [
            49,
            15,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 72,
          "transports": 26,
          "troops": 1300,
          "warShips": 197,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 10,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Bravo",
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
            18,
            3,
          ],
          "privateers": 0,
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
          "defenses": 11,
          "factories": 5,
          "home": false,
          "missiles": 0,
          "name": "Foxtrot",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 27,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 2,
              "troops": 68,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 10,
              "troops": 56,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 24,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 27,
            },
          ],
          "position": Array [
            18,
            21,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 8,
          "transports": 0,
          "troops": 0,
          "warShips": 14,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 31,
          "factories": 10,
          "home": true,
          "missiles": 16,
          "name": "Victor",
          "owner": "Player 4",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 5,
              "troops": 38,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 2,
              "troops": 54,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 4,
              "troops": 25,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 9,
              "troops": 78,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 5,
              "troops": 41,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 5,
              "troops": 49,
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
              "recruit": 4,
              "troops": 79,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 4,
              "troops": 79,
            },
            Object {
              "morale": 1,
              "owner": "Player 4",
              "recruit": 4,
              "troops": 75,
            },
          ],
          "position": Array [
            30,
            6,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 60,
          "transports": 22,
          "troops": 1100,
          "warShips": 223,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 8,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Oscar",
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
            25,
            19,
          ],
          "privateers": 0,
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
          "defenses": 6,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Whiskey",
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
            15,
            7,
          ],
          "privateers": 0,
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
          "defenses": 12,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Mike",
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
            26,
            27,
          ],
          "privateers": 0,
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
          "defenses": 12,
          "factories": 3,
          "home": false,
          "missiles": 0,
          "name": "Juliett",
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
            11,
            4,
          ],
          "privateers": 0,
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
          "name": "Romeo",
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
            26,
            23,
          ],
          "privateers": 0,
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
          "name": "Charlie",
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
            35,
            22,
          ],
          "privateers": 0,
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
          "defenses": 14,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "India",
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
            31,
            11,
          ],
          "privateers": 0,
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
          "defenses": 6,
          "factories": 2,
          "home": false,
          "missiles": 0,
          "name": "Kilo",
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
              "troops": 51,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 59,
            },
          ],
          "position": Array [
            22,
            16,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 5,
          "transports": 0,
          "troops": 0,
          "warShips": 10,
        },
      },
      System {
        "state": Object {
          "buildPoints": 0,
          "defenses": 13,
          "factories": 4,
          "home": false,
          "missiles": 0,
          "name": "Uniform",
          "owner": "Empire",
          "planets": Array [
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 42,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 4,
              "troops": 21,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 6,
              "troops": 42,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 5,
              "troops": 77,
            },
            Object {
              "morale": 1,
              "owner": "Empire",
              "recruit": 1,
              "troops": 76,
            },
          ],
          "position": Array [
            47,
            20,
          ],
          "privateers": 0,
          "production": "warships",
          "stealthShips": 9,
          "transports": 0,
          "troops": 0,
          "warShips": 29,
        },
      },
    ]
  `);
});
