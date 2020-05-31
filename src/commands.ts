import commander from 'commander';

interface AdminCreateOptions {
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

export function adminCommand(actions: {
  create: (options: AdminCreateOptions) => void;
  start: () => void;
  save: (name: string) => void;
  load: (name: string) => void;
}): commander.Command {
  const admin = new commander.Command('admin');

  // Do not call process.exit.
  admin.exitOverride((err) => {
    throw err;
  });

  // admin new ...
  admin
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
    .option(
      '-d, --display-level <level>',
      '' +
        'How much information players receive about events in the sector. ' +
        'At the lowest leve ("Show Nothing"), players only receive events ' +
        'about things they did, and the map will only show your systesms and ' +
        'systems you have scouted. ' +
        'Each level above "Show Nothing" tells you a little bit more, with ' +
        '"Everything including *" being intended for beginner players. The ' +
        'recommended default is "Combat and Events", which will tell ' +
        'players when an event occurs and when any combat occurs in the sector.',
      'Combat and Events',
    )
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
  admin
    .command('start')
    .description('Starts the current game.')
    .action(actions.start);

  // admin save/load
  admin
    .command('save <name>')
    .description('Saves the current game.')
    .action(actions.save);
  admin
    .command('load <name>')
    .description('Loads a saved game.')
    .action(actions.load);

  return admin;
}

export function viewCommand(actions: {
  fleets: {
    all: () => void;
    from: (system: string) => void;
    to: (system: string) => void;
    missiles: (system: string) => void;
    scouts: (sysetm: string) => void;
  };
  map: () => void;
  scan: (system: string) => void;
  productionLimits: () => void;
  lastTurnResults: () => void;
  currentPlayerStats: () => void;
  scoreOfAllPlayers: () => void;
  systemsWithUnrest: () => void;
  incomingEnemyFleets: () => void;
}): commander.Command {
  const view = new commander.Command('view');
  const fleets = new commander.Command('fleets');

  // Do not call process.exit.
  view.exitOverride((err) => {
    throw err;
  });
  fleets.exitOverride((err) => {
    throw err;
  });

  fleets
    .command(
      'all',
      'Displays the location and composition of all fleets you have launched.',
      { isDefault: true },
    )
    .action(actions.fleets.all);

  fleets
    .command(
      'from <source>',
      'Shows only fleets that left the `<source>` system.',
    )
    .action(actions.fleets.from);

  fleets
    .command(
      'to <target>',
      'Shows only fleets heading to the `<target>` system.',
    )
    .action(actions.fleets.to);

  fleets
    .command('missiles', 'Shows only missile-based attack fleets.', {
      hidden: true,
    })
    .action(actions.fleets.missiles);

  fleets
    .command('scouts', 'Shows only scout missions.')
    .action(actions.fleets.scouts);

  view.command('map', 'Displays a map of the sector.').action(actions.map);

  view
    .command(
      'scan <system>',
      '' +
        'Displays information about the provided `system.\n\n' +
        'If this is not a system you control limited information may be ' +
        'available. Attacking or using the scout action can reveal updated ' +
        'information.',
      { isDefault: true },
    )
    .action(actions.scan);

  view
    .command('limits', 'Display production limits for systems you control.')
    .action(actions.productionLimits);

  view
    .command(
      'stats',
      'Display information about your perforamnce as an Admiral.',
    )
    .action(actions.currentPlayerStats);

  view
    .command('score', 'Display current score of all players in the game.')
    .action(actions.scoreOfAllPlayers);

  view
    .command(
      'unrest',
      'Display systems and planets that have poor morale and political unrest.',
    )
    .action(actions.systemsWithUnrest);

  view
    .command('detect', 'Display incoming enemy fleets.')
    .action(actions.incomingEnemyFleets);

  view.addCommand(fleets);

  return view;
}
