import { NavalCombatSimulator } from '../../src/game/combat';
import { createFleet, createSystem } from '../../src/game/sector';

describe('NavalCombatSimulator', () => {
  let simulator: NavalCombatSimulator;

  test('simulate a simple Warship v Warship', () => {
    simulator = NavalCombatSimulator.conquest({
      attacker: {
        // Disable RNG.
        rating: 100,

        contents: createFleet({
          warShips: 100,
        }),
      },
      defender: {
        // Disable RNG.
        rating: 100,

        contents: createSystem({
          name: 'Alpha',
          fleet: createFleet({
            warShips: 30,
          }),
        }),
      },
    });
    expect(simulator.isAttackerEliminated).toBe(false);
    expect(simulator.isDefenderEliminated).toBe(false);
    simulator.simulateRound();
    expect(simulator.isAttackerEliminated).toBe(false);
    expect(simulator.isDefenderEliminated).toBe(true);
    expect(simulator.results).toMatchObject({
      attacker: {
        warShips: 30,
      },
      defender: {
        warShips: 30,
      },
    });
  });
});
