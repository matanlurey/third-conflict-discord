/* eslint-disable @typescript-eslint/no-unused-vars */
import { Player } from './state/player';
import { System } from './state/system';

export class RandomEvents {
  independenceMovementStrikes(system: System): void {
    // TODO: Pick a random >0 morale planet, reduce morale by 2.
  }

  rousingSpeech(player: Player): void {
    // Increase morale by 1 at every planet controlled (?).
  }

  technologicalBreakthrough(system: System): void {
    // TODO: Pick a random >0 morale planet, increase production by N.
  }
}

// Scout reaches System X.
