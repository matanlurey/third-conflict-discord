import { NewlyCreatedGame } from '../save';
import { DispatchState, ScoutState } from './fleet';
import { Player, PlayerState } from './player';
import { System, SystemState } from './system';

export interface GameState extends NewlyCreatedGame {
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
   * Current turn.
   */
  turn: number;
}

const userPrefix = 'PLAYER:';

export class Game {
  /**
   * Starts a new game session.
   *
   * @param settings
   * @param systems
   * @param players
   */
  static start(state: NewlyCreatedGame, players: PlayerState[]): Game {
    return new Game({
      seed: state.seed,
      settings: state.settings,
      systems: state.systems.map((s) => {
        if (s.owner.startsWith(userPrefix)) {
          const i = parseInt(s.owner.substring(userPrefix.length)) - 1;
          return {
            ...s,
            planets: s.planets.map((planet) => {
              return {
                ...planet,
                owner: players[i].userId,
              };
            }),
            owner: players[i].userId,
          };
        }
      }) as SystemState[],
      players,
      fleets: [],
      scouts: [],
      turn: 1,
    });
  }

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
