import { Mixin } from 'ts-mixer';

export interface MoveState {
  /**
   * Who owns the scout.
   */
  readonly owner: string;

  /**
   * Origin of the unit (if recalled).
   */
  readonly source: string;

  /**
   * Destination (system) of the unit.
   */
  readonly target: string;

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

export class Fleet {
  constructor(readonly state: FleetState) {}

  /**
   * Adds unit to the fleet.
   *
   * @param units
   */
  add(units: Partial<FleetState>): void {
    const state = this.state;
    if (units.buildPoints) {
      state.buildPoints += units.buildPoints;
    }
    if (units.missiles) {
      state.missiles += units.missiles;
    }
    if (units.stealthShips) {
      state.stealthShips += units.stealthShips;
    }
    if (units.transports) {
      state.transports += units.transports;
    }
    if (units.troops) {
      state.troops += units.troops;
    }
    if (units.warShips) {
      state.warShips += units.warShips;
    }
  }

  /**
   * Forks the fleet into a new state object.
   *
   * @param units
   */
  fork(units: Partial<FleetState>): FleetState {
    const state = this.state;
    const result = {
      buildPoints: 0,
      missiles: 0,
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
    };
    if (units.buildPoints) {
      state.buildPoints -= units.buildPoints;
      result.buildPoints = units.buildPoints;
    }
    if (units.missiles) {
      state.missiles -= units.missiles;
      result.buildPoints = units.missiles;
    }
    if (units.stealthShips) {
      state.stealthShips -= units.stealthShips;
      result.stealthShips = units.stealthShips;
    }
    if (units.transports) {
      state.transports -= units.transports;
      result.transports = units.transports;
    }
    if (units.troops) {
      state.troops -= units.troops;
      result.troops = units.troops;
    }
    if (units.warShips) {
      state.warShips -= units.warShips;
      result.warShips = units.warShips;
    }
    return result;
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

  protected get speedModifier(): number {
    return this.isMissilesOnly ? 2 : 1;
  }
}
