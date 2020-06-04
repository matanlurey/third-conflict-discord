import fs from 'fs-extra';
import path from 'path';
import { Player } from '../game/state/player';
import {
  DisplayLevel,
  GameDifficulty,
  InitialFactories,
  ShipSpeedATurn,
} from '../game/state/settings';
import { System } from '../game/state/system';

/**
 * Possible argument values.
 */
export type Value = string | boolean | number | undefined;

/**
 * Command processor interface.
 */
export interface CommandProcessor {
  gameCreate(
    user: string,
    args: Readonly<{
      initialFactrories: InitialFactories;
      shipSpeedATurn: ShipSpeedATurn;
      gameDifficulty: GameDifficulty;
      maxGameLength: number;
      displayLevel: DisplayLevel;
      noviceMode: boolean;
      systemDefenses: boolean;
      randomEvents: boolean;
      empireBuilds: boolean;
    }>,
  ): void;
  gameLoad(
    user: string,
    args: Readonly<{
      file: string;
    }>,
  ): void;
  gameSave(
    user: string,
    args: Readonly<{
      file: string;
    }>,
  ): void;
  gameJoin(
    user: string,
    args: Readonly<{
      name: string;
    }>,
  ): void;
  gameStart(user: string): void;
  gameQuit(user: string): void;

  viewSummary(user: Player): void;
  viewReports(user: Player): void;
  viewFleets(user: Player): void;
  viewScouts(user: Player): void;
  viewSystem(
    user: Player,
    args: Readonly<{
      system: System;
    }>,
  ): void;
  viewIncoming(user: Player): void;
  viewUnrest(user: Player): void;
  viewScore(user: Player): void;

  attack(
    user: Player,
    args: Readonly<{
      source: System;
      target: System;
      warShips: number;
      stealthShips: number;
      missiles: number;
      transports: number;
      buildPoints: number;
      troops: number;
    }>,
  ): void;
  scout(
    user: Player,
    args: Readonly<{
      source: System;
      target: System;
    }>,
  ): void;
  end(user: string): void;
}

/**
 * Thrown by @see {CommandValidator}.
 */
export class InvalidCommandError extends Error {}

/**
 * Converts and validates raw commands, and passes them down to @see {process}.
 */
export abstract class CommandValidator {
  constructor(private readonly processor: CommandProcessor) {}

  protected abstract isAdmin(user: string): boolean;

  private throwIfNotAdmin(user: string): void {
    if (!this.isAdmin(user)) {
      throw new InvalidCommandError(`Must be an admin to use this command.`);
    }
  }

  protected abstract getPlayer(user: string): Player | undefined;

  private throwIfNotInGame(user: string): void {
    if (!this.getPlayer(user)) {
      throw new InvalidCommandError(`Must be in the game to use this command.`);
    }
  }

  private throwIfAlreadyInGame(user: string): void {
    if (this.getPlayer(user)) {
      throw new InvalidCommandError(
        `Must not be in the game to use this command.`,
      );
    }
  }

  /**
   * Throws if the provided input is not a valid element.
   *
   * @param input
   * @param elements
   */
  private allowedValues<T>(input: T, elements: unknown[]): T {
    for (const element of elements) {
      if (element === input) {
        return input;
      }
    }
    throw new InvalidCommandError(
      `Invalid value: "${input}", Allowed: "${elements.join(', ')}".`,
    );
  }

  /**
   * Throws if the provided input is not a boolean.
   *
   * @param input
   */
  private allowBoolean(input: unknown): boolean {
    if (typeof input === 'boolean') {
      return input;
    } else {
      throw new InvalidCommandError(
        `Invalid value: "${input}", Expected: true or false.`,
      );
    }
  }

  /**
   * Throws if the provided input is not a string.
   *
   * @param input
   */
  private allowString(input: unknown): string {
    if (typeof input === 'string' && input.length) {
      return input;
    } else {
      throw new InvalidCommandError(
        `Invalid value: "${input}", Expected: non-empty string.`,
      );
    }
  }

  /**
   * Throws if the provide input is a number of value at least 1.
   *
   * @param input
   */
  private allowNumber(input: unknown): number {
    if (typeof input === 'number' && Number.isSafeInteger(input) && input > 0) {
      return input;
    } else {
      throw new InvalidCommandError(
        `Invalid value: "${input}", Expected an integer >=1.`,
      );
    }
  }

  private allowPlayer(user: string): Player {
    const result = this.getPlayer(user);
    if (!result) {
      throw new InvalidCommandError(`Not in the game.`);
    } else {
      return result;
    }
  }

  protected abstract getSystem(user: string): System | undefined;

  private allowSystem(system: string): System {
    const result = this.getSystem(system);
    if (!result) {
      throw new InvalidCommandError(`System not in the game: "${system}".`);
    } else {
      return result;
    }
  }

  read(
    command: string,
    user: string,
    args: { readonly [key: string]: Value },
  ): void {
    switch (command) {
      case 'game create':
        return this.processor.gameCreate(user, {
          initialFactrories: this.allowedValues(args['initial-factories'], [
            10,
            15,
            20,
          ]) as InitialFactories,
          shipSpeedATurn: this.allowedValues(args['ship-speed-a-turn'], [
            4,
            5,
            6,
          ]) as ShipSpeedATurn,
          gameDifficulty: this.allowedValues(args['game-difficulty'], [
            'easy',
            'hard',
            'tough',
          ]) as GameDifficulty,
          maxGameLength: this.allowNumber(args['max-game-length']),
          displayLevel: this.allowedValues(args['display-level'], [
            'nothing',
            'combat-and-events',
            'combat-events-and-movements',
            'combat-events-moves-and-scouts',
            'everything',
            'everything-and-free-intel',
          ]) as DisplayLevel,
          noviceMode: this.allowBoolean(args['novice-mode']),
          systemDefenses: this.allowBoolean(args['system-defenses']),
          randomEvents: this.allowBoolean(args['random-events']),
          empireBuilds: this.allowBoolean(args['empire-builds']),
        });
      case 'game load':
        const load = path.join('data', this.allowString(args['file']));
        if (!fs.pathExistsSync(load)) {
          throw new InvalidCommandError(`File not found: ${load}.`);
        }
        return this.processor.gameLoad(user, {
          file: load,
        });
      case 'game save':
        const save = path.join('data', this.allowString(args['file']));
        return this.processor.gameSave(user, { file: save });
      case 'game join':
        this.throwIfAlreadyInGame(user);
        return this.processor.gameJoin(user, {
          name: this.allowString('name'),
        });
      case 'game start':
        this.throwIfNotAdmin(user);
        return this.processor.gameStart(user);
      case 'game quit':
        this.throwIfNotAdmin(user);
        return this.processor.gameQuit(user);
      case 'view summary':
        return this.processor.viewSummary(this.allowPlayer(user));
      case 'view reports':
        return this.processor.viewReports(this.allowPlayer(user));
      case 'view fleets':
        return this.processor.viewFleets(this.allowPlayer(user));
      case 'view scouts':
        return this.processor.viewScouts(this.allowPlayer(user));
      case 'view system':
        return this.processor.viewSystem(this.allowPlayer(user), {
          system: this.allowSystem(this.allowString(args['system'])),
        });
      case 'view incoming':
        return this.processor.viewIncoming(this.allowPlayer(user));
      case 'view unrest':
        return this.processor.viewIncoming(this.allowPlayer(user));
      case 'view score':
        return this.processor.viewIncoming(this.allowPlayer(user));
      case 'attack':
        break;
      case 'scout':
        break;
      case 'end':
        break;
      default:
        break;
    }
  }
}
