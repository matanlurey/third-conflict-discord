/* eslint-disable @typescript-eslint/no-unused-vars */
import gameHook from './cli/hooks';
import { ArgumentError, CliReader, GameStateError } from './cli/reader';
import { Command } from './command/config';
import { parse } from './command/parser';
import commands from './commands';
import { FleetState } from './game/state/fleet';
import { Game } from './game/state/game';
import { Player } from './game/state/player';
import { Production, System } from './game/state/system';

export class Session {
  private readonly commands: Command[];
  private readonly reader: CliReader;

  constructor(game: Game) {
    this.commands = commands({
      enableNoviceMode: game.state.settings.enableNoviceMode,
      enableSystemDefenses: game.state.settings.enableSystemDefenses,
    });
    this.reader = new CliReader(gameHook(game), {
      attack(target: System, source: System, fleet: FleetState): void {
        throw new Error('Method not implemented.');
      },

      build(source: System, unit: Production): void {
        throw new Error('Method not implemented.');
      },

      end(user: Player): void {
        throw new Error('Method not implemented.');
      },

      reports(user: Player): void {
        throw new Error('Method not implemented.');
      },

      scan(user: Player, target: System): void {
        throw new Error('Method not implemented.');
      },

      scout(target: System, source: System): void {
        throw new Error('Method not implemented.');
      },

      summary(user: Player): void {
        throw new Error('Method not implemented.');
      },
    });
  }

  handle(userId: string, wasDm: boolean, input: string): void {
    try {
      const args = parse(input, this.commands);
      if (args.error) {
        console.warn('Could not parse', args.error);
      } else {
        this.reader.read(userId, args);
      }
    } catch (e) {
      if (e instanceof ArgumentError) {
        // TODO: Handle.
        console.error('Unhandled error', e);
      } else if (e instanceof GameStateError) {
        // TODO: Handle.
        console.error('Unhandled error', e);
      } else {
        // TODO: Handle.
        console.error('Unhandled error', e);
      }
    }
  }
}
