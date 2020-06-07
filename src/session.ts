import { MessageEmbed } from 'discord.js';
import { CliHandler } from './cli/handler';
import gameHook from './cli/hooks';
import {
  ArgumentError,
  CliMessenger,
  CliReader,
  GameStateError,
} from './cli/reader';
import { Command } from './command/config';
import { parse } from './command/parser';
import { getRichUsage } from './command/usage';
import commands from './commands';
import { Fleet } from './game/state/fleet';
import { Game } from './game/state/game';
import { HiddenSystemState, Player } from './game/state/player';
import { Production, System, SystemState } from './game/state/system';
import { UI } from './ui/interface';

export class Session implements CliHandler {
  private readonly commands: Command[];
  private readonly reader: CliReader;

  private replyTo?: string;
  private wasDm = false;

  constructor(
    private readonly game: Game,
    private readonly ui: UI,
    private readonly messenger: CliMessenger,
    private readonly logWarnings = true,
  ) {
    this.commands = commands({
      enableNoviceMode: game.state.settings.enableNoviceMode,
      enableSystemDefenses: game.state.settings.enableSystemDefenses,
    });
    this.reader = new CliReader(gameHook(game), this);
    game.onTurnEnded((): void => {
      game.players.forEach((p) => {
        // Filter AI.
        if (!p.isAI) {
          this.replyTo = p.state.userId;
          this.summary(p, false, true);
        }
      });
    });
  }

  private reply(message: string | MessageEmbed): void {
    if (!this.replyTo) {
      if (this.logWarnings) {
        console.warn('Could not find user to reply', message);
      }
      return;
    }
    if (this.wasDm) {
      this.messenger.message(this.replyTo, message);
    } else {
      this.messenger.broadcast(message);
    }
  }

  handle(userId: string, wasDm: boolean, input: string): void {
    try {
      this.replyTo = userId;
      this.wasDm = wasDm;
      const args = parse(input.toLowerCase(), this.commands);
      if (args.error && this.logWarnings) {
        console.warn('Could not parse:', args.error);
      } else {
        this.reader.read(userId, args);
      }
    } catch (e) {
      if (e instanceof ArgumentError || e instanceof GameStateError) {
        this.reply(e.message);
        if (this.logWarnings) {
          console.warn(`Failed: "${input}"`, e);
        }
      } else {
        if (this.logWarnings) {
          console.error('Unhandled error', e);
        } else {
          throw e;
        }
      }
    } finally {
      this.replyTo = undefined;
    }
  }

  attack(source: System, target: System, fleet: Fleet): void {
    const dispatch = source.attack(target, fleet, 'conquest');
    this.game.state.fleets.push(dispatch.state);
    this.reply(
      this.ui.sentAttack(
        source,
        target,
        dispatch.eta(this.game.state.settings.shipSpeedATurn),
        dispatch,
      ),
    );
  }

  build(source: System, unit: Production): void {
    source.change(unit);
    this.reply(this.ui.changeProduction(source, unit));
  }

  end(user: Player): void {
    this.reply(
      this.ui.ackEndTurn(
        this.game.players.filter(
          (p) =>
            !p.isAI &&
            !p.state.endedTurn &&
            p.state.userId !== user.state.userId,
        ),
      ),
    );
    this.game.endTurn(user);
  }

  usage(command: string | undefined): void {
    if (command) {
      for (const c of this.commands) {
        if (c.name === command) {
          return this.reply(getRichUsage(c));
        }
      }
    }
    return this.reply(getRichUsage(this.commands));
  }

  troops(
    target: System,
    command: 'unload' | 'load' | 'invade',
    planet: number,
    amount: number,
  ): void {
    if (command == 'load') {
      return this.loadTroops(target, planet, amount);
    }

    // Will either be invaidng or garrisoning.
    if (target.state.troops === 0) {
      throw new GameStateError(`You have no troops at ${target.state.name}.`);
    }
    if (amount > target.state.troops) {
      throw new GameStateError(
        `Not enough troops: specified ${amount}, has ${target.state.troops}.`,
      );
    }
    if (amount === 0) {
      amount = target.state.troops;
    }

    if (command === 'invade') {
      return this.game.invade(target, planet, amount, this.messenger, this.ui);
    } else {
      return this.unloadTroops(target, planet, amount);
    }
  }

  private loadTroops(target: System, planet: number, amount: number): void {
    let capacity = target.remainingCapacity;
    if (capacity === 0) {
      throw new GameStateError(`No remaining Transport capacity.`);
    }
    const controlled = target.state.planets.filter(
      (f) => f.owner === target.state.owner,
    );
    if (controlled.length === 0) {
      throw new GameStateError(
        `You have no occupied planets in ${target.state.name}.`,
      );
    }
    if (planet === 0) {
      // Load as many troops as fit in transports.
      function hasTroopsLeft(): boolean {
        return controlled.some((x) => x.troops > 0);
      }
      let i = 0;
      let t = 0;
      if (amount === 0) {
        amount = Number.MAX_SAFE_INTEGER;
      }
      while (amount > 0 && capacity > 0 && hasTroopsLeft()) {
        if (controlled[i].troops > 0) {
          controlled[i].troops--;
          t++;
          capacity--;
          amount--;
        }
        i++;
        if (i >= controlled.length) {
          i = 0;
        }
      }
      target.state.troops += t;
      this.reply(
        `` +
          `Loaded ${t} troop(s) from ${controlled.length} planet(s). ` +
          `You now have ${target.state.troops} troops in orbit.`,
      );
      return;
    } else {
      const state = target.state.planets[planet - 1];
      if (state === undefined) {
        throw new GameStateError(
          `No planet #${planet} in ${target.state.name}.`,
        );
      }
      if (state.owner !== target.state.owner) {
        throw new GameStateError(`Cannot load from an enemy planet.`);
      }
      if (amount === 0) {
        const loading = Math.min(capacity, state.troops);
        target.state.troops += loading;
        state.troops = 0;
        this.reply(
          `` +
            `Loaded ${loading} troop(s) from planet ${planet}. You ` +
            `now have ${target.state.troops} in orbit.`,
        );
      } else if (state.troops < amount) {
        throw new GameStateError(`Not enough troops at planet ${planet}.`);
      } else {
        if (amount > capacity) {
          throw new GameStateError(
            `Not enough capacity on Transports (${capacity}).`,
          );
        }
        target.state.troops += amount;
        state.troops -= amount;
        this.reply(
          `` +
            `Loaded ${amount} troop(s) from planet ${planet}. You now ` +
            `have ${state.troops} troops remaining on the planet and ` +
            `${target.state.troops} in orbit.`,
        );
      }
    }
  }

  private unloadTroops(target: System, planet: number, amount: number): void {
    if (planet === 0) {
      // Need at least N troops.
      const toUnloadTo = target.state.planets.filter(
        (p) => p.owner === target.state.owner,
      );
      const planets = toUnloadTo.length;
      if (amount < planets) {
        throw new GameStateError(`Not enough troops to automatically unload.`);
      }
      const each = Math.floor(amount / planets);
      const actual = each * planets;
      toUnloadTo.forEach((p) => (p.troops += each));
      target.state.troops -= actual;
      this.reply(
        `` +
          `Unloaded ${actual} troops equally across ${toUnloadTo.length} ` +
          `planet(s). You now have ${target.state.troops} troops in orbit.`,
      );
    } else {
      const index = planet - 1;
      const state = target.state.planets[index];
      if (state === undefined) {
        throw new GameStateError(
          `No planet #${planet} in ${target.state.name}.`,
        );
      }
      if (state.owner !== target.state.owner) {
        throw new GameStateError(
          `Cannot unload to an enemy planet (did you mean "invade"?).`,
        );
      }
      state.troops += amount;
      target.state.troops -= amount;
      this.reply(
        `` +
          `Unloaded ${amount} troops to planet ${planet} in system ` +
          `${target.state.name}. You now have ${state.troops} on the planet ` +
          `and ${target.state.troops} troops in orbit.`,
      );
    }
  }

  move(source: System, target: System, fleet: Fleet): void {
    const dispatch = source.moveTo(target, fleet);
    this.game.state.fleets.push(dispatch.state);
    this.reply(
      this.ui.sentMove(
        source,
        target,
        dispatch.eta(this.game.state.settings.shipSpeedATurn),
        dispatch,
      ),
    );
  }

  scan(user: Player, target: System, showPlanets: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const owner = this.game.findPlayer(target.state.owner)!;
    let reveal: SystemState | HiddenSystemState;
    if (user.state.userId === owner.state.userId) {
      reveal = target.state;
    } else {
      reveal = user.state.fogOfWar[target.state.name] || {
        system: {
          name: target.state.name,
        },
      };
    }
    // TODO: Filter visibility here versus in the UI layer.
    this.reply(this.ui.displaySystem(user, reveal, showPlanets));
  }

  scout(target: System, source: System): void {
    let scout: 'warship' | 'stealthship';
    if (source.state.stealthShips) {
      source.state.stealthShips--;
      scout = 'stealthship';
    } else if (source.state.warShips) {
      source.state.warShips--;
      scout = 'warship';
    } else {
      throw new GameStateError(
        `No valid units for scouting from "${source.state.name}".`,
      );
    }
    const result = source.scout(target, source, scout);
    this.game.state.scouts.push(result.state);
    this.reply(
      this.ui.sentScout(
        source,
        target,
        result.eta(this.game.state.settings.shipSpeedATurn),
        result.state.scout === 'warship' ? 'WarShip' : 'StealthShip',
      ),
    );
  }

  recall(user: Player, number: number, isScout: boolean): void {
    const index = number - 1;
    const units = isScout
      ? user.filterScouts(this.game.scouts)
      : user.filterFleets(this.game.fleets);
    const select = units[index];
    if (select === undefined) {
      throw new GameStateError(
        `No ${isScout ? 'scout' : 'fleet'} number ${number}.`,
      );
    }
    this.game.recallUnit(select);
    this.reply(
      `Recalled ${isScout ? 'scout' : 'fleet'} #${number} to ${
        select.state.target
      }.`,
    );
  }

  map(user: Player): void {
    const systems = user.filterSystems(this.game.systems);
    return this.reply(this.ui.displayMap(this.game.systems, systems));
  }

  summary(user: Player, showScouts: boolean, dm = false): void {
    const settings = this.game.state.settings;
    const currentTurn = this.game.state.turn;
    const systems = user.filterSystems(this.game.systems);
    const scouts = user.filterScouts(this.game.scouts);
    const fleets = user.filterFleets(this.game.fleets);
    const summary = this.ui.displaySummary(
      settings,
      user,
      currentTurn,
      this.game.systems,
      systems,
      scouts,
      fleets,
      showScouts,
    );
    if (dm) {
      this.messenger.message(user.state.userId, summary);
    } else {
      this.reply(summary);
    }
  }
}
