import discord from 'discord.js';
import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import stringArgv from 'string-argv';
import {
  getUsage,
  inGameMenu,
  lookup,
  parseArgs,
  preGameMenu,
  prettyPrint,
} from './cli/embed';
import { startingCombatRatings } from './game/combat';
import { debugMap, SimpleMapGenerator } from './game/map';
import { calculateScore } from './game/score';
import { Player } from './game/sector';
import { Settings } from './game/settings';
import { GameState } from './game/state';

interface PendingGame {
  settings: Settings;
  players: Map<string, string>;
}

export class CommandProcessor {
  private replyTo!: string;
  private wasDm = false;

  constructor(
    private readonly send: {
      message: (player: string, message: string | discord.MessageEmbed) => void;
      broadcast: (messages: string | discord.MessageEmbed) => void;
    },
    private current?: PendingGame | GameState | undefined,
  ) {}

  private get isPrivleged(): boolean {
    return this.replyTo === '103004235385307136';
  }

  private lackOfPermissions(): void {
    return this.send.broadcast(
      `<@${this.replyTo}> does not have permissions to do that.`,
    );
  }

  private reply(message: string | discord.MessageEmbed): void {
    if (this.wasDm) {
      return this.send.message(this.replyTo, message);
    } else {
      return this.send.broadcast(message);
    }
  }

  process(user: string, message: string, dm = false): void {
    try {
      this.wasDm = dm;
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
    this.replyTo = user;

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
        console.log(`> ${args.command}`);
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
          case 'view summary':
            return this.viewSummary();
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
        return this.reply(inGameMenu('How to play'));
      } else {
        // Send a custom menu for the game lobby.
        this.reply(preGameMenu({ waitingForPlayers: !!this.current }));
      }
    } else {
      // Auto-generate a help menu for an inner command.
      const result = lookup(commandTree);
      const command = result[0];
      const crumbs = result[1];
      if (command) {
        this.reply(getUsage(command, crumbs.splice(0, crumbs.length - 1)));
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
    if (this.gameInProgress) {
      return this.reply('Game already in progress!');
    }
    if (!this.isPrivleged) {
      return this.lackOfPermissions();
    }
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
    if (this.gameInProgress) {
      return this.reply('Game already in progress!');
    }
    if (!this.isPrivleged) {
      return this.lackOfPermissions();
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
    if (!this.gameInProgress) {
      return this.reply('Game must be in progress!');
    }
    if (!this.isPrivleged) {
      return this.lackOfPermissions();
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
    if (current.players.has(this.replyTo)) {
      return this.send.broadcast(
        `<@${this.replyTo}> You already are in the lobby.`,
      );
    } else {
      current.players.set(this.replyTo, alias);
      return this.send.broadcast(`<@${this.replyTo}> joined the game.`);
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
    if (!current.players.has(this.replyTo)) {
      return this.send.broadcast(`<@${this.reply}> You are not in the lobby.`);
    } else {
      current.players.delete(this.replyTo);
      return this.send.broadcast(`<@${this.reply}> left the game.`);
    }
  }

  private gameStart(): void {
    const current = this.current;
    if (!this.isPrivleged) {
      return this.lackOfPermissions();
    }
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
      current.players.forEach((name, userId) => {
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
        inGameMenu(
          Array.from(current.players.keys())
            .map((userId) => `<@${userId}>`)
            .join(', ') + ' started a game. Good luck Admirals!',
        ),
      );
    }
  }

  private gameMustBeInProgress(): void {
    return this.reply('Game is not in progress.');
  }

  private isActiveInGame(): string | undefined {
    const current = this.current;
    return current instanceof GameState
      ? current.hasPlayer(this.replyTo)
      : undefined;
  }

  private mustBeInGame(): void {
    return this.reply('You are not in this game.');
  }

  private viewSummary(): void {
    if (!this.gameInProgress) {
      return this.gameMustBeInProgress();
    }
    const game = this.current as GameState;
    const name = this.isActiveInGame();
    if (!name) {
      return this.mustBeInGame();
    }
    const facade = game.as(this.replyTo);
    const player = facade.player;
    const totals = game.totals();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const score = calculateScore(totals.get(player)!);
    return this.reply(
      new discord.MessageEmbed()
        .setTitle(`Admiral ${name} (Score: ${score})`)
        .setDescription(
          '' +
            `**Turn**: ${game.turn} of ${game.data.settings.maxGameLength}\n\n` +
            `**Map**:\n\`\`\`\n${debugMap(
              game.data.systems,
            )}\n\`\`\`\n**Alerts**: _None_.\n\n` +
            `**Systems**: WIP`,
        ),
    );
  }

  private viewFleets(): void {
    // TODO: Implement.
    console.log('TODO', 'viewFleets');
  }

  private viewScouts(): void {
    // TODO: Implement.
    console.log('TODO', 'viewScouts');
  }

  private viewSystem(system: string): void {
    // TODO: Implement.
    console.log('TODO', 'viewSystem', system);
  }

  private viewIncoming(): void {
    // TODO: Implement.
    console.log('TODO', 'viewIncoming');
  }

  private viewUnrest(): void {
    // TODO: Implement.
    console.log('TODO', 'viewUnrest');
  }

  private viewScore(): void {
    // TODO: Implement.
    console.log('TODO', 'viewScore');
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
