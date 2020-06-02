export const allCommands: Command[] = [
  {
    name: 'game',
    description: 'Setup, join, load, or save a game.',
    commands: [
      {
        name: 'create',
        description: 'Create a new game lobby.',
        options: [
          {
            name: 'initial-factories',
            alias: 'f',
            default: 10,
            allowed: [10, 15, 20],
            description:
              '' +
              'How many factories initial systems start with.\n\nThe more ' +
              'factories the faster a system can churn out units. This ' +
              'number is also used as the maximum number of factories ' +
              'that an imperial system will build.',
          },
          {
            name: 'ship-speed-a-turn',
            alias: 's',
            default: 4,
            allowed: [4, 5, 6],
            description:
              '' +
              'How many units of distance a ship moves a turn.\n\n' +
              'The faster the speed the farther ships can make it every turn ' +
              'of the game.',
          },
          {
            name: 'game-difficulty',
            alias: 'd',
            default: 'easy',
            allowed: ['easy', 'hard', 'tough'],
            description:
              '' +
              'Game difficulty, which controls a lot of things.\n\n' +
              'Primarily, this determines how computer players will play, ' +
              'the production level, and the severity of privateer attacks.',
          },
          {
            name: 'max-game-length',
            alias: 'l',
            default: 100,
            description:
              '' +
              'Maximum amount of turns the game will go until a player wins.',
          },
          {
            name: 'display-level',
            alias: 'v',
            hidden: true,
            default: 'combat-and-events',
            allowed: [
              'nothing',
              'combat-and-events',
              'combat-events-and-movements',
              'combat-events-moves-and-scouts',
              'everything',
              'everything-and-free-intel',
            ],
            description:
              '' +
              'How much information players receive about events in the ' +
              'sector.\n\n' +
              'At the lowest level (`nothing`), you only receive events ' +
              'about things you did, and the map will only show your systems ' +
              'and systems you have scouted.\n\n' +
              'Each level above `nothing` tells you a little bit more, with ' +
              '`everything` and `everything-and-free-intel` being intended ' +
              'for beginner players.',
          },
          {
            name: 'novice-mode',
            alias: 'n',
            default: false,
            description:
              '' +
              'Novice games do not include StealthShips, Missiles, System ' +
              'Defenses, Production Limits, wrecking, or specialized fleet ' +
              'missions. This is intended to let players get comfortable ' +
              'quickly.',
          },
          {
            name: 'system-defenses',
            alias: 'D',
            default: true,
            description: 'The creation of system defenses.',
          },
          {
            name: 'random-events',
            alias: 'R',
            default: true,
            description:
              '' +
              'Random events.\n\n' +
              'Events occur sporadically and affect almost every part of the ' +
              'game.',
          },
          {
            name: 'empire-builds',
            alias: 'E',
            default: true,
            description:
              '' +
              'Imperial systems producing new units.\n\n' +
              'If `true`, imperial systems will produce ships, defenses, and ' +
              'troops at 1/2 the rate of player systems. Turning on this ' +
              'option makes expanding more difficult, since imperial systems ' +
              'are more heavily defended as the game progresses.',
          },
        ],
      },
      {
        name: 'load',
        description: 'Loads an existing game.',
        options: [
          {
            name: 0,
            alias: 'file',
            description: 'Name of the file to load.',
          },
        ],
      },
      {
        name: 'save',
        description: 'Saves the current game.',
        options: [
          {
            name: 0,
            alias: 'file',
            description: 'Name of the file to save.',
          },
        ],
      },
      {
        name: 'join',
        description: 'Joins the current game lobby.',
        options: [
          {
            name: 0,
            alias: 'name',
            description: 'Alias for the game.',
          },
        ],
      },
      {
        name: 'start',
        description: 'Starts the current game lobby.',
      },
      {
        name: 'quit',
        description: 'Quits the game.',
      },
    ],
  },
  {
    name: 'view',
    description: 'View details about the game.',
    commands: [
      {
        name: 'summary',
        description: 'View a summary about the game this turn.',
        default: true,
      },
      {
        name: 'fleets',
        description: 'View details about your fleets.',
      },
      {
        name: 'scouts',
        description: 'View details about your scouts.',
      },
      {
        name: 'system',
        description: 'View details about a sector.',
        options: [
          {
            name: 0,
            alias: 'name',
            description: 'Name or initial of the sector to view.',
          },
        ],
      },
      {
        name: 'incoming',
        description: 'View incoming (detected) enemy fleets.',
      },
      {
        name: 'unrest',
        description: 'View your sectors or planets in unrest.',
      },
      {
        name: 'score',
        description: 'View statistics and scores for the game.',
      },
    ],
  },
  {
    name: 'attack',
    description: 'Send an attack fleet to another sector.',
    options: [
      {
        name: 0,
        alias: 'origin',
        description: 'Origin sector (name or initial).',
      },
      {
        name: 1,
        alias: 'target',
        description: 'Target sector (name or initial).',
      },
      {
        name: 'warships',
        alias: 'w',
        default: 0,
        description: 'Number of WarShips to send.',
      },
      {
        name: 'stealth',
        alias: 's',
        default: 0,
        description: 'Number of StealthShips to send.',
      },
      {
        name: 'missiles',
        alias: 'm',
        default: 0,
        description: 'Number of Missiles to send.',
      },
      {
        name: 'transports',
        alias: 'r',
        default: 0,
        description: 'Number of Transports to send.',
      },
      {
        name: 'build-points',
        alias: 'b',
        default: 0,
        description: 'Number of Build Points to send (50 per Transport).',
      },
      {
        name: 'troops',
        alias: 't',
        default: 0,
        description: 'Number of Troops to send (50 per Transport).',
      },
    ],
  },
  {
    name: 'scout',
    description: 'Send a scout to another sector.',
    options: [
      {
        name: 0,
        alias: 'origin',
        description: 'Origin sector (name or initial).',
      },
      {
        name: 1,
        alias: 'target',
        description: 'Target sector (name or initial).',
      },
    ],
  },
];

export interface Command {
  /**
   * Name of the command.
   */
  readonly name: string;

  /**
   * Description of the command.
   */
  readonly description?: string;

  /**
   * Whether the command is a default.
   */
  readonly default?: true;

  /**
   * Sub-commands.
   */
  readonly commands?: Command[];

  /**
   * Options.
   */
  readonly options?: Option[];

  /**
   * Whether this command should be hidden by default.
   */
  readonly hidden?: true;
}

export interface Option {
  /**
   * Name or position of the option.
   */
  readonly name: string | number;

  /**
   * Description of the command.
   */
  readonly description?: string;

  /**
   * Option alias (short name).
   */
  readonly alias?: string;

  /**
   * Default value.
   */
  readonly default?: string | number | boolean;

  /**
   * Allowed values.
   */
  readonly allowed?: unknown[];

  /**
   * Whether this option should be hidden by default.
   */
  readonly hidden?: true;
}
