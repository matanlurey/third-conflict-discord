import { Chance } from 'chance';
import { Conquest } from '../../src/game/combat/naval';
import { Fleet } from '../../src/game/state/fleet';
import { System } from '../../src/game/state/system';

test('should fight a simple battle', () => {
  const chance = new Chance(1000);
  const combat = new Conquest(chance);
  const attacker = Fleet.create({
    warShips: 30,
  });
  const defender = System.create({
    name: 'Hoth',
    owner: '1234',
    position: [0, 0],
    warShips: 20,
  });
  const result = combat.simulate(
    {
      fleet: attacker,
      rating: 70,
    },
    {
      system: defender,
      rating: 70,
    },
  );
  expect(result).toMatchInlineSnapshot(`
    Object {
      "attacker": Object {
        "buildPoints": 0,
        "missiles": 0,
        "stealthShips": 0,
        "transports": 0,
        "troops": 0,
        "warShips": -24,
      },
      "defender": Object {
        "buildPoints": 0,
        "defenses": 0,
        "factories": 0,
        "missiles": 0,
        "stealthShips": 0,
        "transports": 0,
        "troops": 0,
        "warShips": -20,
      },
      "winner": "attacker",
    }
  `);
  expect(attacker.state).toMatchInlineSnapshot(`
    Object {
      "buildPoints": 0,
      "missiles": 0,
      "stealthShips": 0,
      "transports": 0,
      "troops": 0,
      "warShips": 6,
    }
  `);
  expect(defender.state).toMatchInlineSnapshot(`
    Object {
      "buildPoints": 0,
      "defenses": 0,
      "factories": 0,
      "home": false,
      "missiles": 0,
      "name": "Hoth",
      "owner": "1234",
      "planets": Array [],
      "position": Array [
        0,
        0,
      ],
      "production": "nothing",
      "stealthShips": 0,
      "transports": 0,
      "troops": 0,
      "warShips": 0,
    }
  `);
});
