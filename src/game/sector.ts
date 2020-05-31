import { Ratings } from './combat';

export interface InTransitFleet {
  /**
   * Contents of the fleet.
   */
  contents: Fleet;

  /**
   * Who owns the fleet.
   */
  owner: number;

  /**
   * Origin of the fleet (if recalled).
   */
  origin: string;

  /**
   * Destination (system) of the fleet.
   */
  destination: string;

  /**
   * Distance remaining until the destination is reached.
   */
  distance: number;

  /**
   * What the purpose of the movement/transit is.
   *
   * Undefined means the fleet is either stationary (if orbiting a
   * system) or being moved to a friendly location (e.g. not attacking).
   */
  mission?: Mission;
}

export type Mission = 'Conquest' | 'Resource Raid' | 'Probe';

export interface Fleet {
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

export function createFleet(has: Partial<Fleet>): Fleet {
  return {
    buildPoints: has.buildPoints || 0,
    missiles: has.missiles || 0,
    stealthShips: has.stealthShips || 0,
    transports: has.transports || 0,
    troops: has.troops || 0,
    warShips: has.warShips || 0,
  };
}

export interface System {
  /**
   * Name of the star.
   */
  name: string;

  /**
   * Who controls the Star.
   */
  owner: number;

  /**
   * Whether this is the home system of the @see {owner}.
   */
  home: boolean;

  /**
   * X and Y coordinate of the Star.
   */
  position: Coordinate;

  /**
   * Planets attached to the Sector.
   *
   * Each star can have up to 10 planets. Planets are the only places you can
   * recruit Troops, and must be invaded (with Troops) before you control them.
   * Planets may ve wrecked, but this has a terrible effect on morale.
   */
  planets: Planet[];

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
   * Friendly fleet (i.e. the fleet of the owner) in the system.
   */
  orbiting: Fleet;

  /**
   * What unit type is currently being built.
   *
   * A value of undefined means build points are being reserved.
   */
  building?:
    | 'WarShips'
    | 'StealthShips'
    | 'Transports'
    | 'Missiles'
    | 'Planets'
    | 'Factories'
    | 'Defenses';
}

export type Coordinate = [number, number];

export interface Planet {
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

export interface Player {
  /**
   * Unique ID of the player.
   *
   * An undefined value means that the player is not human controlled.
   */
  readonly userId?: string;

  /**
   * Screen name of the player.
   */
  readonly name: string;

  /**
   * Whether the player has ended the current turn.
   */
  didEndTurn: boolean;

  /**
   * Chance of attack hitting in a fleet (nava) or planetary (ground) combat.
   */
  readonly combatRatings: Ratings;

  // TODO: Add Fog of War.
}
