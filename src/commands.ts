import commander from 'commander';

export interface GameCreateOptions {
  readonly initialFactories: string;
  readonly shipSpeedATurn: string;
  readonly gameDifficulty: string;
  readonly maxGameLength: string;
  readonly displayLevel: string;
  readonly enableNoviceMode: boolean;
  readonly enableSystemDefenses: boolean;
  readonly enableRandomEvents: boolean;
  readonly enableEmpireBuilds: boolean;
}

export function gameCommand(actions: {
  create: (options: GameCreateOptions) => void;
  start: () => void;
  save: (name: string) => void;
  load: (name: string) => void;
  join: () => void;
}): commander.Command {
  const game = new commander.Command('game').description(
    'Various options to start/save/load a game.',
  );

  // Do not call process.exit.
  game.exitOverride((err) => {
    throw err;
  });

  // admin new ...
  game
    .command('new')
    .description('Creates a new game lobby.')
    .action(actions.create)
    .option(
      '-f, --initial-factories <amount>',
      '' +
        'How many factories initial player systems start with. ' +
        'The more factories the faster a system can churn out units. ' +
        'This number is also used as the maximum number of factories than ' +
        'an Empire system will build.',
      '10',
    )
    .option(
      '-s, --ship-speed-a-turn <distance>',
      '' +
        'How many units of distance a ship moves a turn, maximum. ' +
        'The faster the speed the farther ships can make it every turn.',
      '4',
    )
    .option(
      '-g, --game-difficulty <difficulty>',
      '' +
        'Game difficulty, which controls a lot of things. ' +
        'Primarily, this determines how computer players play, the ' +
        'production level, and the severity of privateer attacks.',
      'easy',
    )
    .option(
      '-l, --max-game-length <turns>',
      'Maximum amount of turns the game will go until a player wins.',
      '100',
    )
    // TODO: Add --display-level.
    .option(
      '-n, --enable-novice-mode',
      '' +
        'Novice games do not include StealthShips, Missiles, ' +
        'System Defenses, Production Limits, wrecking, or specialized fleet ' +
        'missions. This is intended to let players get comfortable quickly ' +
        'with the game.',
      false,
    )
    .option(
      '-xd, --no-enable-system-defenses',
      'Removes system defenses from the game.',
      false,
    )
    .option(
      '-xr, --no-enable-random-events',
      '' +
        'Removes random events from the game. ' +
        'Events occur sporadically and affect almost every part of the game.',
      false,
    )
    .option(
      '-xe, --no-enable-empire-builds',
      '' +
        'Removes the ability of imperial systems to produce new units. ' +
        'Imperial systems will produce ships, defenses, and troops at 1/2 ' +
        'the rate of player systems. This feature makes expanding more ' +
        'difficult, since imperial systems are more heavily defended as the ' +
        'game progresses.',
      false,
    );

  // admin start
  game
    .command('start')
    .description('Starts the current game.')
    .action(actions.start);

  // admin save/load
  game
    .command('save <name>')
    .description('Saves the current game.')
    .action(actions.save);
  game
    .command('load <name>')
    .description('Loads a saved game.')
    .action(actions.load);

  // admin join
  game
    .command('join')
    .description('Join the current game.')
    .action(actions.join);

  return game;
}

export function viewCommand(
  options: {
    enableNoviceMode: boolean;
  },
  actions: {
    fleets: {
      all: () => void;
      from: (system: string) => void;
      to: (system: string) => void;
      missiles: () => void;
      scouts: () => void;
    };
    map: () => void;
    scan: (system: string) => void;
    productionLimits: () => void;
    lastTurnResults: () => void;
    currentPlayerStats: () => void;
    scoreOfAllPlayers: () => void;
    systemsWithUnrest: () => void;
    incomingEnemyFleets: () => void;
  },
): commander.Command {
  const view = new commander.Command('view').description(
    'View details of the game.',
  );
  const fleets = new commander.Command('fleets');

  // Do not call process.exit.
  view.exitOverride((err) => {
    throw err;
  });
  fleets.exitOverride((err) => {
    throw err;
  });

  fleets
    .command('all', { isDefault: true })
    .description(
      'Displays the location and composition of all fleets you have launched.',
    )
    .action(actions.fleets.all);

  fleets
    .command('from <source>')
    .description('Shows only fleets that left the `<source>` system.')
    .action(actions.fleets.from);

  fleets
    .command('to <target>')
    .description('Shows only fleets heading to the `<target>` system.')
    .action(actions.fleets.to);

  fleets
    .command('missiles', {
      hidden: options.enableNoviceMode,
    })
    .description('Shows only missile-based attack fleets.')
    .action(actions.fleets.missiles);

  fleets
    .command('scouts')
    .description('Shows only scout missions.')
    .action(actions.fleets.scouts);

  view
    .command('map')
    .description('Displays a map of the sector.')
    .action(actions.map);

  view
    .command('scan <system>', { isDefault: true })
    .description(
      '' +
        'Displays information about the provided `system.\n\n' +
        'If this is not a system you control limited information may be ' +
        'available. Attacking or using the scout action can reveal updated ' +
        'information.',
    )
    .action(actions.scan);

  view
    .command('limits')
    .description('Display production limits for systems you control.')
    .action(actions.productionLimits);

  view
    .command('stats')
    .description('Display information about your perforamnce as an Admiral.')
    .action(actions.currentPlayerStats);

  view
    .command('score')
    .description('Display current score of all players in the game.')
    .action(actions.scoreOfAllPlayers);

  view
    .command('unrest')
    .description(
      'Display systems and planets that have poor morale and political unrest.',
    )
    .action(actions.systemsWithUnrest);

  view
    .command('detect', {
      hidden: options.enableNoviceMode,
    })
    .description('Display incoming enemy fleets.')
    .action(actions.incomingEnemyFleets);

  view.addCommand(fleets);

  return view;
}

export interface AttackOptions {
  readonly origin?: string;
  readonly destination: string;
  readonly warships?: string;
  readonly stealth?: string;
  readonly troops?: string;
  readonly transports?: string;
  readonly buildPoints?: string;
  readonly mission?: string;
}

export interface ScoutOptions {
  readonly origin?: string;
  readonly destination: string;
}

export function launchCommand(
  options: {
    enableNoviceMode: boolean;
  },
  actions: {
    attack: (options: AttackOptions) => void;
    scout: (options: ScoutOptions) => void;
  },
): commander.Command {
  let launch = new commander.Command('launch');

  launch = launch
    .command('attack', { isDefault: true })
    .description('Launches an attack at a target.')
    .option(
      '-o, --origin',
      '' +
        'Origin system. If not specified, defaults to the closest system ' +
        'you control (assuming you have enough units as specified).',
    )
    .option('-d, --destination', 'Destination (target) system.')
    .option('-w, --warships', 'WarShips to send.', '0')
    .option('-t, --troops', 'Troops to send. Up to 50 fit in a Transport.', '0')
    .option('-r, --transports', 'Transport to send.', '0')
    .option(
      '-b, --build-points',
      'Build Points to send. Up to 50 fit in a Transport.',
      '0',
    );

  if (options.enableNoviceMode) {
    launch
      .option('-s, --stealth', 'StealthShips to send.', '0')
      .option(
        '-i, --missiles',
        'Missiles to send. A missile only attack travels at double speed.',
        '0',
      )
      .option(
        '-m, --mission',
        '' +
          'What type of mission to conduct. Either `conquest` (a standard ' +
          'mission to attempt to occupy and assume control a system, the most ' +
          'common type of attack mission), `probe` (a single combat pass ' +
          'intended to inflict attrition, use them when you are out-gunned), ' +
          'and `raid` (used to capture ships and resources from the enemy ' +
          'instead of destroying them).',
        'conquest',
      );
  }

  launch.action(actions.attack);

  launch
    .command('scout')
    .description('Launches a scout mission to a destination.')
    .option(
      '-o, --origin',
      'Origin system. If not specified, defaults to the closest system.',
    )
    .option('-d, --destination', 'Destination system.');

  return launch;
}

export function planetCommand(actions: {
  invade: (system: string) => void;
  unload: (system: string, planet: string, amount?: string) => void;
  load: (system: string, planet: string, amount?: string) => void;
  bombard: (system: string, planet: string) => void;
}): commander.Command {
  const planet = new commander.Command('planet');

  planet
    .command('invade <system>')
    .description('Unload troops to invade all enemy planets.')
    .action(actions.invade);

  planet
    .command('unload <system> <planet> [amount]')
    .description('Unload troops to a specific planet.')
    .action(actions.unload);

  planet
    .command('load <system> <planet> [amount]')
    .description('Load troops from a specific planet.')
    .actions(actions.load);

  planet
    .command('bombard <system> [planet]')
    .description('Bombard a system or a specific planet.')
    .actions(actions.bombard);

  return planet;
}

export function wreckCommand(
  action: (system: string, type: string, amount: string) => void,
): commander.Command {
  return new commander.Command('wreck <unit>')
    .description(
      '' +
        'Voluntarily destroy a unit to return 75% of the construction value. ' +
        'Wrecking can not take place where system morale is less than zero. ' +
        'Even planets can be wrecked, returning a large amount of points, but ' +
        'that has a terrible effect on morale and is not recommended.',
    )
    .action(action);
}

export function endTurnCommand(action: () => void): commander.Command {
  return new commander.Command('end')
    .description(
      '' +
        'Ends your turn. You may still interact with the game until other ' +
        'players have ended their turn.',
    )
    .action(action);
}
