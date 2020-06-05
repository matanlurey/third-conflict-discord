import { Game } from '../game/state/game';
import { Player } from '../game/state/player';
import { System } from '../game/state/system';
import { CliGameHooks } from './reader';

/**
 * Adapts a game instance for @see {CliGameHooks}.
 *
 * @param game
 */
export default function (game: Game): CliGameHooks {
  return {
    player: (userId): Player | undefined => {
      return game.findPlayer(userId);
    },
    system: (system): System | undefined => {
      return game.findSystem(system);
    },
    closest: (player, target): System | undefined => {
      const friendly = player.filterSystems(game.systems);
      if (!friendly.length) {
        return;
      }
      let system!: System;
      let closest = Number.MAX_SAFE_INTEGER;
      for (const source of friendly) {
        const distance = source.position.distance(target.position);
        if (distance < closest) {
          closest = distance;
          system = source;
        }
      }
      return system;
    },
  };
}
