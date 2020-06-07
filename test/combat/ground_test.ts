import { Chance } from 'chance';
import { determineGroundResults } from '../../src/game/combat/ground';

test('should win a ground battle', () => {
  const results = determineGroundResults(
    {
      rating: 0.7,
      troops: 100,
    },
    {
      rating: 0.6,
      troops: 80,
    },
    new Chance(1000),
  );
  expect(results).toMatchInlineSnapshot(`
    Object {
      "attacker": 26,
      "defender": 0,
      "winner": "attacker",
    }
  `);
});

test('should lose a ground battle', () => {
  const results = determineGroundResults(
    {
      rating: 0.7,
      troops: 100,
    },
    {
      rating: 0.8,
      troops: 120,
    },
    new Chance(1000),
  );
  expect(results).toMatchInlineSnapshot(`
    Object {
      "attacker": 0,
      "defender": 33,
      "winner": "defender",
    }
  `);
});
