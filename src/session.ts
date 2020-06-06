import { Chance } from 'chance';
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
import commands from './commands';
import { determineGroundResults } from './game/combat/ground';
import { Fleet } from './game/state/fleet';
import { Game } from './game/state/game';
import { HiddenSystemState, Player } from './game/state/player';
import {
  PlanetState,
  Production,
  System,
  SystemState,
} from './game/state/system';
import { UI } from './ui/interface';

export class Session implements CliHandler {
  private readonly commands: Command[];
  private readonly reader: CliReader;
  private replyTo?: string;

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
          this.summary(p);
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
    this.messenger.message(this.replyTo, message);
  }

  handle(userId: string, wasDm: boolean, input: string): void {
    try {
      this.replyTo = userId;
      const args = parse(input, this.commands);
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
    const dispatch = source.attack(source, target, fleet, 'conquest');
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
    this.reply(this.ui.ackEndTurn());
    this.game.endTurn(user);
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
      return this.invadeSystem(target, planet, amount);
    } else {
      return this.unloadTroops(target, planet, amount);
    }
  }

  private invadeSystem(target: System, planet: number, amount: number): void {
    if (planet === 0) {
      // Need at least N troops.
      const toInvade = target.state.planets.filter(
        (p) => p.owner !== target.state.owner,
      );
      const planets = toInvade.length;
      if (amount < planets) {
        throw new GameStateError(`Not enough troops to automatically invade.`);
      }
      const each = amount / planets;
      toInvade.forEach((p, i) => this.invadePlanet(target, p, i, each));
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
      this.invadePlanet(target, state, index, amount);
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
      this.reply(`Loaded ${t} troop(s) from ${controlled.length} planet(s).`);
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
        const loading = state.troops;
        target.state.troops += loading;
        state.troops = 0;
        this.reply(`Loaded ${loading} troop(s) from planet ${planet}.`);
      } else if (state.troops < amount) {
        throw new GameStateError(`Not enough troops at planet ${planet}.`);
      } else {
        target.state.troops += amount;
        state.troops -= amount;
        this.reply(`Loaded ${amount} troop(s) from planet ${planet}.`);
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
      const each = amount / planets;
      toUnloadTo.forEach((p) => (p.troops += each));
      target.state.troops = amount % planets;
      this.reply(
        `Unloaded ${amount} troops equally across ${toUnloadTo.length} planet(s).`,
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
    }
  }

  private invadePlanet(
    target: System,
    planet: PlanetState,
    index: number,
    troops: number,
  ): void {
    // Reduce attacking troop strength immediately.
    target.state.troops -= troops;

    // Determine results.
    const attacker = this.game.mustPlayer(target.state.owner);
    const defender = this.game.mustPlayer(planet.owner);
    const chance = new Chance(this.game.state.seed);
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
      this.messenger.message(
        attacker.state.userId,
        this.ui.invadedPlanet(target, index, results.attacker),
      );
      planet.morale = -planet.morale;
      planet.troops = results.attacker;
      planet.owner = attacker.state.userId;
    } else {
      this.messenger.message(
        attacker.state.userId,
        this.ui.defendedPlanet(target, index, results.defender),
      );
    }
  }

  move(source: System, target: System, fleet: Fleet): void {
    const dispatch = source.moveTo(source, target, fleet);
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

  scan(user: Player, target: System): void {
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
    this.reply(this.ui.displaySystem(user, reveal));
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

  summary(user: Player): void {
    const settings = this.game.state.settings;
    const currentTurn = this.game.state.turn;
    const systems = user.filterSystems(this.game.systems);
    const scouts = user.filterScouts(this.game.scouts);
    const fleets = user.filterFleets(this.game.fleets);
    this.reply(
      this.ui.displaySummary(
        settings,
        user,
        currentTurn,
        this.game.systems,
        systems,
        scouts,
        fleets,
      ),
    );
  }
}
