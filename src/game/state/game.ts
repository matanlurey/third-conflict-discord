import { Chance } from 'chance';
import fs from 'fs-extra';
import path from 'path';
import { CliMessenger, GameStateError } from '../../cli/reader';
import { UI } from '../../ui/interface';
import { EmpireAI } from '../ai/empire';
import { determineGroundResults } from '../combat/ground';
import { Conquest } from '../combat/naval';
import { Events } from '../events';
import { NewlyCreatedGame } from '../save';
import { Dispatch, DispatchState, Fleet, Scout, ScoutState } from './fleet';
import { Player, PlayerState } from './player';
import { CombatReport } from './report';
import { PlanetState, Production, System, SystemState } from './system';

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
  static start(
    state: NewlyCreatedGame,
    players: PlayerState[],
    autoSaveDiagnostics?: boolean,
  ): Game {
    if (players.length < 1) {
      throw new Error(`Invalid game: At least one player required.`);
    } else {
      const chance = new Chance(state.seed);
      chance.shuffle(players);
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
    return new Game(
      {
        seed: state.seed,
        settings: state.settings,
        systems,
        players,
        fleets: [],
        scouts: [],
        turn: 1,
      },
      autoSaveDiagnostics,
    );
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
  private readonly events?: Events;
  private readonly ai?: EmpireAI;

  public readonly chance: Chance.Chance;

  constructor(
    public readonly state: GameState,
    private readonly autoSaveDiagnostics = false,
  ) {
    this.chance = new Chance(state.seed);
    if (state.settings.enableRandomEvents) {
      this.events = new Events(this.chance, this);
    }
    if (state.settings.enableEmpireBuilds) {
      this.ai = new EmpireAI(this.chance, this);
    }
  }

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
    if (this.autoSaveDiagnostics) {
      fs.writeJsonSync(path.join('data', 'temp.json'), this.state, {
        spaces: 2,
      });
    }
    this.clearLastTurnReports();
    this.endTurnMoraleAndRevolt();
    this.endTurnRandomEvent();
    this.endTurnMovementAndCombat();
    this.endTurnAI();
    this.endTurnProduce();
    this.endTurnRecruit();
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
    this.players.forEach((p) => {
      if (!p.isAI) {
        p.state.endedTurn = false;
      }
    });
  }

  private endTurnMovementAndCombat(): void {
    this.moveScouts();
    this.moveFleets();
  }

  private endTurnAI(): void {
    this.ai?.runAI();
  }

  private moveScouts(): void {
    const settings = this.state.settings;
    const toRemove: number[] = [];
    Array.from(this.scouts).forEach((scout, i) => {
      scout.move(settings.shipSpeedATurn);
      if (scout.hasReachedTarget) {
        const target = this.mustSystem(scout.state.target);
        if (scout.shouldReveal(target)) {
          // Reveal.
          const source = this.mustSystem(scout.state.source);
          this.revealSystem(scout);
          scout.recall(target.position.distance(source.position));
          const scouter = this.mustPlayer(scout.state.owner);
          scouter.reportScouted(target);
          if (scout.state.scout === 'warship') {
            const scoutee = this.mustPlayer(target.state.owner);
            scoutee.reportScoutedBy(target, scouter);
          }
        } else {
          // Return.
          if (scout.state.scout === 'warship') {
            target.state.warShips++;
          } else {
            target.state.stealthShips++;
          }
          toRemove.push(i);
        }
      }
    });
    toRemove.reverse().forEach((i) => {
      this.state.scouts.splice(i, 1);
    });
  }

  private moveFleets(): void {
    const settings = this.state.settings;
    const toRemove: number[] = [];
    Array.from(this.fleets).forEach((fleet, i) => {
      fleet.move(settings.shipSpeedATurn);
      const target = this.mustSystem(fleet.state.target);
      if (
        fleet.state.mission === 'reinforce' &&
        target.state.owner !== fleet.state.owner
      ) {
        this.recallUnit(fleet);
      } else if (fleet.hasReachedTarget) {
        // TODO: Gif.
        toRemove.push(i);
        this.resolveCombatOrMovement(fleet);
      } else {
        this.detectIncoming(fleet, target);
      }
    });
    toRemove.reverse().forEach((i) => {
      this.state.fleets.splice(i, 1);
    });
  }

  findClosest(
    player: Player,
    target: System,
    not?: System,
  ): System | undefined {
    const friendly = player.filterSystems(this.systems);
    if (!friendly.length) {
      return;
    }
    let system: System | undefined;
    let closest = Number.MAX_SAFE_INTEGER;
    for (const source of friendly) {
      if (not && not.state.name === source.state.name) {
        continue;
      }
      const distance = source.position.distance(target.position);
      if (distance < closest) {
        closest = distance;
        system = source;
      }
    }
    return system;
  }

  recallUnit(unit: Dispatch | Scout): void {
    const source = this.mustSystem(unit.state.source);
    const owner = unit.state.owner;
    let target = source;
    if (source.state.owner !== owner) {
      const find = this.findClosest(this.mustPlayer(owner), source, source);
      if (!find) {
        throw new GameStateError(
          `Could not recall - you have no more systems!`,
        );
      } else {
        target = find;
      }
    }
    unit.recall(target.position.distance(source.position));
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
        warShips: target.state.warShips,
        transports: target.state.transports,
      },
    };
  }

  private resolveCombatOrMovement(fleet: Dispatch): void {
    if (fleet.state.mission === 'reinforce') {
      return this.resolveMoveFinished(fleet);
    }
    if (fleet.state.mission === 'conquest') {
      const conquest = new Conquest(this.chance);
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
      // Modify Ratings.
      if (result.winner === 'attacker') {
        attacker.wonCombat('naval');
        defender.lostCombat('naval');
      } else if (result.winner === 'defender') {
        attacker.lostCombat('naval');
        defender.wonCombat('naval');
      }
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
        this.transferOwnership(attacker, system, fleet);
      }
      if (attacker.isAI && system.state.troops) {
        // TODO: Invade.
      }
    } else {
      throw new GameStateError(
        `Unsupported mission: "${fleet.state.mission}".`,
      );
    }
  }

  invade(
    target: System,
    planet: number,
    amount: number,
    messenger: CliMessenger,
    ui: UI,
  ): void {
    if (planet === 0) {
      // Need at least N troops.
      const toInvade = target.state.planets.filter(
        (p) => p.owner !== target.state.owner,
      );
      const planets = toInvade.length;
      if (planets === 0) {
        throw new GameStateError(`No planets to invade.`);
      }
      if (amount < planets) {
        throw new GameStateError(`Not enough troops to automatically invade.`);
      }
      const each = Math.floor(amount / planets);
      toInvade.forEach((p, i) =>
        this.invadePlanet(target, p, i, each, messenger, ui),
      );
    } else {
      const index = planet - 1;
      const state = target.state.planets[index];
      if (state === undefined) {
        throw new GameStateError(
          `No planet #${planet} in ${target.state.name}.`,
        );
      }
      if (state.owner === target.state.owner) {
        throw new GameStateError(
          `Cannot invade a friendly planet ("did you mean "unload"?).`,
        );
      }
      this.invadePlanet(target, state, index, amount, messenger, ui);
    }
  }

  private invadePlanet(
    target: System,
    planet: PlanetState,
    index: number,
    troops: number,
    messenger: CliMessenger,
    ui: UI,
  ): void {
    // Reduce attacking troop strength immediately.
    target.state.troops -= troops;

    // Determine results.
    const attacker = this.mustPlayer(target.state.owner);
    const defender = this.mustPlayer(planet.owner);
    const chance = this.chance;
    const results = determineGroundResults(
      {
        troops,
        rating: attacker.state.ratings.ground,
      },
      {
        troops: planet.troops,
        rating: defender.state.ratings.ground,
      },
      chance,
    );

    if (results.winner === 'attacker') {
      attacker.wonCombat('ground');
      defender.lostCombat('ground');
    } else if (results.winner === 'defender') {
      attacker.lostCombat('ground');
      defender.wonCombat('ground');
    }

    if (results.winner === 'attacker') {
      messenger.message(
        attacker.state.userId,
        ui.invadedPlanet(target, index, results.attacker),
      );
      planet.morale = -planet.morale;
      planet.troops = results.attacker;
      planet.owner = attacker.state.userId;
    } else {
      messenger.message(
        attacker.state.userId,
        ui.defendedPlanet(target, index, results.defender),
      );
    }
  }

  private resolveMoveFinished(fleet: Dispatch): void {
    const target = this.mustSystem(fleet.state.target);
    target.add(fleet.state);
  }

  private transferOwnership(to: Player, target: System, fleet?: Fleet): void {
    target.state.owner = to.state.userId;
    if (fleet) {
      target.add(fleet.state);
    }
  }

  private detectIncoming(from: Dispatch, target: System): void {
    if (!from.isDetectable) {
      return;
    }
    if (target.detectionRange >= from.state.distance) {
      this.mustPlayer(target.state.owner).reportIncoming(
        from,
        this.state.settings.shipSpeedATurn,
        this.chance,
      );
    }
  }

  private endTurnProduce(): void {
    this.systems.forEach((s) => {
      const p = this.mustPlayer(s.state.owner);
      if (p.isAI) {
        this.empireBuilds(s);
      } else {
        s.produce({
          buildPlanet: () => {
            return this.createPlanet(s.state.owner, s.morale);
          },
        });
      }
    });
  }

  private empireBuilds(system: System): void {
    if (!this.state.settings.enableEmpireBuilds) {
      return;
    }
    if (this.state.settings.enableNoviceMode) {
      system.change('warships');
    } else {
      const chance = this.chance;
      const target = chance.weighted(
        ['warships', 'stealthships', 'defenses', 'missiles'],
        [5, 3, 3, 2],
      ) as Production;
      system.change(target);
      system.produce({
        buildPlanet: () => {
          return this.createPlanet(system.state.owner, system.morale);
        },
        buildRatio: 0.5,
      });
    }
    // TODO: Randomly attack stuff?
  }

  private endTurnRecruit(): void {
    this.systems.forEach((s) => s.recruit());
  }

  private endTurnRandomEvent(): void {
    this.events?.maybeAffectPlayers(this.players);
  }

  private endTurnMoraleAndRevolt(): void {
    this.systems.forEach((s) => {
      const player = this.mustPlayer(s.state.owner);
      if (player.isAI) {
        return;
      }
      if (s.isGarrisonMet()) {
        s.adjustMorale(1, { max: 1 });
      } else {
        player.reportUnrest(s);
        s.adjustMorale(-1);
      }
      let enablePrivateers = false;
      s.state.planets.forEach((p, i) => {
        if (p.owner === s.state.owner) {
          if (s.isGarrisonMet(p)) {
            s.adjustMorale(1, { planet: p, max: 1 });
          } else {
            player.reportUnrest(s, { planet: i });
            s.adjustMorale(-1, { planet: p });
          }
        } else {
          player.reportUnrest(s, { planet: i });
          s.adjustMorale(-1, { planet: p });
          // At least one planet is not captured.
          enablePrivateers = true;
        }
      });
      if (enablePrivateers) {
        this.unrestPrivateers(player, s);
      } else {
        s.state.privateers = 0;
      }
    });
  }

  /**
   * Privateers are planet-based raiders and saboteurs.
   *
   * Capture WarShips in an attempt to overthrow your rule, gaining strength
   * each turn (e.g. as morale drops). The only way to guard against privateers
   * is to secure all planets in a system.
   *
   * Damage is based on:
   * - Number of WarShips you have.
   * - Number of Planets there.
   * - Number of Ships previously captured.
   * - Difficulty Setting.
   *
   * @param player
   * @param system
   */
  private unrestPrivateers(player: Player, system: System): void {
    // Capture WarShips.
    // Easy  = up to ~3%
    // Hard  = up to ~5%
    // Tough = up to ~10%
    const chance = this.chance;
    if (system.state.warShips) {
      const percent = 0.05;
      const capture = chance.integer({
        min: Math.max(1, 0.01 * system.state.warShips),
        max: Math.max(1, percent * system.state.warShips),
      });
      if (capture > 0) {
        system.add({ warShips: -capture });
        system.state.privateers += capture;
        player.reportPrivateers(system, capture);
      }
    }
    let rating;
    switch (this.state.settings.gameDifficulty) {
      case 'easy':
        rating = 50;
        break;
      case 'hard':
        rating = 65;
        break;
      case 'tough':
        rating = 80;
        break;
    }
    if (system.state.privateers) {
      const combat = new Conquest(chance);
      const attacker = {
        fleet: Fleet.create({
          warShips: system.state.privateers,
        }),
        rating,
      };
      const defender = {
        system: System.create({
          name: '<TEMPORARY>',
          owner: '<PRIVATEERS>',
          position: [-1, -1],
          warShips: system.state.warShips,
          stealthShips: system.state.stealthShips,
        }),
        rating: this.mustPlayer(system.state.owner).state.ratings.naval,
      };
      const result = combat.simulate(attacker, defender);
      if (result.winner === 'attacker') {
        this.overthrowSystem(player, system, system.state.privateers, chance);
      }
    }
  }

  private overthrowSystem(
    player: Player,
    system: System,
    warShips: number,
    chance: Chance.Chance,
  ): void {
    // TODO: Overthrow returns to original player control, not always Empire.
    system.state.privateers = 0;
    this.transferOwnership(
      new Player(this.state.players[0]),
      system,
      Fleet.create({ warShips }),
    );
    system.state.planets.forEach((p) => {
      p.morale = 1;
      p.troops = chance.integer({ min: p.troops * 0.25, max: p.troops * 0.75 });
      p.owner = system.state.owner;
    });
    player.reportUnrest(system, {
      overthrown: {
        who: player.state.name,
        reverted: 'Empire',
      },
    });
  }

  /**
   * Returns the first system that matches the name or initial.
   *
   * @param nameOrInitial
   */
  findSystem(nameOrInitial: string): System | undefined {
    const match =
      nameOrInitial.length === 1
        ? (input: string): boolean => input[0] === nameOrInitial.toUpperCase()
        : (input: string): boolean =>
            input.toUpperCase() === nameOrInitial.toUpperCase();

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

  createPlanet(owner: string, morale = 0): PlanetState {
    const chance = this.chance;
    const troops = chance.integer({ min: 40, max: 100 });
    return {
      owner,
      morale: morale,
      recruit: 7,
      troops,
    };
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
