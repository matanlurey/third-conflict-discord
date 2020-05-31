import { Chance } from 'chance';
import { deepClone } from '../common';
import { Totals } from './score';
import { Fleet, System } from './sector';

/**
 * Chance of attack hitting in a fleet (nava) or planetary (ground) combat.
 */
export interface Ratings {
  /**
   * 25 - 90 (percent).
   */
  naval: number;

  /**
   * 25 - 90 (percent).
   */
  ground: number;
}

/**
 * Generates starting combat ratings (between 60 and 80).
 *
 * A naval of 80 guarantees a ground of 60, for example, to be balanced.
 */
export function startingCombatRatings(chance = new Chance()): Ratings {
  const naval = chance.integer({ min: 60, max: 80 });
  const ground = 60 + 80 - naval;
  return { naval, ground };
}

export class NavalCombatSimulator {
  private readonly originalAttacker: Fleet;
  private readonly originalDefender: System;
  private combatRound = 1;

  constructor(
    private readonly attacker: {
      rating: number;
      contents: Fleet;
    },
    private readonly defender: {
      rating: number;
      contents: System;
    },
    private readonly chance = new Chance(),
  ) {
    this.originalAttacker = deepClone(attacker.contents);
    this.originalDefender = deepClone(defender.contents);
  }

  simulateRound(): void {
    this.defendingMissiles();
    this.attackingStealthShips();
    this.systemDefenseUnits();
    this.defendingStealthShips();
    this.defendingWarShips();
    this.attackingWarShips();
  }

  get winner():

  get results(): {
    attacker: Totals,
    defender: Totals,
  } {
    return {
      attacker: {
        
      },
    };
  }

  private didAttackerHit(): boolean {
    return this.chance.bool({ likelihood: this.attacker.rating });
  }

  private didDefenderHit(): boolean {
    return this.chance.bool({ likelihood: this.defender.rating });
  }

  private defendingMissiles(): void {
    const defender = this.defender.contents;
    const attacker = this.attacker.contents;

    function hasTargets(): boolean {
      return (
        attacker.stealthShips + attacker.warShips + attacker.transports > 0
      );
    }

    // Not eligible for defensive missile fire.
    if (defender.defenses < 50) {
      return;
    }

    // Launch defensive missiles. Priority: StealthShips > WarShips > Transports.
    while (hasTargets() && defender.orbiting.missiles--) {
      if (!this.didAttackerHit()) {
        continue;
      }
      if (attacker.stealthShips) {
        attacker.stealthShips--;
      } else if (attacker.warShips) {
        attacker.warShips--;
      } else if (attacker.transports) {
        attacker.transports--;
      }
    }
  }

  private doAttack(amount: number, damageToStealthShips = 1): void {
    let hits = 0;
    for (let i = 0; i < amount; i++) {
      if (this.didAttackerHit()) {
        hits++;
      }
    }
    const defender = this.defender.contents;
    const doDamage = [
      (): void => {
        defender.defenses--;
      },
      (): void => {
        defender.orbiting.warShips--;
      },
      (): void => {
        defender.orbiting.stealthShips -= damageToStealthShips;
      },
    ];
    while (hits--) {
      const destroy = this.chance.weighted(doDamage, [
        defender.defenses,
        defender.orbiting.warShips,
        defender.orbiting.stealthShips,
      ]);
      destroy();
    }
  }

  private doDefense(amount: number, damageToStealthShips = 1): void {
    let hits = 0;
    for (let i = 0; i < amount; i++) {
      if (this.didDefenderHit()) {
        hits++;
      }
    }
    const attacker = this.attacker.contents;
    const doDamage = [
      (): void => {
        attacker.warShips--;
      },
      (): void => {
        attacker.stealthShips -= damageToStealthShips;
      },
    ];
    while (hits--) {
      const destroy = this.chance.weighted(doDamage, [
        attacker.warShips,
        attacker.stealthShips,
      ]);
      destroy();
    }
  }

  private attackingStealthShips(): void {
    let amount = this.attacker.contents.stealthShips;
    if (this.combatRound === 1 && this.defender.contents.defenses >= 150) {
      // Reduce attacking stealth ships by 25%.
      amount = Math.floor(amount * 0.75);
    }
    return this.doAttack(amount);
  }

  private systemDefenseUnits(): void {
    this.doDefense(this.defender.contents.defenses);
  }

  private defendingStealthShips(): void {
    this.doDefense(this.defender.contents.orbiting.stealthShips);
  }

  private defendingWarShips(): void {
    this.doDefense(this.defender.contents.orbiting.warShips, 0.5);
  }

  private attackingWarShips(): void {
    this.doAttack(this.attacker.contents.warShips, 0.5);
  }
}
