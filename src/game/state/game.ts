import { NewlyCreatedGame } from '../save';
import { Dispatch, DispatchState, Scout, ScoutState } from './fleet';
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
    if (players.length < 1) {
      throw new Error(`Invalid game: At least one player required.`);
    }
    const systems = state.systems.map((s) => {
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
      } else {
        return s;
      }
    }) as SystemState[];
    players.splice(0, 0, this.createEmpire());
    return new Game({
      seed: state.seed,
      settings: state.settings,
      systems,
      players,
      fleets: [],
      scouts: [],
      turn: 1,
    });
  }

  private static createEmpire(): PlayerState {
    return {
      fogOfWar: {},
      name: 'Empire',
      userId: 'Empire',
      ratings: { naval: 50, ground: 50 },
      reports: [],
      endedTurn: true,
    };
  }

  constructor(public readonly state: GameState) {}

  endTurn(player: Player): void {
    player.state.endedTurn = true;
    this.checkNextTurn();
  }

  private checkNextTurn(): void {
    if (this.players.every((p) => p.state.endedTurn)) {
      this.computeNextTurn();
    }
  }

  private computeNextTurn(): void {
    this.endTurnMovementAndCombat();
    this.endTurnProduce();
    this.endTurnRecruit();
    this.endTurnRandomEvent();
    this.endTurnMoraleAndRevolt();
    this.endTurnIncrementAndMaybeEndGame();
  }

  private endTurnIncrementAndMaybeEndGame(): void {
    this.state.turn++;
    this.players.forEach((p) => p.clearReports());
    // TODO: End game?
  }

  private endTurnMovementAndCombat(): void {
    const settings = this.state.settings;
    Array.from(this.scouts)
      .reverse()
      .forEach((s, i) => {
        s.move(settings.shipSpeedATurn);
        if (s.hasReachedTarget) {
          this.state.scouts.splice(i, 1);
          this.revealSystem(s);
        }
      });
    Array.from(this.fleets)
      .reverse()
      .forEach((s, i) => {
        s.move(settings.shipSpeedATurn);
        if (s.hasReachedTarget) {
          this.state.fleets.splice(i, 1);
          this.resolveCombat(s);
        }
      });
  }

  private revealSystem(dueTo: Scout | Dispatch): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const target = this.findSystem(dueTo.state.target)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const player = this.findPlayer(dueTo.state.owner)!;
    player.state.fogOfWar[dueTo.state.target] = {
      updated: this.state.turn,
      system: {
        defenses: target.state.defenses,
        factories: target.state.factories,
        missiles: target.state.missiles,
        stealthShips: target.state.stealthShips,
        transports: target.state.transports,
        troops: target.state.troops,
      },
    };
    player.state.reports.push({
      kind: 'intel',
      system: target.state.name,
    });
  }

  private resolveCombat(where: Dispatch): void {
    // TODO: Implement.
    throw `Unimplemented: ${where}.`;
  }

  private endTurnProduce(): void {
    this.systems.forEach((s) =>
      s.produce({
        buildPlanet: () => {
          throw `Unimplemented: buildPlanet`;
        },
      }),
    );
  }

  private endTurnRecruit(): void {
    this.systems.forEach((s) => s.recruit());
  }

  private endTurnRandomEvent(): void {
    // TODO: Implement.
  }

  private endTurnMoraleAndRevolt(): void {
    // TODO: Implement.
  }

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

  get fleets(): Dispatch[] {
    return this.state.fleets.map((s) => new Dispatch(s));
  }

  get scouts(): Scout[] {
    return this.state.scouts.map((s) => new Scout(s));
  }

  get systems(): System[] {
    return this.state.systems.map((s) => new System(s));
  }

  get players(): Player[] {
    return this.state.players.map((s) => new Player(s));
  }
}
