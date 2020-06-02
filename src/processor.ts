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
  prettyPrintFields,
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
          case 'view system':
            return this.viewSystem(args.options['system']);
          case 'attack':
            return this.attack({
              origin: args.options['origin'],
              target: args.options['target'],
              warships: args.options['warships'],
              stealthShips: args.options['stealth'],
              missiles: args.options['missiles'],
              transports: args.options['transports'],
              buildPoints: args.options['build-points'],
              troops: args.options['troops'],
            });
          case 'scout':
            return this.scout({
              origin: args.options['origin'],
              target: args.options['target'],
            });
          case 'end':
            return this.endTurn();
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
    const embed = new discord.MessageEmbed()
      .setTitle(`Admiral ${name}`)
      .setDescription(`**Systems**, **Fleets**, and **Scouts**:`);

    embed
      .addField('Score', `${score}`)
      .addField('Turn', `${game.turn} / ${game.data.settings.maxGameLength}`)
      .addField('Map', `\`\`\`\n${debugMap(game.data.systems)}\n\`\`\``);

    if (facade.systems.length) {
      embed.addField('**Systems**', 'Systems controlled by the player.');
    }

    for (const system of facade.systems) {
      embed.addField(
        `${system.data.name} (${system.data.position[0]}, ${system.data.position[1]})`,
        '' +
          `Fleet: ${system.totalOffensiveShips}\n` +
          `Producing: ${system.data.building || '_Nothing_'}\n` +
          `Morale: ${system.morale}`,
        true,
      );
    }

    if (facade.fleets.length) {
      embed.addField('**Fleets**', 'Fleets sent by the player.');
    }

    for (const fleet of facade.fleets) {
      const total =
        fleet.contents.warShips +
        fleet.contents.stealthShips +
        fleet.contents.missiles;
      const eta = game.timeMove(fleet.distance, fleet.contents);
      embed.addField(
        `${fleet.origin} -> ${fleet.destination}`,
        `ETA: ${eta} turns.\n${total} Offensive Ships.`,
        true,
      );
    }

    if (facade.scouts.length) {
      embed.addField('**Scouts**', 'Scouts sent by the player.');
    }

    for (const scout of facade.scouts) {
      const eta = game.timeScout(scout.distance);
      embed.addField(
        `${scout.origin} -> ${scout.destination}`,
        `ETA: ${eta} turns.`,
        true,
      );
    }

    return this.reply(embed);
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
    if (!this.gameInProgress) {
      return this.gameMustBeInProgress();
    }
    const game = this.current as GameState;
    const name = this.isActiveInGame();
    if (!name) {
      return this.mustBeInGame();
    }
    const facade = game.as(this.replyTo);
    const target = facade.find(system);
    if (!target) {
      return this.notRecognizedSystem(system);
    }
    const scanned = facade.scan(target);
    const embed = new discord.MessageEmbed()
      .setTitle(`${target.name}`)
      .setDescription(
        'This data may not be up to date. Scout a system for details.',
      );

    if (scanned.planets) {
      embed.addField('Planets', scanned.planets.length);
    }
    if (scanned.factories) {
      embed.addField('Factories', scanned.factories);
    }
    if (scanned.owner) {
      embed.addField('Owner', game.as(scanned.owner).player.name);
    }
    if (scanned.fleet) {
      embed.addField('**Fleet**', 'Ships and other defenses.');
      embed.addFields(prettyPrintFields(scanned.fleet));
    }
    return this.reply(embed);
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

  private notRecognizedSystem(name: string): void {
    return this.reply(`No system found named: \`${name}\`.`);
  }

  private attack(options: {
    origin: string;
    target: string;
    warships: number;
    stealthShips: number;
    missiles: number;
    transports: number;
    buildPoints: number;
    troops: number;
  }): void {
    if (!this.gameInProgress) {
      return this.gameMustBeInProgress();
    }
    const game = this.current as GameState;
    const name = this.isActiveInGame();
    if (!name) {
      return this.mustBeInGame();
    }
    const facade = game.as(this.replyTo);
    const originS = facade.find(options.origin);
    if (!originS) {
      return this.notRecognizedSystem(options.origin);
    }
    const targetS = facade.find(options.target);
    if (!targetS) {
      return this.notRecognizedSystem(options.target);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    facade.source(originS)!.attack(
      targetS,
      {
        warShips: options.warships,
        stealthShips: options.stealthShips,
        missiles: options.missiles,
        transports: options.transports,
        buildPoints: options.buildPoints,
        troops: options.troops,
      },
      'conquest',
    );
  }

  private scout(options: { origin: string; target: string }): void {
    if (!this.gameInProgress) {
      return this.gameMustBeInProgress();
    }
    const game = this.current as GameState;
    const name = this.isActiveInGame();
    if (!name) {
      return this.mustBeInGame();
    }
    const facade = game.as(this.replyTo);
    const originS = facade.find(options.origin);
    if (!originS) {
      return this.notRecognizedSystem(options.origin);
    }
    const targetS = facade.find(options.target);
    if (!targetS) {
      return this.notRecognizedSystem(options.target);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    facade.source(originS)!.scout(targetS);
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
    if (!this.gameInProgress) {
      return this.gameMustBeInProgress();
    }
    const game = this.current as GameState;
    const name = this.isActiveInGame();
    if (!name) {
      return this.mustBeInGame();
    }
    const facade = game.as(this.replyTo);
    if (facade.player.didEndTurn) {
      return this.reply('Already ended your turn.');
    } else {
      facade.endTurn();
      return this.reply('Ended your turn.');
    }
  }
}
