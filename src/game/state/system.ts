import { Response } from '../../response';
import { Fleet } from '../sector';
import { PlayerState } from './player';
import { PointState } from './point';

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
export class System {
  /**
   * The player that owns the system.
   */
  get owner(): PlayerState {
    throw `UNIMPLEMENTED`;
  }

  /**
   * Changes the build production unit.
   *
   * @param produce
   */
  produce(produce: Production): Response {
    throw `UNIMPLEMENTED: ${produce}`;
  }

  /**
   * Sends an attack mission to the target system.
   *
   * @param target
   * @param units
   * @param mission
   */
  attack(target: SystemState, units: Fleet, mission: Mission): Response {
    throw `UNIMPLEMENTED: ${target} ${units} ${mission}`;
  }

  /**
   * Sends a reinforcement mission to the target system.
   *
   * @param target
   * @param units
   */
  moveTo(target: SystemState, units: Fleet): Response {
    throw `UNIMPLEMENTED: ${target} ${units}`;
  }

  /**
   * Sends a scout unit to the target system.
   *
   * @param target
   */
  scout(target: SystemState): Response {
    throw `UNIMPLEMENTED: ${target}`;
  }
}

export interface PlanetState {
  /**
   * Who owns this planet.
   *
   * A value of `0` is a neutral (Empire) planet.
   */
  owner: number;

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

export interface SystemState {
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
