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
  /**
   * Copy of the fleet that was attacking.
   */
  private readonly originalAttacker: Fleet;

  /**
   * Copy of the fleet that was defending.
   */
  private readonly originalDefender: System;

  /**
   * Current combat round.
   */
  private combatRound = 1;

  /**
   * Create a conquest mission.
   *
   * @param between
   * @param chance
   */
  static conquest(
    between: {
      attacker: {
        rating: number;
        contents: Fleet;
      };
      defender: {
        rating: number;
        contents: System;
      };
    },
    chance?: Chance.Chance,
  ): NavalCombatSimulator {
    return new NavalCombatSimulator(between.attacker, between.defender, chance);
  }

  private constructor(
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

  /**
   * Simulates a full round of combat.
   */
  simulateRound(): void {
    this.defendingMissiles();
    this.attackingStealthShips();
    this.systemDefenseUnits();
    this.defendingStealthShips();
    this.defendingWarShips();
    this.attackingWarShips();
    this.eliminateTransportsIfDefeated();
    this.combatRound++;
  }

  private eliminateTransportsIfDefeated(): void {
    if (this.isDefenderEliminated) {
      const defender = this.defender.contents;
      defender.fleet.transports = 0;
      defender.fleet.troops = 0;
      defender.fleet.buildPoints = 0;
    }
    if (this.isAttackerEliminated) {
      const attacker = this.attacker.contents;
      attacker.transports = 0;
      attacker.troops = 0;
      attacker.buildPoints = 0;
    }
  }

  /**
   * Whether the defender has no more combat units.
   */
  get isDefenderEliminated(): boolean {
    const defender = this.defender.contents;
    return (
      defender.defenses +
        defender.fleet.warShips +
        defender.fleet.stealthShips ===
      0
    );
  }

  /**
   * Whether the attacker has no more combat units.
   */
  get isAttackerEliminated(): boolean {
    const attacker = this.attacker.contents;
    return attacker.warShips + attacker.stealthShips === 0;
  }

  /**
   * Return the current results in terms of units lost.
   */
  get results(): {
    attacker: Partial<Totals>;
    defender: Partial<Totals>;
  } {
    const attacker = this.attacker.contents;
    const oAttacker = this.originalAttacker;
    const defender = this.defender.contents;
    const oDefender = this.originalDefender;
    return {
      attacker: {
        warShips: oAttacker.warShips - attacker.warShips,
        stealthShips: oAttacker.stealthShips - attacker.stealthShips,
        missiles: oAttacker.missiles - attacker.missiles,
        transports: oAttacker.transports - attacker.transports,
      },
      defender: {
        warShips: oDefender.fleet.warShips - defender.fleet.warShips,
        stealthShips:
          oDefender.fleet.stealthShips - defender.fleet.stealthShips,
        missiles: oDefender.fleet.missiles - defender.fleet.missiles,
        transports: oDefender.fleet.transports - defender.fleet.transports,
        defenses: oDefender.defenses - defender.defenses,
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

    // Not eligible for defensive missile fire.
    if (defender.defenses < 50) {
      return;
    }

    // Launch defensive missiles. Priority: StealthShips > WarShips > Transports.
    while (!this.isAttackerEliminated && defender.fleet.missiles--) {
      if (!this.didAttackerHit()) {
        continue;
      }
      if (attacker.stealthShips) {
        attacker.stealthShips--;
      } else if (attacker.warShips) {
        attacker.warShips--;
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
        defender.fleet.warShips--;
      },
      (): void => {
        defender.fleet.stealthShips -= damageToStealthShips;
      },
    ];
    while (!this.isDefenderEliminated && hits--) {
      const destroy = this.chance.weighted(doDamage, [
        defender.defenses,
        defender.fleet.warShips,
        defender.fleet.stealthShips,
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
    while (!this.isAttackerEliminated && hits--) {
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
    this.doDefense(this.defender.contents.fleet.stealthShips);
  }

  private defendingWarShips(): void {
    this.doDefense(this.defender.contents.fleet.warShips, 0.5);
  }

  private attackingWarShips(): void {
    this.doAttack(this.attacker.contents.warShips, 0.5);
  }
}
