import discord from 'discord.js';
import minimist from 'minimist';
import stringArgv from 'string-argv';
import { getUsage, lookup, parseArgs, preGameMenu } from './cli/embed';
import { defaultSettings } from './game/settings';

export class CommandProcessor {
  private reply!: string;

  constructor(
    private readonly send: {
      message: (player: string, message: string | discord.MessageEmbed) => void;
      broadcast: (message: string | discord.MessageEmbed) => void;
    },
    private settings = defaultSettings,
  ) {}

  /**
   * Process an incoming command from a user.
   *
   * It is assumed that the message has already been normalized (e.g. if a
   * prefix is needed, or mentions are used), and the message is expected to
   * be a command.
   *
   * @param user user ID who sent the message.
   * @param message message contents.
   */
  process(user: string, message: string): void {
    // Store the user to reply to.
    this.reply = user;

    // Avoid dealing with starting/trailing whitespace.
    message = message.trim();

    // Find the initial command(s).
    const parse = message.match(/\S+/);
    if (!parse) {
      // Ignore.
      return;
    }

    const command = parse[0].toLowerCase();
    switch (command) {
      case 'help':
        return this.displayHelp(...message.toLowerCase().split(' ').slice(1));
      default:
        const args = parseArgs(minimist(stringArgv(message)));
        console.log(args);
    }
  }

  private get gameInProgress(): boolean {
    return false;
  }

  private displayHelp(...commandTree: string[]): void {
    if (commandTree.length === 0) {
      if (this.gameInProgress) {
        // Send a custom [main] menu explaining how to play.
        throw new Error('Unimplemented');
      } else {
        // Send a custom menu for the game lobby.
        this.send.message(
          this.reply,
          preGameMenu({ waitingForPlayers: false }),
        );
      }
    } else {
      // Auto-generate a help menu for an inner command.
      const result = lookup(commandTree);
      const command = result[0];
      const crumbs = result[1];
      if (command) {
        this.send.message(
          this.reply,
          getUsage(command, crumbs.splice(0, crumbs.length - 1)),
        );
      } else {
        // TODO: Show an error, help the user, etc.
      }
    }
  }

  private gameCreate(): void {
    // TODO: Implement.
    console.log('TODO', 'gameCreate');
  }

  private gameLoad(file: string): void {
    // TODO: Implement.
    console.log('TODO', 'gameLoad', file);
  }

  private gameSave(file: string): void {
    // TODO: Implement.
    console.log('TODO', 'gameSave', file);
  }

  private gameStart(): void {
    // TODO: Implement.
    console.log('TODO', 'gameStart');
  }

  private gameJoin(): void {
    // TODO: Implement.
    console.log('TODO', 'gameJoin');
  }

  private viewFleetAll(): void {
    // TODO: Implement.
    console.log('TODO', 'viewFleetAll');
  }

  private viewFleetFrom(system: string): void {
    // TODO: Implement.
    console.log('TODO', 'viewFleetFrom', system);
  }

  private viewFleetTo(system: string): void {
    // TODO: Implement.
    console.log('TODO', 'viewFleetTo', system);
  }

  private viewFleetMissiles(): void {
    // TODO: Implement.
    console.log('TODO', 'viewFleetMissiles');
  }

  private viewFleetScouts(): void {
    // TODO: Implement.
    console.log('TODO', 'viewFleetScouts');
  }

  private viewMap(): void {
    // TODO: Implement.
    console.log('TODO', 'viewMap');
  }

  private viewSystem(system: string): void {
    // TODO: Implement.
    console.log('TODO', 'viewSystem', system);
  }

  private viewProductionLimits(): void {
    // TODO: Implement.
    console.log('TODO', 'viewProductionLimits');
  }

  private viewLastTurnResults(): void {
    // TODO: Implement.
    console.log('TODO', 'viewLastTurnResults');
  }

  private viewCurrentPlayerStats(): void {
    // TODO: Implement.
    console.log('TODO', 'viewCurrentPlayerStats');
  }

  private viewScoreOfAllPlayers(): void {
    // TODO: Implement.
    console.log('TODO', 'viewScoreOfAllPlayers');
  }

  private viewSystemsWithUnrest(): void {
    // TODO: Implement.
    console.log('TODO', 'viewSystemsWithUnrest');
  }

  private viewIncomingEnemyFleets(): void {
    // TODO: Implement.
    console.log('TODO', 'viewIncomingEnemyFleets');
  }

  private attack(): void {
    // TODO: Implement.
    console.log('TODO', 'attack');
  }

  private scout(): void {
    // TODO: Implement.
    console.log('TODO', 'scout');
  }

  private planetInvade(system: string): void {
    // TODO: Implement.
    console.log('TODO', 'planetInvade', system);
  }

  private planetUnload(system: string, planet: string, amount?: string): void {
    // TODO: Implement.
    console.log('TODO', 'planetUnload', system, planet, amount);
  }

  private planetLoad(system: string, planet: string, amount?: string): void {
    // TODO: Implement.
    console.log('TODO', 'planetLoad', system, planet, amount);
  }

  private planetBombard(system: string, planet: string): void {
    // TODO: Implement.
    console.log('TODO', 'planetBombard', system, planet);
  }

  private wreck(system: string, type: string, amount: string): void {
    // TODO: Implement.
    console.log('TODO', 'wreck', system, type, amount);
  }

  private endTurn(): void {
    // TODO: Implement.
    console.log('TODO', 'endTurn');
  }
}
