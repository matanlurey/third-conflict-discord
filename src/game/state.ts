import { fixedFloat } from '../common';
import {
  Coordinate,
  Fleet,
  InTransitFleet,
  Mission,
  Planet,
  Player,
  Scout,
  System,
} from './sector';
import { Settings } from './settings';

interface GameStateData {
  /**
   * Players originally in the game.
   *
   * The first player is always "Empire".
   */
  readonly players: Player[];

  /**
   * Systems in the sector.
   */
  readonly systems: System[];

  /**
   * Fleets in-transit (not orbiting a system).
   */
  readonly fleets: InTransitFleet[];

  /**
   * Scoutting missions in progress.
   */
  readonly scouts: Scout[];

  /**
   * Initial settings of the game.
   */
  readonly settings: Settings;

  /**
   * Current turn, with 0 meaning it has not yet started.
   */
  turn: number;
}

/**
 * A class of error that is thrown when something would violate the game state.
 */
export class InvalidOperation extends Error {}

export class OwnedSystemFacade {
  constructor(
    private readonly state: GameState,
    private readonly system: System,
  ) {}

  private message(message: string): void {
    const player = this.state.as(this.system.owner).player;
    this.state.message(message, player);
  }

  private createFleet(amounts: Fleet): Fleet | undefined {
    const current = this.system.fleet;
    const invalid = [];
    if (amounts.buildPoints > current.buildPoints) {
      invalid.push(
        `Not enough Build Points: ${current.buildPoints} < ${amounts.buildPoints}.`,
      );
    }
    if (amounts.missiles > current.missiles) {
      invalid.push(
        `Not enough Missiles: ${current.missiles} < ${amounts.missiles}.`,
      );
    }
    if (amounts.stealthShips > current.stealthShips) {
      invalid.push(
        `Not enough StealthShips: ${current.stealthShips} < ${amounts.stealthShips}.`,
      );
    }
    if (amounts.transports > current.transports) {
      invalid.push(
        `Not enough Transports: ${current.stealthShips} < ${amounts.stealthShips}.`,
      );
    }
    if (amounts.transports * 50 < amounts.troops + amounts.buildPoints) {
      invalid.push(
        '' +
          `Not enough Tranports to move ${amounts.troops} Troops ` +
          `and ${amounts.buildPoints} Build Points. You would need to send ` +
          `${Math.ceil(amounts.troops + amounts.buildPoints / 50)} Tranports.`,
      );
    }
    if (amounts.troops > current.troops) {
      invalid.push(`Not enough Troops: ${current.troops} < ${amounts.troops}.`);
    }
    if (amounts.warShips > current.warShips) {
      invalid.push(
        `Not enough WarShips: ${current.warShips} < ${amounts.warShips}.`,
      );
    }
    if (invalid.length) {
      this.message(invalid.join('\n'));
      return;
    } else {
      current.buildPoints -= amounts.buildPoints;
      current.missiles -= amounts.missiles;
      current.stealthShips -= amounts.stealthShips;
      current.transports -= amounts.transports;
      current.troops -= amounts.troops;
      current.warShips -= amounts.warShips;
      return amounts;
    }
  }

  private assign(
    target: System,
    fleet: Fleet,
    mission?: Mission,
  ): number | undefined {
    const newFleet = this.createFleet(fleet);
    if (newFleet) {
      const distance = this.state.distance(target, this.system);
      this.state.data.fleets.push({
        contents: fleet,
        destination: target.name,
        origin: this.system.name,
        owner: this.system.owner,
        distance,
        mission: mission,
      });
      return this.state.timeMove(distance, newFleet);
    }
    return;
  }

  attack(target: System, fleet: Fleet, mission: Mission): void {
    if (target.owner === this.system.owner) {
      this.message(`You control \`${target.name}\`, and cannot attack it.`);
      return;
    }
    if (mission !== 'Conquest' && this.state.data.settings.enableNoviceMode) {
      this.message(`Only \`conquest\` attacks are allowed in novice mode.`);
      return;
    }
    const eta = this.assign(target, fleet, mission);
    if (eta) {
      this.message(
        `\`${mission}\ launched to ${target.name}, ETA \`${eta}\` turns.`,
      );
    }
  }

  move(target: System, fleet: Fleet): void {
    if (target.owner !== this.system.owner) {
      this.message(
        `You do not control \`${target.name}\`, and cannot move to it.`,
      );
      return;
    }
    const eta = this.assign(target, fleet);
    if (eta) {
      this.message(`Moving fleet to ${target.name}, ETA \`${eta}\` turns.`);
    }
  }
}

export class PlayerFacade {
  constructor(
    private readonly state: GameState,
    private readonly index: number,
  ) {
    if (!this.state.data.players[index]) {
      throw new Error(`Invalid player: ${index}.`);
    }
  }

  get player(): Player {
    return this.state.data.players[this.index];
  }

  endTurn(): void {
    if (!this.player.didEndTurn) {
      this.player.didEndTurn = true;
      this.state.checkEndTurn();
    }
  }

  source(system: System): OwnedSystemFacade {
    if (system.owner !== this.index) {
      throw new Error(`${system.name} is not owned by the player.`);
    }
    return new OwnedSystemFacade(this.state, system);
  }
}

export class GameState {
  constructor(
    public readonly data: GameStateData,
    public readonly message: (message: string, player?: Player) => void,
  ) {
    if (data.players.length < 2) {
      throw new Error(
        `Invalid game, at least 2 players expected, got ${data.players.length}.`,
      );
    }
    if (data.systems.length < data.players.length) {
      throw new Error(
        `Invalid game, at least ${data.players.length} systems expected, got ${data.systems.length}.`,
      );
    }
  }

  /**
   * Returns a facade interface into the game state as the provided user.
   *
   * @param player
   */
  as(player: string | number): PlayerFacade {
    if (typeof player === 'string') {
      for (let i = 0; i < this.data.players.length; i++) {
        if (this.data.players[i].userId === player) {
          player = i;
          break;
        }
      }
    }
    if (typeof player === 'string') {
      throw new Error(`Invalid player ID: "${player}".`);
    }
    if (player > this.data.players.length) {
      throw new Error(`Invalid player number: "${player}".`);
    }
    return new PlayerFacade(this, player);
  }

  /**
   * Computes the distance between two points.
   *
   * @param from
   * @param to
   */
  distance(from: System | Coordinate, to: System | Coordinate): number {
    if ('name' in from) {
      from = from.position;
    }
    if ('name' in to) {
      to = to.position;
    }
    const x1 = from[0];
    const y1 = from[1];
    const x2 = to[0];
    const y2 = to[1];
    return fixedFloat(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
  }

  /**
   * Returns the ETA of how long it will take to travel a distance.
   *
   * @param distance
   * @param fleet
   */
  timeMove(distance: number, fleet: Fleet): number {
    let speed = this.data.settings.shipSpeedATurn;
    if (
      fleet.missiles &&
      !fleet.stealthShips &&
      !fleet.transports &&
      !fleet.warShips
    ) {
      speed *= 2;
    }
    return Math.ceil(distance / speed);
  }

  /**
   * Returns the ETA of how long it will take to scout a distance.
   *
   * @param distance
   */
  timeScout(distance: number): number {
    const speed = this.data.settings.shipSpeedATurn * 1.5;
    return Math.ceil(distance / speed);
  }

  checkEndTurn(): void {
    // TODO: Make this asynchronous?
    if (this.data.players.every((p) => !p.userId || p.didEndTurn)) {
      this.nextTurn();
    }
  }

  endGame(): void {
    // TODO: Implement.
  }

  nextTurn(): void {
    this.data.turn++;
    this.data.players.forEach((p) => (p.didEndTurn = false));
    this.data.fleets.forEach((f) => {
      this.resolveMovementAndCombat(f);
    });
    this.data.systems.forEach((s) => {
      this.newProducton(s);
      s.planets.forEach((p) => this.recruitTroops(p));
    });
    if (this.data.turn >= this.data.settings.maxGameLength) {
      this.endGame();
    }
    if (this.data.settings.enableRandomEvents) {
      this.randomEvent();
    }
    this.data.systems.forEach((s) => {
      this.moraleAdjustmentAndRevoltChecks(s);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resolveMovementAndCombat(_fleet: InTransitFleet): void {
    // TODO: Implement.
  }

  private recruitTroops(planet: Planet): void {
    planet.troops = Math.min(1000, planet.troops + planet.recruit);
  }

  private computeMorale(system: System): number {
    const owned = system.planets.filter((p) => p.owner === system.owner);
    const sum = owned.reduce((p, c) => p + c.morale, 0);
    return Math.round(sum / owned.length) || 0;
  }

  private newProducton(system: System): void {
    const morale = this.computeMorale(system);
    const perTurn = system.factories > 0 ? system.factories + morale : 0;
    const available = system.buildPoints + perTurn;

    // Returns how many can be built at the provided cost.
    //
    // Automatically adds the remainder to the build points for next turn.
    function asManyAsPossible(cost: number): number {
      const remainder = available % cost;
      system.buildPoints = remainder;
      return Math.floor(available / cost) || 0;
    }

    switch (system.building) {
      case 'WarShips':
        system.fleet.warShips += asManyAsPossible(1);
        return;
      case 'StealthShips':
        system.fleet.stealthShips += asManyAsPossible(3);
        return;
      case 'Transports':
        system.fleet.transports += asManyAsPossible(3);
        return;
      case 'Missiles':
        system.fleet.missiles += asManyAsPossible(2);
        return;
      case 'Planets':
        if (system.planets.length >= 10) {
          break;
        }
        const buildPlanets = asManyAsPossible(100);
        for (let i = 0; i < buildPlanets; i++) {
          this.buildPlanet(system);
        }
        return;
      case 'Factories':
        if (system.factories >= 50) {
          break;
        }
        system.factories += asManyAsPossible(Math.max(1, system.factories) * 3);
        return;
      case 'Defenses':
        system.defenses += asManyAsPossible(1);
        return;
    }
    system.buildPoints += perTurn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private buildPlanet(_system: System): void {
    // TODO: Implement.
  }

  private randomEvent(): void {
    // TODO: Implement
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private moraleAdjustmentAndRevoltChecks(_system: System): void {
    // TODO: Implement.
  }
}
