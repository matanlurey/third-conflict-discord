import { Chance } from 'chance';
import { GameStateError } from '../../cli/reader';
import { Conquest } from '../combat/naval';
import { NewlyCreatedGame } from '../save';
import { Dispatch, DispatchState, Scout, ScoutState } from './fleet';
import { Player, PlayerState } from './player';
import { CombatReport } from './report';
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

  private readonly onTurnCallbacks: (() => void)[] = [];

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
    this.clearLastTurnReports();
    this.endTurnMovementAndCombat();
    this.endTurnProduce();
    this.endTurnRecruit();
    this.endTurnRandomEvent();
    this.endTurnMoraleAndRevolt();
    this.endTurnIncrementAndMaybeEndGame();
    this.pushTurnEnded();
  }

  private clearLastTurnReports(): void {
    this.players.forEach((p) => p.clearReports());
  }

  onTurnEnded(callback: () => void): void {
    this.onTurnCallbacks.push(callback);
  }

  private pushTurnEnded(): void {
    this.onTurnCallbacks.forEach((c) => c());
  }

  private endTurnIncrementAndMaybeEndGame(): void {
    this.state.turn++;
    // TODO: End game?
  }

  private endTurnMovementAndCombat(): void {
    this.moveScouts();
    this.moveFleets();
  }

  private moveScouts(): void {
    const settings = this.state.settings;
    Array.from(this.scouts)
      .reverse()
      .forEach((scout, i) => {
        scout.move(settings.shipSpeedATurn);
        if (scout.hasReachedTarget) {
          const target = this.mustSystem(scout.state.target);
          if (scout.shouldReveal(target)) {
            // Reveal.
            const source = this.mustSystem(scout.state.source);
            this.revealSystem(scout);
            scout.recall(target.position.distance(source.position));
            if (scout.state.scout === 'warship') {
              const scouter = this.mustPlayer(scout.state.owner);
              const scoutee = this.mustPlayer(target.state.owner);
              scouter.reportScouted(target);
              scoutee.reportScoutedBy(target, scouter);
            }
          } else {
            // Return.
            if (scout.state.scout === 'warship') {
              target.state.warShips++;
            } else {
              target.state.stealthShips++;
            }
            this.state.scouts.splice(i, 1);
          }
        }
      });
  }

  private moveFleets(): void {
    const settings = this.state.settings;
    Array.from(this.fleets)
      .reverse()
      .forEach((fleet, i) => {
        fleet.move(settings.shipSpeedATurn);
        if (fleet.hasReachedTarget) {
          // TODO: Recall/Gift/Etc.
          this.state.fleets.splice(i, 1);
          this.resolveCombatOrMovement(fleet);
        } else {
          this.detectIncoming(fleet, this.mustSystem(fleet.state.target));
        }
      });
  }

  private revealSystem(dueTo: Scout | Dispatch): void {
    const target = this.mustSystem(dueTo.state.target);
    const player = this.mustPlayer(dueTo.state.owner);
    player.state.fogOfWar[dueTo.state.target] = {
      updated: this.state.turn + 1,
      system: {
        name: target.state.name,
        position: target.state.position,
        defenses: target.state.defenses,
        factories: target.state.factories,
        missiles: target.state.missiles,
        stealthShips: target.state.stealthShips,
        transports: target.state.transports,
      },
    };
  }

  private resolveCombatOrMovement(fleet: Dispatch): void {
    if (fleet.state.mission === 'reinforce') {
      return this.resolveMoveFinished(fleet);
    }
    if (fleet.state.mission === 'conquest') {
      const conquest = new Conquest(new Chance(this.state.seed));
      const attacker = this.mustPlayer(fleet.state.owner);
      const system = this.mustSystem(fleet.state.target);
      const defender = this.mustPlayer(system.state.owner);
      const result = conquest.simulate(
        {
          fleet,
          rating: attacker.state.ratings.naval,
        },
        {
          system,
          rating: defender.state.ratings.naval,
        },
      );
      // Report Attack.
      const report: CombatReport = {
        attacker: true,
        kind: 'combat',
        system: fleet.state.target,
        mission: 'conquest',
        result,
      };
      attacker.state.reports.push(report);
      defender.state.reports.push({
        ...report,
        attacker: false,
      });
      if (result.winner === 'attacker') {
        this.transferOwnership(attacker, system);
      }
    } else {
      throw new GameStateError(
        `Unsupported mission: "${fleet.state.mission}".`,
      );
    }
  }

  private resolveMoveFinished(fleet: Dispatch): void {
    const target = this.mustSystem(fleet.state.target);
    target.add(fleet.state);
  }

  private transferOwnership(to: Player, target: System): void {
    target.state.owner = to.state.userId;
  }

  private detectIncoming(from: Dispatch, target: System): void {
    console.log('detectIncoming', {
      isDetectable: from.isDetectable,
      detectionRange: target.detectionRange,
      distance: from.state.distance,
    });
    if (!from.isDetectable) {
      return;
    }
    if (target.detectionRange >= from.state.distance) {
      this.mustPlayer(target.state.owner).reportIncoming(
        from,
        this.state.settings.shipSpeedATurn,
      );
    }
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

  mustSystem(nameOrInitial: string): System {
    const result = this.findSystem(nameOrInitial);
    if (!result) {
      throw new GameStateError(`No system named "${nameOrInitial}".`);
    }
    return result;
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

  mustPlayer(userId: string): Player {
    const result = this.findPlayer(userId);
    if (!result) {
      throw new GameStateError(`No player with ID "${userId}".`);
    }
    return result;
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
