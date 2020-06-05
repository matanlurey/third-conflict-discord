import { DispatchState, ScoutState } from './fleet';
import { Player, PlayerState } from './player';
import { Settings } from './settings';
import { System, SystemState } from './system';

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

  /**
   * Returns the first system that matches the name or initial.
   *
   * @param nameOrInitial
   */
  findSystem(nameOrInitial: string): System | undefined {
    const match =
      nameOrInitial.length === 1
        ? (input: string): boolean => input[0] === nameOrInitial
        : (input: string): boolean => input === nameOrInitial;

    for (const system of this.state.systems) {
      if (match(system.name)) {
        return new System(system);
      }
    }
  }

  /**
   * Returns the player that matches the user ID.
   *
   * @param userId
   */
  findPlayer(userId: string): Player | undefined {
    for (const player of this.state.players) {
      if (player.userId === userId) {
        return new Player(player);
      }
    }
  }

  get systems(): System[] {
    return this.state.systems.map((s) => new System(s));
  }
}
