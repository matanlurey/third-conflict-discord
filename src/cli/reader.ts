import { Parsed } from '../command/parser';
import { FleetState } from '../game/state/fleet';
import { Player } from '../game/state/player';
import { Production, System } from '../game/state/system';

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
    super(`Invalid argument "${value}" for ${name}: ${reason}.`);
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

  private requireNumber(name: string): number {
    const value = this.options[name];
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ArgumentError(name, value, 'Not a number.');
    }
    return value;
  }

  requireInteger(name: string, defaultTo?: number): number {
    const value = this.requireNumber(name);
    if (defaultTo !== undefined && value === undefined) {
      return defaultTo;
    }
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
      throw new ArgumentError(name, value, 'Required argument.');
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
      // TODO: Message an error.
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
    options?: { ownedBy?: string },
  ): System | undefined {
    const system = this.game.system(name);
    if (!system) {
      return;
    }
    if (options) {
      if (options.ownedBy && system.owner.userId !== options.ownedBy) {
        throw new ArgumentError(
          name,
          system.owner.name,
          'Not controlled by active player.',
        );
      }
    }
    return system;
  }

  private requireSystem(name: string, options?: { ownedBy?: string }): System {
    const system = this.optionalSystem(name, options);
    if (!system) {
      throw new ArgumentError(name, '<Invalid>', 'Not a valid system.');
    }
    return system;
  }

  private process(user: string, command: string, options: OptionReader): void {
    const player = this.game.player(user);
    if (!player) {
      throw new ArgumentError(
        '<Player>',
        '<Not Found>',
        'You are not in the game.',
      );
    }
    switch (command) {
      case 'attack':
        return this.processAttack(player, options);
      case 'build':
        return this.processBuild(player, options);
      case 'end':
        return this.handler.end(player);
      case 'reports':
        return this.handler.reports(player);
      case 'scan':
        return this.processScan(player, options);
      case 'scout':
        return this.processScout(player, options);
      case 'summary':
        return this.handler.summary(player);
      default:
        throw new Error(`Unimplemented: "${command}".`);
    }
  }

  private processAttack(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('target'));
    const source = ((): System | undefined => {
      const input = options.optionalString('source');
      return input
        ? this.requireSystem(input, { ownedBy: user.state.userId })
        : this.game.closest(user, target);
    })();
    if (!source) {
      throw new ArgumentError(
        target.state.name,
        '<Not Found>',
        'Could not find a friendly system nearby.',
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
      options.requireInteger('stealthships'),
      options.requireInteger('transports'),
      options.requireInteger('missiles'),
      options.requireInteger('troops'),
      options.requireInteger('buildPoints'),
    ];
    return this.handler.attack(target, source, {
      warShips,
      stealthShips,
      transports,
      missiles,
      troops,
      buildPoints,
    });
  }

  private processBuild(user: Player, options: OptionReader): void {
    const source = this.requireSystem('source', { ownedBy: user.state.userId });
    const produce = options.requireString('unit');
    return this.handler.build(source, produce as Production);
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
      throw new ArgumentError(
        target.state.name,
        '<Not Found>',
        'Could not find a friendly system nearby.',
      );
    }
    return this.handler.scout(target, source);
  }

  private processScan(user: Player, options: OptionReader): void {
    const target = this.requireSystem(options.requireString('target'));
    const player = this.game.player(user.state.userId);
    if (!player) {
      throw new ArgumentError(
        '<Player>',
        '<Not Found>',
        'You are not in the game.',
      );
    }
    return this.handler.scan(player, target);
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
  closest(player: Player, system: System): System | undefined;
}

/**
 * How to handle valid requests.
 */
export interface CliHandler {
  /**
   * Issues an attack command.
   *
   * @param target
   * @param source
   * @param fleet
   */
  attack(target: System, source: System, fleet: FleetState): void;

  /**
   * Issues a build command.
   *
   * @param source
   * @param unit
   */
  build(source: System, unit: Production): void;

  /**
   * Issues an end-turn command.
   *
   * @param user
   */
  end(user: Player): void;

  /**
   * Issues a report request command.
   *
   * @param user
   */
  reports(user: Player): void;

  /**
   * Issues a scan command.
   *
   * @param user
   * @param target
   */
  scan(user: Player, target: System): void;

  /**
   * Issues a scout command.
   *
   * @param target
   * @param source
   */
  scout(target: System, source: System): void;

  /**
   * Issues a summary request command.
   *
   * @param user
   */
  summary(user: Player): void;
}
