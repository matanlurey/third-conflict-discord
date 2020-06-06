import { Chance } from 'chance';
import { Fleet, FleetState } from '../state/fleet';
import { System, SystemState } from '../state/system';

export interface CombatResult {
  readonly attacker: Partial<FleetState>;
  readonly defender: Partial<SystemState>;
  readonly winner: 'attacker' | 'defender' | 'draw';
}

/**
 * A naval combat simulator.
 */
export abstract class NavalCombat {
  constructor(
    private readonly invade = false,
    private readonly chance = new Chance(),
  ) {}

  abstract simulate(
    attacker: {
      fleet: Fleet;
      rating: number;
    },
    defender: {
      system: System;
      rating: number;
    },
  ): CombatResult;

  protected combatRound(
    attacker: {
      fleet: Fleet;
      rating: number;
    },
    defender: {
      system: System;
      rating: number;
    },
  ): CombatResult {
    // Functions that determine if hits occur.
    const didAttackerHit = (): boolean => {
      return this.didHit(attacker.rating);
    };
    const didDefenderHit = (): boolean => {
      return this.didHit(defender.rating);
    };

    // Original numbers.
    const oAttacker = { ...attacker.fleet.state };
    const mAttacker = attacker.fleet.state;
    const oDefender = { ...defender.system.state };
    const mDefender = defender.system.state;

    // Combat round.
    this.offensiveMissiles(defender.system, attacker.fleet);
    this.defendingMissiles(defender.system, attacker.fleet);
    this.attackingStealth(didAttackerHit, defender.system, attacker.fleet);
    this.defendingDefenses(didDefenderHit, defender.system, attacker.fleet);
    this.defendingStealth(didDefenderHit, defender.system, attacker.fleet);
    this.defendingWarShips(didDefenderHit, defender.system, attacker.fleet);
    this.attackingWarShips(didAttackerHit, defender.system, attacker.fleet);

    // Destroy cargo, save damaged stealth ships.
    attacker.fleet.destroyUndefendedCargo();
    attacker.fleet.saveDamagedStealthShips();
    defender.system.destroyUndefendedCargo();
    defender.system.saveDamagedStealthShips();

    return {
      attacker: {
        buildPoints: oAttacker.buildPoints - mAttacker.buildPoints,
        missiles: oAttacker.missiles - mAttacker.missiles,
        stealthShips: oAttacker.stealthShips - mAttacker.stealthShips,
        transports: oAttacker.transports - mAttacker.transports,
        troops: oAttacker.troops - mAttacker.troops,
        warShips: oAttacker.warShips - mAttacker.warShips,
      },
      defender: {
        buildPoints: oDefender.buildPoints - mDefender.buildPoints,
        missiles: oDefender.missiles - mDefender.missiles,
        stealthShips: oDefender.stealthShips - mDefender.stealthShips,
        transports: oDefender.transports - mDefender.transports,
        troops: oDefender.troops - mDefender.troops,
        warShips: oDefender.warShips - mDefender.warShips,
        defenses: oDefender.defenses - mDefender.defenses,
        factories: oDefender.factories - mDefender.factories,
      },
      winner: attacker.fleet.isEliminated
        ? 'defender'
        : defender.system.isEliminated && this.invade
        ? 'attacker'
        : 'draw',
    };
  }

  private defendingMissiles(defender: System, attacker: Fleet): void {
    if (!defender.capableOfDefensiveMissileFire) {
      return;
    }
    while (!attacker.isEliminated && defender.state.missiles > 0) {
      defender.state.missiles--;
      if (attacker.state.stealthShips) {
        attacker.state.stealthShips--;
      } else if (attacker.state.warShips) {
        attacker.state.warShips--;
      }
    }
  }

  private offensiveMissiles(defender: System, attacker: Fleet): void {
    const alwaysHits = (): boolean => true;
    while (!defender.isEliminated && attacker.state.missiles > 0) {
      attacker.state.missiles--;
      this.simCombatRound(alwaysHits, defender, 1);
    }
    const defeatFactories = Math.floor(attacker.state.missiles / 5);
    defender.state.factories = Math.max(
      0,
      defender.state.factories - defeatFactories,
    );
    attacker.state.missiles = 0;
  }

  private simCombatRound(
    didHit: () => boolean,
    defender: Fleet | System,
    attacks: number,
    damageToStealthShips = 1,
  ): void {
    if (defender.isEliminated) {
      return;
    }
    let hits = 0;
    for (let i = 0; i < attacks; i++) {
      if (didHit()) {
        hits++;
      }
    }
    const assign = [
      (): void => {
        defender.state.warShips--;
      },
      (): void => {
        defender.state.stealthShips -= damageToStealthShips;
      },
      (): void => {
        (defender.state as SystemState).defenses--;
      },
    ];
    while (!defender.isEliminated && hits > 0) {
      const weighted = [
        defender.state.warShips,
        defender.state.stealthShips,
        (defender.state as SystemState).defenses || 0,
      ];
      hits--;
      const destroy = this.chance.weighted(assign, weighted);
      destroy();
    }
  }

  private attackingStealth(
    didHit: () => boolean,
    defender: System,
    attacker: Fleet,
  ): void {
    this.simCombatRound(didHit, defender, attacker.state.stealthShips);
  }

  private defendingDefenses(
    didHit: () => boolean,
    defender: System,
    attacker: Fleet,
  ): void {
    this.simCombatRound(didHit, attacker, defender.state.defenses);
  }

  private defendingStealth(
    didHit: () => boolean,
    defender: System,
    attacker: Fleet,
  ): void {
    this.simCombatRound(didHit, attacker, defender.state.stealthShips);
  }

  private defendingWarShips(
    didHit: () => boolean,
    defender: System,
    attacker: Fleet,
  ): void {
    this.simCombatRound(didHit, attacker, defender.state.warShips, 0.5);
  }

  private attackingWarShips(
    didHit: () => boolean,
    defender: System,
    attacker: Fleet,
  ): void {
    this.simCombatRound(didHit, defender, attacker.state.warShips, 0.5);
  }

  private didHit(likelihood: number): boolean {
    return this.chance.bool({ likelihood });
  }
}

export class Conquest extends NavalCombat {
  constructor(chance: Chance.Chance) {
    super(true, chance);
  }

  simulate(
    attacker: {
      fleet: Fleet;
      rating: number;
    },
    defender: {
      system: System;
      rating: number;
    },
  ): CombatResult {
    const aResult = {
      buildPoints: 0,
      missiles: 0,
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
    };
    const dResult = {
      buildPoints: 0,
      missiles: 0,
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
      defenses: 0,
      factories: 0,
    };
    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    // No defenders base-case.
    if (defender.system.isEliminated && !attacker.fleet.isMissilesOnly) {
      return {
        attacker: aResult,
        defender: dResult,
        winner: 'attacker',
      };
    }
    function attackerHasMisslesAndDefenderHasFactories(): boolean {
      return (
        attacker.fleet.state.missiles > 0 && defender.system.state.factories > 0
      );
    }
    while (
      (!attacker.fleet.isEliminated && !defender.system.isEliminated) ||
      attackerHasMisslesAndDefenderHasFactories()
    ) {
      const round = this.combatRound(attacker, defender);
      winner = round.winner;

      // Sum up attacker results.
      aResult.buildPoints -= round.attacker.buildPoints || 0;
      aResult.missiles -= round.attacker.missiles || 0;
      aResult.stealthShips -= round.attacker.stealthShips || 0;
      aResult.transports -= round.attacker.transports || 0;
      aResult.troops -= round.attacker.troops || 0;
      aResult.warShips -= round.attacker.warShips || 0;

      // Sum up defender results.
      dResult.buildPoints -= round.defender.buildPoints || 0;
      dResult.missiles -= round.defender.missiles || 0;
      dResult.stealthShips -= round.defender.stealthShips || 0;
      dResult.transports -= round.defender.transports || 0;
      dResult.troops -= round.defender.troops || 0;
      dResult.warShips -= round.defender.warShips || 0;
      dResult.defenses -= round.defender.defenses || 0;
      dResult.factories -= round.defender.factories || 0;
    }
    return {
      attacker: aResult,
      defender: dResult,
      winner,
    };
  }
}
