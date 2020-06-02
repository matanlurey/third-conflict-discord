import fs from 'fs-extra';
import { fixedFloat } from '../common';
import { SimpleMapGenerator } from './map';
import { calculateTotals, Totals } from './score';
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
  scouts: Scout[];

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
    if (mission !== 'conquest' && this.state.data.settings.enableNoviceMode) {
      this.message(`Only \`conquest\` attacks are allowed in novice mode.`);
      return;
    }
    const eta = this.assign(target, fleet, mission);
    if (eta) {
      this.message(
        `Sent \`${mission}\` mission to \`${target.name}\` from \`${this.system.name}\`, ETA \`${eta}\` turn(s).`,
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

  scout(target: System): void {
    const fleet = this.system.fleet;
    if (fleet.warShips === 0 && fleet.stealthShips === 0) {
      this.message(`You do not have any ships suitable for scouting.`);
      return;
    }
    let type: 'StealthShip' | 'WarShip';
    if (fleet.stealthShips) {
      fleet.stealthShips--;
      type = 'StealthShip';
    } else {
      fleet.warShips--;
      type = 'WarShip';
    }
    const distance = this.state.distance(target, this.system);
    const eta = this.state.timeScout(distance);
    this.state.data.scouts.push({
      origin: this.system.name,
      destination: target.name,
      distance,
      owner: this.system.owner,
      type,
    });
    this.message(
      `\`${type}\` scout heading to \`${target.name}\`, ETA \`${eta}\` turns.`,
    );
  }
}

export class SystemFacade {
  constructor(public readonly data: System) {}

  get totalOffensiveShips(): number {
    return (
      this.data.fleet.warShips +
      this.data.fleet.stealthShips +
      this.data.fleet.missiles
    );
  }

  get morale(): number {
    const owned = this.data.planets.filter((p) => p.owner === this.data.owner);
    const sum = owned.reduce((p, c) => p + c.morale, 0);
    return Math.round(sum / owned.length) || 0;
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

  get systems(): SystemFacade[] {
    return this.state.data.systems
      .filter((s) => s.owner === this.index)
      .map((s) => new SystemFacade(s));
  }

  get fleets(): InTransitFleet[] {
    return this.state.data.fleets.filter((s) => s.owner === this.index);
  }

  get scouts(): Scout[] {
    return this.state.data.scouts.filter((s) => s.owner === this.index);
  }

  /**
   * Finds a system on behalf of a player.
   *
   * @param system
   */
  find(system: string): System | undefined {
    const found = this.state.find(system);
    if (!found) {
      this.state.message(`No system found: \`${system}\`.`, this.player);
    } else {
      return found;
    }
  }

  endTurn(): void {
    if (!this.player.didEndTurn) {
      this.player.didEndTurn = true;
      this.state.checkEndTurn();
    }
  }

  source(system: System): OwnedSystemFacade | undefined {
    if (system.owner !== this.index) {
      this.state.message(
        `You must control \`${system.name}\` to issue orders from it.`,
        this.player,
      );
      return;
    }
    return new OwnedSystemFacade(this.state, system);
  }

  /**
   * Returns the latest intelligence report about a system.
   *
   * @param name
   */
  scan(system: System): Partial<System> {
    const data = this.state.data.players[this.index];
    const result = data.fogOfWar[system.name];
    if (!result) {
      return {
        name: system.name,
        position: system.position,
      };
    } else {
      return result.system;
    }
  }
}

export class GameState {
  static async create(options: {
    generator: SimpleMapGenerator;
    players: Player[];
    settings: Settings;
    message: (message: string, player?: Player) => void;
  }): Promise<GameState> {
    const players = [
      {
        combatRatings: { naval: 50, ground: 50 },
        didEndTurn: false,
        fogOfWar: {},
        name: 'Empire',
      },
      ...options.players,
    ];
    return new GameState(
      {
        fleets: [],
        scouts: [],
        players,
        settings: options.settings,
        systems: options.generator.generate(players),
        turn: 1,
      },
      options.message,
    );
  }

  static async load(
    file: string,
    options: {
      message: (message: string, player?: Player) => void;
    },
  ): Promise<GameState | undefined> {
    if (await fs.pathExists(file)) {
      return new GameState(await fs.readJson(file), options.message);
    }
  }

  constructor(
    public readonly data: GameStateData,
    public readonly message: (message: string, player?: Player) => void,
  ) {
    if (data.players.length < 2) {
      throw new Error(
        `Invalid game, at least 2 players expected, got ${data.players.length}.`,
      );
    }
    if (data.systems.length < data.players.length - 1) {
      throw new Error(
        `Invalid game, at least ${
          data.players.length - 1
        } systems expected, got ${data.systems.length}.`,
      );
    }
  }

  get turn(): number {
    return this.data.turn;
  }

  async save(file: string): Promise<void> {
    return fs.writeJsonSync(file, this.data, { spaces: 2 });
  }

  hasPlayer(userId: string): string | undefined {
    for (let i = 0; i < this.data.players.length; i++) {
      if (this.data.players[i].userId === userId) {
        return this.data.players[i].name;
      }
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

  totals(): Map<Player, Totals> {
    return calculateTotals(
      this.data.players,
      this.data.fleets,
      this.data.scouts,
      this.data.systems,
    );
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

  find(system: string): System | undefined {
    let isEqual: (name: string) => boolean;
    if (system.length === 1) {
      isEqual = (name): boolean => name[0] === system;
    } else {
      isEqual = (name): boolean => name === system;
    }
    for (const data of this.data.systems) {
      if (isEqual(data.name)) {
        return data;
      }
    }
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

  /**
   * Check if all players have ended their turn, and if so, move to the next.
   */
  checkEndTurn(): void {
    // TODO: Make this asynchronous?
    if (this.data.players.every((p) => !p.userId || p.didEndTurn)) {
      this.message(
        `All players ended their turn... Computing turn \`${this.turn + 1}\`.`,
      );
      this.nextTurn();
    }
  }

  /**
   * Forcefully ends the game, announcing the winner.
   */
  private endGame(): void {
    // TODO: Implement.
  }

  /**
   * Whether at most a single player "remains" in the game.
   */
  private get lessThanTwoPlayersRemain(): boolean {
    const active = new Set<number>();
    this.data.fleets.forEach((f) => {
      if (f.owner !== 0) {
        active.add(f.owner);
      }
    });
    this.data.systems.forEach((f) => {
      // TODO: Should holding a planet still count?
      if (f.owner !== 0) {
        active.add(f.owner);
      }
    });
    return active.size < 2;
  }

  /**
   * Moves forward the turn by 1.
   */
  nextTurn(): void {
    this.data.turn++;
    this.data.players.forEach((p) => (p.didEndTurn = false));
    this.data.scouts = this.data.scouts.filter((s) => this.resolveScout(s));
    this.data.fleets.forEach((f) => {
      this.resolveMovementAndCombat(f);
    });
    this.data.systems.forEach((s) => {
      this.newProducton(s);
      s.planets.forEach((p) => this.recruitTroops(p));
    });
    if (
      this.data.turn >= this.data.settings.maxGameLength ||
      this.lessThanTwoPlayersRemain
    ) {
      this.endGame();
    }
    if (this.data.settings.enableRandomEvents) {
      this.randomEvent();
    }
    this.data.systems.forEach((s) => {
      this.moraleAdjustmentAndRevoltChecks(s);
    });
  }

  private resolveScout(scout: Scout): boolean {
    // Move forward at 1.5* the normal speed.
    const speed = this.data.settings.shipSpeedATurn * 1.5;
    scout.distance -= speed;
    if (scout.distance <= 0) {
      // Add intelligence report.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const report = this.find(scout.destination)!;
      this.data.players[scout.owner].fogOfWar[scout.destination] = {
        updated: this.data.turn,
        system: {
          defenses: report.defenses,
          factories: report.factories,
          owner: report.owner,
          planets: Array(report.planets.length),
          name: report.name,
          position: report.position,
          fleet: {
            buildPoints: 0,
            missiles: report.fleet.missiles,
            // TODO: Should this be known? Inaccurate?
            stealthShips: report.fleet.stealthShips,
            transports: report.fleet.transports,
            troops: report.fleet.troops,
            warShips: report.fleet.warShips,
          },
        },
      };
      // Chance of scanning a WarShip
      // TODO: Implement.
      return false;
    } else {
      return true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resolveMovementAndCombat(_fleet: InTransitFleet): void {
    // TODO: Implement.
  }

  /**
   * Recruits troops at the current planet, capping at 1000.
   *
   * @param planet
   */
  private recruitTroops(planet: Planet): void {
    planet.troops = Math.min(1000, planet.troops + planet.recruit);
  }

  /**
   * Returns the average morale for the system.
   *
   * @param system
   */
  private computeMorale(system: System): number {
    // TODO: Consider the inverse of morale for enemy systems?
    const owned = system.planets.filter((p) => p.owner === system.owner);
    const sum = owned.reduce((p, c) => p + c.morale, 0);
    return Math.round(sum / owned.length) || 0;
  }

  /**
   * Builds more units at the provided system.
   *
   * @param system
   */
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
