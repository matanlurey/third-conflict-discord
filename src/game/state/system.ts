import { Combatable, Dispatch, Fleet, FleetState, Scout } from './fleet';
import { Point, PointState } from './point';

/**
 * Possible production types.
 */
export type Production =
  | 'nothing'
  | 'warships'
  | 'stealthships'
  | 'transports'
  | 'missiles'
  | 'planets'
  | 'factories'
  | 'defenses';

/**
 * Possible mission types.
 */
export type Mission = 'conquest' | 'resource-raid' | 'probe' | 'move';

/**
 * Represents a system within the game session.
 */
export class System extends Combatable {
  static create(state: Partial<SystemState>): System {
    return new System({
      buildPoints: state.buildPoints || 0,
      missiles: state.missiles || 0,
      stealthShips: state.stealthShips || 0,
      transports: state.transports || 0,
      troops: state.troops || 0,
      warShips: state.warShips || 0,
      defenses: state.defenses || 0,
      factories: state.factories || 0,
      home: state.home || false,
      name:
        state.name ||
        ((): never => {
          throw new Error(`Name required.`);
        })(),
      owner:
        state.owner ||
        ((): never => {
          throw new Error(`Owner required.`);
        })(),
      planets: state.planets || [],
      position:
        state.position ||
        ((): never => {
          throw new Error(`Position required.`);
        })(),
      production: 'warships',
    });
  }

  constructor(public readonly state: SystemState) {
    super();
  }

  get capableOfDefensiveMissileFire(): boolean {
    return this.state.defenses >= 50;
  }

  get isEliminated(): boolean {
    return super.isEliminated && this.state.defenses === 0;
  }

  /**
   * Position of the system.
   */
  get position(): Point {
    return new Point(this.state.position);
  }

  /**
   * Range of detecting incoming fleets/missiles.
   *
   * Detection range is 4 + 1 for every additional 25 increment.
   */
  get detectionRange(): number {
    // TODO: Adjust detection ranges?
    const defenses = this.state.defenses;
    if (defenses < 25) {
      return 0;
    }
    const additional = Math.floor((defenses - 25) / 25);
    return 4 + additional;
  }

  /**
   * Changes the build production unit.
   *
   * @param produce
   */
  change(produce: Production): void {
    this.state.production = produce;
  }

  /**
   * Sends an attack mission to the target system.
   *
   * @param target
   * @param source
   * @param units
   * @param mission
   */
  attack(
    source: System,
    target: System,
    units: Fleet,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mission: Mission,
  ): Dispatch {
    const move = source.fork(units.state);
    return new Dispatch({
      ...move,
      owner: source.state.owner,
      source: source.state.name,
      distance: source.position.distance(target.position),
      mission: 'conquest',
      target: target.state.name,
    });
  }

  /**
   * Sends a reinforcement mission to the target system.
   *
   * @param target
   * @param units
   */
  moveTo(target: System, units: Fleet): Dispatch {
    throw `UNIMPLEMENTED: ${target} ${units}`;
  }

  /**
   * Sends a scout unit to the target system.
   *
   * @param target
   */
  scout(
    target: System,
    source: System,
    kind: 'warship' | 'stealthship',
  ): Scout {
    return new Scout({
      distance: source.position.distance(target.position),
      owner: source.state.owner,
      scout: kind,
      source: source.state.name,
      target: target.state.name,
    });
  }

  /**
   * Adds troops to planets.
   */
  recruit(): void {
    this.state.planets.forEach((p) => {
      p.troops = Math.min(1000, p.troops + p.recruit);
    });
  }

  produce(options: { buildPlanet: (owner: string) => PlanetState }): void {
    const state = this.state;
    const morale = this.morale;
    const factories = state.factories;

    const perTurn = factories > 0 ? factories + morale : 0;
    const available = state.buildPoints + perTurn;

    // Returns how many can be built at the provided cost.
    //
    // Automatically adds the remainder to the build points for next turn.
    function asManyAsPossible(cost: number): number {
      const remainder = available % cost;
      state.buildPoints = remainder;
      return Math.floor(available / cost) || 0;
    }

    switch (state.production) {
      case 'warships':
        state.warShips += asManyAsPossible(1);
        return;
      case 'stealthships':
        state.stealthShips += asManyAsPossible(3);
        return;
      case 'transports':
        state.transports += asManyAsPossible(3);
        return;
      case 'missiles':
        state.missiles += asManyAsPossible(2);
        return;
      case 'defenses':
        state.defenses += asManyAsPossible(1);
        return;
      case 'planets':
        if (state.planets.length >= 10) {
          break;
        }
        const buildPlanets = asManyAsPossible(100);
        for (let i = 0; i < buildPlanets; i++) {
          state.planets.push(options.buildPlanet(state.owner));
        }
        return;
      case 'factories':
        if (state.factories >= 50) {
          break;
        }
        state.factories += asManyAsPossible(Math.max(1, state.factories) * 3);
        return;
    }

    state.buildPoints += perTurn;
  }

  /**
   * Returns the system morale for the system.
   */
  get morale(): number {
    if (this.state.planets.length === 0) {
      // TODO: Is this right?
      return 0;
    }
    let sum = 0;
    for (let i = 0; i < this.state.planets.length; i++) {
      const planet = this.state.planets[i];
      const morale = planet.morale;
      const owned = planet.owner === this.state.owner;
      if (owned) {
        sum += morale;
      } else {
        sum += -Math.abs(morale);
      }
    }
    return Math.round(sum / this.state.planets.length);
  }
}

export interface PlanetState {
  /**
   * Who owns this planet.
   */
  owner: string;

  /**
   * How happy the planet is.
   *
   * "Normal" is 1, maximum is 5. Civil wars and revolutions are likely once
   * below -3, to a maximum of -5. The minimum garrison to prevent issues is
   * `3 * PRODUCTION + 3 * -MORALE.
   */
  morale: number;

  /**
   * How many troops are recruited per turn.
   *
   * This number is meant to represent (roughly) the population of the planet
   * and can be reduced permanently due to bombardment. Most planets will have
   * a recruitment amount of around 4, with 10 as the max and 1 as the minimum.
   */
  recruit: number;

  /**
   * Number of troops occupying the planet.
   */
  troops: number;
}

export interface SystemState extends FleetState {
  /**
   * Name of the system.
   */
  readonly name: string;

  /**
   * Position of the system.
   */
  readonly position: PointState;

  /**
   * Planets attached to the Sector.
   *
   * Each star can have up to 10 planets. Planets are the only places you can
   * recruit Troops, and must be invaded (with Troops) before you control them.
   * Planets may ve wrecked, but this has a terrible effect on morale.
   */
  readonly planets: PlanetState[];

  /**
   * Player that controls the system.
   */
  owner: string;

  /**
   * This is a home system.
   */
  home: boolean;

  /**
   * Stationary organizations that defend star systems against attack.
   *
   * Computers, detectors, planet-based short-range missiles, patrol boats, and
   * energy weapons in fixed orbits. Defenses become more deadly in large
   * numbers - 200 or more can be formidable. Up to 50 defenses can be built
   * for every planet you control in a system.
   *
   * You need at least 25 defenses to detect enemy fleets.
   */
  defenses: number;

  /**
   * Orbital facilities that construct mobile military units.
   *
   * You may have up to 50 factories in a single star system. Factories can also
   * produce more factories - but this takes 3 turns. Other than factories in
   * your "home" system, each factory can produce between 1 and 3 units each
   * turn.
   *
   * Each turn, one point is generated for each factory, and the system's
   * curent morale is then added, and the total is the number of build points
   * available that turn for construction in that system.
   *
   * If you have leftover points after new units are built, they are saved for
   * next turn's production phase.
   */
  factories: number;

  /**
   * Excess build points reserve.
   */
  buildPoints: number;

  /**
   * What unit type is currently being built.
   */
  production: Production;
}
