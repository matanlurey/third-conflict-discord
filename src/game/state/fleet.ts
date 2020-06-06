import { Mixin } from 'ts-mixer';
import { GameStateError } from '../../cli/reader';
import { System } from './system';

export interface MoveState {
  /**
   * Who owns the scout.
   */
  readonly owner: string;

  /**
   * Origin of the unit (if recalled).
   */
  source: string;

  /**
   * Destination (system) of the unit.
   */
  target: string;

  /**
   * Distance remaining until the destination is reached.
   */
  distance: number;
}

export class Moveable {
  /**
   * State field.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: "Abstract methods can only appear within an abstract class"
  protected abstract get state(): MoveState;

  /**
   * How much faster this unit should move.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: "Abstract methods can only appear within an abstract class"
  protected abstract get speedModifier(): number;

  /**
   * Estimated time of arrival.
   */
  eta(speed: number): number {
    return Math.ceil(this.state.distance / (speed * this.speedModifier));
  }

  /**
   * Whether the scout has reached its target.
   */
  get hasReachedTarget(): boolean {
    return this.state.distance <= 0;
  }

  /**
   * Move the scout.
   *
   * @param speed
   */
  move(speed: number): void {
    this.state.distance -= speed * this.speedModifier;
  }

  /**
   * Recalls the fleet back.
   */
  recall(distance: number): void {
    const { source, target } = this.state;
    this.state.target = source;
    this.state.source = target;
    this.state.distance = distance;
  }

  shouldReveal(target: System): boolean {
    return (
      target.state.name === this.state.target &&
      this.hasReachedTarget &&
      target.state.owner !== this.state.owner
    );
  }
}

export interface ScoutState extends MoveState {
  /**
   * Whether a WarShip or StealthShip was sent.
   */
  readonly scout: 'warship' | 'stealthship';
}

export class Scout extends Moveable {
  protected readonly speedModifier = 1.5;

  constructor(readonly state: ScoutState) {
    super();
  }
}

export interface FleetState {
  /**
   * Warships are large vessels designed for combat.
   *
   * They destroy one enemy WarShip or Transport per round, and it takes two
   * WarShips to attack an enemy StealthShip. WarShips can also bombard enemy
   * planets from orbit. WarShips cost 1 point each to build.
   */
  warShips: number;

  /**
   * StealthShips are medium-sized starships equipped with advanced electronics.
   *
   * They are difficult to detect and target, and StealthShips always fire first
   * when attacking. StealthShips are also preferred as Scouts, and cost 3
   * points each to build.
   */
  stealthShips: number;

  /**
   * Transports are large, unarmed ships used to ferry troops and cargo.
   *
   * Each Transport can carry 50 Troops or Build Points, and cost 3 points each
   * to build.
   */
  transports: number;

  /**
   * Missiles are high-speed, unmanned, expanedable vehicles.
   *
   * Missiles travel at twice the speed of regular fleets and are destroyed when
   * they attack. Missiles attack, in order: System Defenses, StealthShips,
   * Warships, Transports. If no mobile units are in the targeted system then
   * 5 missiles destroy a factory.
   *
   * Missiles can also play a defensive role in combat.
   */
  missiles: number;

  /**
   * Number of troops loaded onto @see {transports}.
   *
   * See @see {Planet.troops}.
   */
  troops: number;

  /**
   * Excess build poits loaded onto @see {transports}.
   */
  buildPoints: number;
}

export abstract class Combatable {
  protected abstract get state(): FleetState;

  destroyUndefendedCargo(): void {
    if (this.isEliminated) {
      this.state.troops = this.state.buildPoints = this.state.transports = 0;
    }
  }

  saveDamagedStealthShips(): void {
    this.state.stealthShips = Math.ceil(this.state.stealthShips);
  }

  get isEliminated(): boolean {
    return (
      this.state.stealthShips === 0 &&
      this.state.warShips === 0 &&
      this.state.missiles === 0
    );
  }

  /**
   * Adds unit to the fleet.
   *
   * @param units
   */
  add(units: Partial<FleetState>): void {
    const state = this.state;
    if (units.buildPoints) {
      if (state.buildPoints + units.buildPoints < 0) {
        throw new GameStateError(`Would make buildPoints < 0`);
      }
      state.buildPoints += units.buildPoints;
    }
    if (units.missiles) {
      if (state.missiles + units.missiles < 0) {
        throw new GameStateError(`Would make missiles < 0`);
      }
      state.missiles += units.missiles;
    }
    if (units.stealthShips) {
      if (state.stealthShips + units.stealthShips < 0) {
        throw new GameStateError(`Would make stealthShips < 0`);
      }
      state.stealthShips += units.stealthShips;
    }
    if (units.transports) {
      if (state.transports + units.transports < 0) {
        throw new GameStateError(`Would make transports < 0`);
      }
      state.transports += units.transports;
    }
    if (units.troops) {
      if (state.troops + units.troops < 0) {
        throw new GameStateError(`Would make troops < 0`);
      }
      state.troops += units.troops;
    }
    if (units.warShips) {
      if (state.warShips + units.warShips < 0) {
        throw new GameStateError(`Would make warShips < 0`);
      }
      state.warShips += units.warShips;
    }
  }

  /**
   * Forks the fleet into a new state object.
   *
   * @param units
   */
  fork(units: Partial<FleetState>): FleetState {
    const result = {
      buildPoints: 0,
      missiles: 0,
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
    };
    this.add({
      buildPoints: units.buildPoints ? -units.buildPoints : 0,
      missiles: units.missiles ? -units.missiles : 0,
      stealthShips: units.stealthShips ? -units.stealthShips : 0,
      transports: units.transports ? -units.transports : 0,
      troops: units.troops ? -units.troops : 0,
      warShips: units.warShips ? -units.warShips : 0,
    });
    if (units.buildPoints) {
      result.buildPoints = units.buildPoints;
    }
    if (units.missiles) {
      result.missiles = units.missiles;
    }
    if (units.stealthShips) {
      result.stealthShips = units.stealthShips;
    }
    if (units.transports) {
      result.transports = units.transports;
    }
    if (units.troops) {
      result.troops = units.troops;
    }
    if (units.warShips) {
      result.warShips = units.warShips;
    }
    return result;
  }
}

export class Fleet extends Combatable {
  static create(state: Partial<FleetState>): Fleet {
    return new Fleet({
      buildPoints: state.buildPoints || 0,
      missiles: state.missiles || 0,
      stealthShips: state.stealthShips || 0,
      transports: state.transports || 0,
      troops: state.troops || 0,
      warShips: state.warShips || 0,
    });
  }

  constructor(readonly state: FleetState) {
    super();
    if (state.buildPoints + state.troops / 50 > state.transports) {
      throw new GameStateError(`Invalid Fleet. Not enough Transport capacity.`);
    }
  }

  /**
   * Whether the fleet is missiles only.
   */
  get isMissilesOnly(): boolean {
    return (
      this.state.missiles > 0 &&
      this.state.stealthShips === 0 &&
      this.state.warShips === 0 &&
      this.state.transports === 0
    );
  }

  public get totalShips(): number {
    return (
      this.state.missiles +
      this.state.stealthShips +
      this.state.transports +
      this.state.warShips
    );
  }

  get isDetectable(): boolean {
    return this.totalShips > 10;
  }

  protected get speedModifier(): number {
    return this.isMissilesOnly ? 2 : 1;
  }
}

/**
 * Type of fleet missions.
 */
export type Mission = 'conquest' | 'resource-raid' | 'probe';

/**
 * A fleet on its way to another system.
 */
export interface DispatchState extends FleetState, MoveState {
  /**
   * What the purpose of the movement/transit is.
   *
   * Undefined means the fleet is either stationary (if orbiting a
   * system) or being moved to a friendly location (e.g. not attacking).
   */
  readonly mission: Mission;
}

export class Dispatch extends Mixin(Fleet, Moveable) {
  constructor(public state: DispatchState) {
    super(state);
  }
}
