import { DispatchState, ScoutState } from './fleet';
import { PlayerState } from './player';
import { Settings } from './settings';
import { SystemState } from './system';

export interface GameState {
  /**
   * Players in the game.
   */
  readonly players: PlayerState[];

  /**
   * Fleets (moving) in the game.
   */
  readonly fleets: DispatchState[];

  /**
   * Scouts (moving) in the game.
   */
  readonly scouts: ScoutState[];

  /**
   * Systems in the game.
   */
  readonly systems: SystemState[];

  /**
   * Settings in the game.
   */
  readonly settings: Settings;

  /**
   * Current turn.
   */
  turn: number;
}

export class Game {
  constructor(public readonly state: GameState) {}
}
