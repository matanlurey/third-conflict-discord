/* eslint-disable @typescript-eslint/no-unused-vars */
import { Fleet } from './state/fleet';
import { Game } from './state/game';
import { Player } from './state/player';
import { System } from './state/system';

export class Events {
  constructor(
    private readonly chance: Chance.Chance,
    private readonly game: Game,
  ) {}

  maybeAffectPlayers(players: Player[]): void {
    players.forEach((p) => {
      if (p.isAI) {
        return;
      }
      // 50% Chance of an Event
      if (this.chance.bool()) {
        this.doRandomEvent(p);
        // 25% Chance of Another
        if (this.chance.bool({ likelihood: 25 })) {
          this.doRandomEvent(p);
        }
      }
    });
  }

  private doRandomEvent(player: Player): void {
    const event = this.chance.pickone([
      'antiPlayerMovementStrikes',
      'computeErrorCourseChanged',
      'epidemicStrikes',
      'enemyPropogandaLowersMorale',
      'fleetStrikesIonStorm',
      'independenceMovementStrikes',
      'industrialAccident',
      'rousingSpeech',
      'supportsInTheEmpire',
      'technologicalBreakthrough',
      'technologicalBreakthroughNewFactory,',
    ]);
    switch (event) {
      case 'antiPlayerMovementStrikes':
        return this.antiPlayerMovementStrikes(player);
      case 'computeErrorCourseChanged':
        return this.computeErrorCourseChanged(player);
      case 'epidemicStrikes':
        return this.epidemicStrikes(player);
      case 'enemyPropogandaLowersMorale':
        return this.enemyPropogandaLowersMorale(player);
      case 'fleetStrikesIonStorm':
        return this.fleetStrikesIonStorm(player);
      case 'independenceMovementStrikes':
        return this.independenceMovementStrikes(player);
      case 'industrialAccident':
        return this.industrialAccident(player);
      case 'rousingSpeech':
        return this.rousingSpeech(player);
      case 'supportsInTheEmpire':
        return this.supportsInTheEmpire(player);
      case 'technologicalBreakthrough':
        return this.technologicalBreakthrough(player);
      case 'technologicalBreakthroughNewFactory':
        return this.technologicalBreakthroughNewFactory(player);
    }
  }

  private antiPlayerMovementStrikes(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    system.adjustMorale(-2);
    player.reportEvent(
      '' +
        `Anti-${player.state.name} movement strikes, ` +
        `reducing morale at ${system.state.name}.`,
    );
  }

  private computeErrorCourseChanged(player: Player): void {
    return this.doRandomEvent(player);
  }

  private epidemicStrikes(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    if (system.state.planets.length === 0) {
      return;
    }
    const planet = this.chance.integer({
      min: 0,
      max: system.state.planets.length - 1,
    });
    const state = system.state.planets[planet];
    if (state.owner !== player.state.userId || state.troops === 0) {
      return;
    }
    const troops = this.chance.integer({ min: 0, max: state.troops });
    state.troops -= troops;
    player.reportEvent(
      `` +
        `Epidemic strikes at ${system.state.name} ` +
        `planet ${player}, killing ${troops}.`,
    );
  }

  private enemyPropogandaLowersMorale(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    systems.forEach((s) => s.adjustMorale(-1));
    player.reportEvent(`Enemy propaganda lowers morale across the sector`);
  }

  private fleetStrikesIonStorm(player: Player): void {
    return this.doRandomEvent(player);
  }

  private imperialReinforcement(system: System): void {
    // TODO: The Emperor reinforces SYSTEM with N Warships, N StealthShips, N Missiles, N Troops, N Defenses.
  }

  private independenceMovementStrikes(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    const planet = this.chance.integer({
      min: 0,
      max: system.state.planets.length - 1,
    });
    const state = system.state.planets[planet];
    if (state.owner !== player.state.userId || state.troops === 0) {
      return;
    }
    system.adjustMorale(-3, { planet: state });
    player.reportEvent(
      `` +
        `Independence movement strikes planet ${planet} in ` +
        `${system.state.name} sector.`,
    );
  }

  private industrialAccident(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    system.state.buildPoints -= Math.ceil(system.state.factories / 2);
    player.reportEvent(
      `Industrial accident occurs in the ${system.state.name} sector.`,
    );
  }

  private rousingSpeech(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    systems.forEach((s) => {
      s.adjustMorale(1);
    });
    player.reportEvent(
      `` +
        `A rousing speech by ${player.state.name} raises morale ` +
        `across the sector.`,
    );
  }

  private supportsInTheEmpire(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    const transports = this.chance.integer({ min: 2, max: 6 });
    const fleet = Fleet.create({
      warShips: this.chance.integer({ min: 15, max: 30 }),
      stealthShips: this.chance.integer({ min: 2, max: 8 }),
      transports,
      troops: transports * 50,
      missiles: this.chance.integer({ min: 5, max: 15 }),
    }).state;
    system.add(fleet);
    player.reportEvent(
      `` +
        `Supporters across the Empire send ${fleet.warShips} WarShips, ` +
        `${fleet.stealthShips} StealthShips, ${fleet.transports} Transports, ` +
        `and ${fleet.missiles} Missiles to ${system.state.name}.`,
    );
  }

  private technologicalBreakthrough(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    system.state.buildPoints += system.state.factories;
    player.reportEvent(
      `` +
        `A technological breakthrough in the ${system.state.name} system ` +
        `increases production!`,
    );
  }

  private technologicalBreakthroughNewFactory(player: Player): void {
    const systems = player.filterSystems(this.game.systems);
    if (systems.length === 0) {
      return;
    }
    const system = this.chance.pickone(systems);
    system.state.factories++;
    if (system.state.factories > 50) {
      system.state.factories = 50;
      return;
    }
    player.reportEvent(
      `` +
        `A technological breakthrough in the ${system.state.name} system ` +
        `results in a new factory!`,
    );
  }
}
