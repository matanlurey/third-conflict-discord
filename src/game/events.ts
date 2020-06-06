/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dispatch } from './state/fleet';
import { Player } from './state/player';
import { System } from './state/system';

export class Events {
  antiPlayerMovementStrikes(system: System): void {
    // TODO: Pick a random system, reduce all planets by 2, to at least -1.
  }

  computeErrorCourseChanged(fleet: Dispatch): void {
    // TODO: Pick a random fleet, change course.
  }

  epidemicStrikes(system: System): void {
    // TODO: Pick a random system/planet, kill N (a lot) of troops.
  }

  enemyPropogandaLowersMorale(player: Player): void {
    // TOOD: Lower morale across the sector (?)
  }

  fleetStrikesIonStorm(fleet: Dispatch): void {
    // TODO: Destroy a random amount of ships in the fleet.
  }

  imperialReinforcement(system: System): void {
    // TODO: The Emperor reinforces SYSTEM with N Warships, N StealthShips, N Missiles, N Troops, N Defenses.
  }

  independenceMovementStrikes(system: System): void {
    // TODO: Pick a random >0 morale planet, reduce morale by 2, to at least -1.
  }

  industrialAccident(system: System): void {
    // TODO: Pick a random system/planet, reduce production.
    // "Industrial accident lowers production on planet N of S"
  }

  rousingSpeech(player: Player): void {
    // Increase morale by 1 at every planet controlled (?).
  }

  supportsInTheEmpire(system: System): void {
    // Pick the lowest rank player and send reinforcements.
    // "Supports in the Empire send a fleet of 21 WarShips, 3 StealthShips, 3 Transports, 8 Missiles to System".
  }

  technologicalBreakthrough(system: System): void {
    // TODO: Pick a random >0 morale planet, increase production by N.
  }

  technologicalBreakthroughNewFactory(system: System): void {
    // "A technilogical breakthrough at S creates a new factory"
  }
}

// Scout reaches System X.
