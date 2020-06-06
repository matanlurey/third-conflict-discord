import { MessageEmbed } from 'discord.js';
import { Parsed } from '../command/parser';
import { Fleet } from '../game/state/fleet';
import { Player } from '../game/state/player';
import { Production, System } from '../game/state/system';
import { CliHandler } from './handler';

type Options = { [key: string]: boolean | number | string | undefined };

/**
 * Thrown when reading a value from the command-line options.
 */
export class ArgumentError extends Error {
  constructor(
    public readonly name: string,
    public readonly value: unknown,
    public readonly reason: string,
  ) {
    super(`Invalid argument "${value}" for ${name}: ${reason}`);
  }
}

export class GameStateError extends Error {}

export class InvalidPlayerError extends GameStateError {
  constructor(public readonly userId: string) {
    super(`Invalid player: "${userId}" is not in the game.`);
  }
}

export class InvalidSystem extends GameStateError {
  constructor(public readonly system: string) {
    super(`Invalid system: "${system}" is not in the game.`);
  }
}

export class InvalidOwnerError extends GameStateError {
  constructor(public readonly attempt: Player, public readonly target: System) {
    super(
      '' +
        `Invalid player: "${attempt.state.name}" does not control system ` +
        `"${target.state.name}".`,
    );
  }
}

export class OptionReader {
  constructor(private readonly options: Options) {}

  requireBoolean(name: string): boolean {
    const value = this.options[name];
    if (typeof value !== 'boolean') {
      throw new ArgumentError(name, value, 'Not a boolean.');
    }
    return value;
  }

  requireNumber(name: string, defaultTo?: number): number {
    const value = this.options[name];
    if (value === undefined && defaultTo !== undefined) {
      return defaultTo;
    }
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ArgumentError(name, value, 'Not a number.');
    }
    return value;
  }

  requireInteger(name: string, defaultTo?: number): number {
    const value = this.requireNumber(name, defaultTo);
    if (!Number.isSafeInteger(value)) {
      throw new ArgumentError(name, value, 'Not an integer.');
    }
    return value;
  }

  optionalString(name: string): string | undefined {
    const value = this.options[name];
    if (value === undefined) {
      return value;
    }
    if (typeof value !== 'string') {
      throw new ArgumentError(name, value, 'Not a string.');
    }
    if (value.trim() === '') {
      throw new ArgumentError(
        name,
        value,
        'Must have at least 1 non-whitespace character.',
      );
    }
    return value;
  }

  requireString(name: string): string {
    const value = this.optionalString(name);
    if (value === undefined) {
      throw new ArgumentError(name, '<Undefined>', 'Required argument.');
    }
    return value;
  }
}

/**
 * Given hooks into the game systen, parses and calls handlers.
 */
export class CliReader {
  constructor(
    private readonly game: CliGameHooks,
    private readonly handler: CliHandler,
  ) {}

  /**
   * Reads a command parsed from a public channel.
   *
   * @param user
   * @param args
   */
  read(user: string, args: Parsed): void {
    if (args.error) {
      throw new Error(`Invalid: ${args.error}.`);
    }
    if (args.matched) {
      return this.process(
        user,
        args.matched.name,
        new OptionReader(args.options),
      );
    } else {
      throw new Error(
        `Unknown state: ${user}:${JSON.stringify(args, undefined, 2)}`,
      );
    }
  }

  private optionalSystem(
    name: string,
    options?: { ownedBy?: string; notOwnedBy?: string },
  ): System | undefined {
    const system = this.game.system(name);
    if (!system) {
      return;
    }
    if (options) {
      if (options.ownedBy && system.state.owner !== options.ownedBy) {
        const player = this.game.player(options.ownedBy);
        if (!player) {
          throw new InvalidPlayerError(options.ownedBy);
        }
        throw new InvalidOwnerError(player, system);
      } else if (
        options.notOwnedBy &&
        system.state.owner === options.notOwnedBy
      ) {
        const player = this.game.player(options.notOwnedBy);
        if (!player) {
          throw new InvalidPlayerError(options.notOwnedBy);
        }
        throw new InvalidOwnerError(player, system);
      }
    }
    return system;
  }

  private requireSystem(
    name: string,
    options?: { ownedBy?: string; notOwnedBy?: string },
  ): System {
    const system = this.optionalSystem(name, options);
    if (!system) {
      throw new InvalidSystem(name);
    }
    return system;
  }

  private process(user: string, command: string, options: OptionReader): void {
    console.log(user, command);
    const player = this.game.player(user);
    if (!player) {
      throw new InvalidPlayerError(user);
    }
    switch (command) {
      case 'attack':
        return this.processAttack(player, options);
      case 'build':
        return this.processBuild(player, options);
      case 'end':
        return this.handler.end(player);
      case 'move':
        return this.processMove(player, options);
      case 'recall':
        return this.processRecall(player, options);
      case 'scan':
        return this.processScan(player, options);
      case 'scout':
        return this.processScout(player, options);
      case 'summary':
        return this.handler.summary(player);
      case 'troops':
        return this.processTroops(player, options);
      default:
        throw new Error(`Unimplemented: "${command}".`);
    }
  }

  private processAttack(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('target'), {
      notOwnedBy: user.state.userId,
    });
    const source = ((): System | undefined => {
      const input = options.optionalString('source');
      return input
        ? this.requireSystem(input, { ownedBy: user.state.userId })
        : this.game.closest(user, target);
    })();
    if (!source) {
      throw new GameStateError(
        `Could not find a friendly system of "${user.state.name}".`,
      );
    }
    const [
      warShips,
      stealthShips,
      transports,
      missiles,
      troops,
      buildPoints,
    ] = [
      options.requireInteger('warships'),
      options.requireInteger('stealthships', 0),
      options.requireInteger('transports'),
      options.requireInteger('missiles', 0),
      options.requireInteger('troops'),
      options.requireInteger('points'),
    ];
    return this.handler.attack(
      source,
      target,
      new Fleet({
        warShips,
        stealthShips,
        transports,
        missiles,
        troops,
        buildPoints,
      }),
    );
  }

  private processBuild(user: Player, options: OptionReader): void {
    const source = this.requireSystem(options.requireString('source'), {
      ownedBy: user.state.userId,
    });
    const produce = options.requireString('unit');
    return this.handler.build(source, produce as Production);
  }

  private processTroops(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('system'), {
      ownedBy: user.state.userId,
    });
    // TODO: Add and use .optionalNumber instead.
    const command = options.requireString('command');
    const planet = options.requireNumber('planet', 0);
    const troops = options.requireNumber('troops', 0);
    return this.handler.troops(
      target,
      command as 'load' | 'unload',
      planet,
      troops,
    );
  }

  private processMove(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('target'), {
      ownedBy: user.state.userId,
    });
    const source = ((): System | undefined => {
      const input = options.optionalString('source');
      return input
        ? this.requireSystem(input, { ownedBy: user.state.userId })
        : this.game.closest(user, target, { not: target });
    })();
    if (!source) {
      throw new GameStateError(
        `Could not find a friendly system of "${user.state.name}".`,
      );
    }
    const [
      warShips,
      stealthShips,
      transports,
      missiles,
      troops,
      buildPoints,
    ] = [
      options.requireInteger('warships'),
      options.requireInteger('stealthships', 0),
      options.requireInteger('transports'),
      options.requireInteger('missiles', 0),
      options.requireInteger('troops'),
      options.requireInteger('points'),
    ];
    return this.handler.move(
      source,
      target,
      new Fleet({
        warShips,
        stealthShips,
        transports,
        missiles,
        troops,
        buildPoints,
      }),
    );
  }

  private processRecall(user: Player, options: OptionReader): void {
    const number = options.requireNumber('number');
    const isScout = options.requireBoolean('scout');
    return this.handler.recall(user, number, isScout);
  }

  private processScout(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('target'));
    const source = ((): System | undefined => {
      const input = options.optionalString('source');
      return input
        ? this.requireSystem(input, { ownedBy: user.state.userId })
        : this.game.closest(user, target);
    })();
    if (!source) {
      throw new GameStateError(
        `Could not find a friendly system of "${user.state.name}".`,
      );
    }
    return this.handler.scout(target, source);
  }

  private processScan(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('target'));
    return this.handler.scan(user, target);
  }
}

/**
 * Provides hooks into the game system.
 */
export interface CliGameHooks {
  /**
   * Returns the player in the game with a matching user ID, if any.
   *
   * @param userId
   */
  player(userId: string): Player | undefined;

  /**
   * Returns the system in the game with a matching name or initial, if any.
   *
   * @param system
   */
  system(system: string): System | undefined;

  /**
   * Returns the closest friendly system to the current player, if any.
   *
   * @param player
   * @param system
   */
  closest(
    player: Player,
    system: System,
    options?: { not: System },
  ): System | undefined;
}

export interface CliMessenger {
  /**
   * Sends a direct message.
   *
   * @param user
   * @param message
   */
  message(user: string, message: string | MessageEmbed): void;

  /**
   * Sends a public message.
   *
   * @param message
   */
  broadcast(message: string | MessageEmbed): void;
}
