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
    closest: (player, target, options): System | undefined => {
      return game.findClosest(player, target, options?.not);
    },
  };
}
