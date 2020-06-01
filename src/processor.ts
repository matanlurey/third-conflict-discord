import commander from 'commander';
import stringArgv from 'string-argv';
import {
  AttackOptions,
  endTurnCommand,
  gameCommand,
  GameCreateOptions,
  launchCommand,
  ScoutOptions,
  viewCommand,
  wreckCommand,
} from './commands';
import { defaultSettings } from './game/settings';
import { GameState } from './game/state';

export class CommandProcessor {
  private reply!: string;

  constructor(
    private readonly send: {
      message: (player: string, message: string) => void;
      broadcast: (message: string) => void;
    },
    private readonly program = commander.program,
    private settings = defaultSettings,
    private state?: GameState,
  ) {
    program.addCommand(
      gameCommand({
        create: this.gameCreate.bind(this),
        load: this.gameLoad.bind(this),
        save: this.gameSave.bind(this),
        start: this.gameStart.bind(this),
        join: this.gameJoin.bind(this),
      }),
    );
    program.addCommand(
      viewCommand(
        {
          enableNoviceMode: settings.enableNoviceMode,
        },
        {
          fleets: {
            all: this.viewFleetAll.bind(this),
            from: this.viewFleetFrom.bind(this),
            to: this.viewFleetTo.bind(this),
            missiles: this.viewFleetMissiles.bind(this),
            scouts: this.viewFleetScouts.bind(this),
          },
          map: this.viewMap.bind(this),
          scan: this.viewSystem.bind(this),
          productionLimits: this.viewProductionLimits.bind(this),
          lastTurnResults: this.viewLastTurnResults.bind(this),
          currentPlayerStats: this.viewCurrentPlayerStats.bind(this),
          scoreOfAllPlayers: this.viewScoreOfAllPlayers.bind(this),
          systemsWithUnrest: this.viewSystemsWithUnrest.bind(this),
          incomingEnemyFleets: this.viewIncomingEnemyFleets.bind(this),
        },
      ),
    );
    program.addCommand(
      launchCommand(
        {
          enableNoviceMode: settings.enableNoviceMode,
        },
        {
          attack: this.attack.bind(this),
          scout: this.scout.bind(this),
        },
      ),
    );
    if (!settings.enableNoviceMode) {
      program.addCommand(wreckCommand(this.wreck.bind(this)));
    }
    program.addCommand(endTurnCommand(this.endTurn.bind(this)));
    program.exitOverride((err) => {
      throw err;
    });
    program.addHelpCommand(false);
    program.helpOption('help <command>', 'Displays help for a command.');
    process.stdout.columns = 80;
  }

  process(user: string, message: string): void {
    this.reply = user;
    try {
      const argv = stringArgv(message);
      if (argv[0] === 'help') {
        let command = this.program;
        for (const a of argv.slice(1)) {
          for (const c of command.commands) {
            if (c.name() === a) {
              command = c;
              break;
            }
          }
        }
        this.send.message(
          user,
          '\n```\n' + command.helpInformation() + '\n```',
        );
        this.program;
      } else {
        this.program.parse(argv);
      }
    } catch (e) {
      console.warn('Error processing', message, e);
    }
  }

  private replyInvalidArgument(
    name: string,
    value: string,
    details?: string,
  ): void {
    let message = `Invalid argument \`${name}\`: ${value}`;
    if (details) {
      message = `${message}: ${details}.`;
    } else {
      message = `${message}.`;
    }
    this.send.message(this.reply, message);
  }

  private gameCreate(options: GameCreateOptions): void {
    // TODO: Implement.
    const displayLevel = 'Combat and Events';

    let initialFactories: 10 | 15 | 20;
    switch (options.initialFactories) {
      case '10':
        initialFactories = 10;
        break;
      case '15':
        initialFactories = 15;
        break;
      case '20':
        initialFactories = 20;
        break;
      default:
        this.replyInvalidArgument(
          'initial-factories',
          options.initialFactories,
          'Only "10", "15", "20" supported',
        );
        return;
    }

    let shipSpeedATurn: 4 | 5 | 6;
    switch (options.shipSpeedATurn) {
      case '4':
        shipSpeedATurn = 4;
        break;
      case '5':
        shipSpeedATurn = 5;
        break;
      case '6':
        shipSpeedATurn = 6;
        break;
      default:
        this.replyInvalidArgument(
          'ship-speed-a-turn',
          options.shipSpeedATurn,
          'Only "4", "5", "6" supported',
        );
        return;
    }

    let gameDifficulty: 'Easy' | 'Hard' | 'Tough';
    switch (options.gameDifficulty.toLocaleLowerCase()) {
      case 'easy':
        gameDifficulty = 'Easy';
        break;
      case 'hard':
        gameDifficulty = 'Hard';
        break;
      case 'tough':
        gameDifficulty = 'Tough';
        break;
      default:
        this.replyInvalidArgument(
          'game-difficulty',
          options.gameDifficulty,
          'Only "Easy", "Hard", "Tough" supported',
        );
        return;
    }

    const maxGameLength = parseInt(options.maxGameLength);
    if (maxGameLength < 1 || !Number.isSafeInteger(maxGameLength)) {
      this.replyInvalidArgument(
        'max-game-length',
        options.maxGameLength,
        'Must choose a positive integer >= 1',
      );
      return;
    }

    // Reset game.
    this.state = undefined;
    this.settings = {
      initialFactories,
      shipSpeedATurn,
      gameDifficulty,
      maxGameLength,
      displayLevel,
      enableNoviceMode: options.enableNoviceMode,
      enableSystemDefenses:
        options.enableSystemDefenses && !options.enableNoviceMode,
      enableEmpireBuilds: options.enableEmpireBuilds,
      enableRandomEvents: options.enableRandomEvents,
    };

    this.send.broadcast(
      '' +
        `New game created:\n\n` +
        `\`\`\`\n` +
        JSON.stringify(this.settings, undefined, 2) +
        `\n\`\`\``,
    );
  }

  private gameLoad(file: string): void {
    // TODO: Implement.
    console.log('TODO', 'gameCreate', file);
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

  private attack(options: AttackOptions): void {
    // TODO: Implement.
    console.log('TODO', 'attack', options);
  }

  private scout(options: ScoutOptions): void {
    // TODO: Implement.
    console.log('TODO', 'scout', options);
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
