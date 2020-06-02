import discord from 'discord.js';
import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import stringArgv from 'string-argv';
import {
  getUsage,
  lookup,
  parseArgs,
  preGameMenu,
  prettyPrint,
} from './cli/embed';
import { startingCombatRatings } from './game/combat';
import { SimpleMapGenerator } from './game/map';
import { Player } from './game/sector';
import { Settings } from './game/settings';
import { GameState } from './game/state';

interface PendingGame {
  settings: Settings;
  players: Map<string, string>;
}

export class CommandProcessor {
  private reply!: string;

  constructor(
    private readonly send: {
      message: (player: string, message: string | discord.MessageEmbed) => void;
      broadcast: (message: string | discord.MessageEmbed) => void;
    },
    private current?: PendingGame | GameState | undefined,
  ) {}

  private get isPrivleged(): boolean {
    return this.reply === '103004235385307136';
  }

  private lackOfPermissions(): void {
    return this.send.broadcast(
      `<@${this.reply}> does not have permissions to do that.`,
    );
  }

  process(user: string, message: string): void {
    try {
      this.doProcess(user, message);
    } catch (e) {
      console.error(e);
      return this.send.broadcast('An error occurred. See log for details.');
    }
  }

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
  private doProcess(user: string, message: string): void {
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
        const objs = minimist(stringArgv(message));
        const args = parseArgs(objs);
        if (!args.matched) {
          // TODO: Better error message.
          const text = objs._.join(' ');
          let message = `Unknown command: \`${text}\`.`;
          if (args.command) {
            message = `${message} Try \`help ${args.command}\`.`;
          }
          return this.send.message(user, message);
        }
        if (!args.terminal) {
          // TODO: Better error message.
          return this.send.message(
            user,
            `Not a terminal command: \`${objs._.join(' ')}\`. Try \`help ${
              args.command
            }\`.`,
          );
        }
        switch (args.command) {
          case 'game create':
            return this.gameCreate({
              initialFactories: args.options['initial-factories'],
              shipSpeedATurn: args.options['ship-speed-a-turn'],
              gameDifficulty: args.options['game-difficulty'],
              maxGameLength: args.options['max-game-length'],
              displayLevel: args.options['display-level'],
              noviceMode: args.options['novice-mode'],
              systemDefenses: args.options['system-defenses'],
              randomEvents: args.options['random-events'],
              empireBuilds: args.options['empire-builds'],
            });
          case 'game load':
            return this.gameLoad(args.options['file']);
          case 'game save':
            return this.gameSave(args.options['file']);
          case 'game join':
            return this.gameJoin(args.options['name']);
          case 'game start':
            return this.gameStart();
          case 'game quit':
            return this.gameQuit();
        }
    }
  }

  private get gameInProgress(): boolean {
    return this.current instanceof GameState;
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
          preGameMenu({ waitingForPlayers: !!this.current }),
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

  private gameCreate(options: {
    initialFactories: 10 | 15 | 20;
    shipSpeedATurn: 4 | 5 | 6;
    gameDifficulty: 'easy' | 'hard' | 'tough';
    maxGameLength: number;
    displayLevel:
      | 'nothing'
      | 'combat-and-events'
      | 'combat-events-and-movements'
      | 'combat-events-moves-and-scouts'
      | 'everything'
      | 'everything-and-free-intel';
    noviceMode: boolean;
    systemDefenses: boolean;
    randomEvents: boolean;
    empireBuilds: boolean;
  }): void {
    if (options.systemDefenses && options.noviceMode) {
      options.systemDefenses = false;
    }
    const settings: Settings = {
      initialFactories: options.initialFactories,
      shipSpeedATurn: options.shipSpeedATurn,
      gameDifficulty: options.gameDifficulty,
      maxGameLength: options.maxGameLength,
      displayLevel: options.displayLevel,
      enableNoviceMode: options.noviceMode,
      enableSystemDefenses: options.systemDefenses,
      enableRandomEvents: options.randomEvents,
      enableEmpireBuilds: options.empireBuilds,
    };
    this.send.broadcast(
      prettyPrint(
        'New game created',
        'Use `game join <alias>` to join!',
        settings,
      ),
    );
    this.current = {
      settings,
      players: new Map(),
    };
  }

  private gameLoad(file: string): void {
    if (!file || file.trim().length === 0) {
      return this.send.broadcast(`No file specified. See \`help game load\`.`);
    }
    fs.readJson(path.join('data', file))
      .then((result) => {
        this.current = new GameState(result, (message, player) => {
          if (player && player.userId) {
            this.send.message(player.userId, message);
          } else {
            this.send.broadcast(message);
          }
        });
        // TODO: Nice load message.
        // Loaded game with <SETTINGS> and <@PLAYERS>.
        this.send.broadcast(
          `Loaded \`${file}\` at turn \`${this.current.turn}\``,
        );
      })
      .catch((error) => {
        this.send.broadcast(`Could not load \`${file}\`: ${error}.`);
      });
  }

  private gameSave(file: string): void {
    if (!file || file.trim().length === 0) {
      return this.send.broadcast(`No file specified. See \`help game save\`.`);
    }
    const current = this.current;
    if (current instanceof GameState) {
      current
        .save(path.join('data', file))
        .then(() => {
          this.send.broadcast(`Saved \`${file}\` at turn \`${current.turn}\``);
        })
        .catch((error) => {
          this.send.broadcast(`Could not save \`${file}\`: ${error}.`);
        });
    } else {
      this.send.broadcast(`No active game to save.`);
    }
  }

  private gameJoin(alias: string): void {
    if (!alias || alias.trim().length === 0) {
      return this.send.broadcast(`No alias specified. See \`help game join\`.`);
    }
    const current = this.current;
    if (!current) {
      return this.send.broadcast(
        'No open game lobby. Use `game create` first!',
      );
    }
    if (current instanceof GameState) {
      return this.send.broadcast('Game already in progress.');
    }
    if (current.players.has(this.reply)) {
      return this.send.broadcast(
        `<@${this.reply}> You already are in the lobby.`,
      );
    } else {
      current.players.set(this.reply, alias);
      return this.send.broadcast(`<@${this.reply}> joined the game.`);
    }
  }

  private gameQuit(): void {
    const current = this.current;
    if (!current) {
      return this.send.broadcast('No open game lobby.');
    }
    if (current instanceof GameState) {
      return this.send.broadcast('Game already in progress.');
    }
    if (!current.players.has(this.reply)) {
      return this.send.broadcast(`<@${this.reply}> You are not in the lobby.`);
    } else {
      current.players.delete(this.reply);
      return this.send.broadcast(`<@${this.reply}> left the game.`);
    }
  }

  private gameStart(): void {
    const current = this.current;
    if (!current) {
      return this.send.broadcast('No open game lobby.');
    }
    if (current instanceof GameState) {
      return this.send.broadcast('Game already in progress.');
    }
    if (current.players.size === 0) {
      return this.send.broadcast('No players in the game.');
    } else {
      const players: Player[] = [
        {
          combatRatings: {
            naval: 50,
            ground: 50,
          },
          didEndTurn: false,
          fogOfWar: {},
          name: 'Empire',
        },
      ];
      current.players.forEach((userId, name) => {
        players.push({
          combatRatings: startingCombatRatings(),
          didEndTurn: false,
          fogOfWar: {},
          name,
          userId,
        });
      });
      const generator = new SimpleMapGenerator(current.settings);
      this.current = new GameState(
        {
          fleets: [],
          players,
          scouts: [],
          settings: current.settings,
          systems: generator.generate(players),
          turn: 1,
        },
        (message, player) => {
          if (player && player.userId) {
            this.send.message(player.userId, message);
          } else {
            this.send.broadcast(message);
          }
        },
      );
      // TODO: Nicer start message.
      this.send.broadcast(
        Array.from(current.players.keys())
          .map((userId) => `<@${userId}>`)
          .join(', ') + ' started a game. Good luck Admirals!',
      );
    }
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
