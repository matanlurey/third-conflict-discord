import { Command, Option } from './command/config';

function basicUnits(): Option[] {
  return [
    new Option('target', 0, { description: 'Target system.' }),
    new Option('source', 'o', { description: 'Source system.' }),
    new Option('warships', 'w', {
      description: 'WarShips to send.',
      default: 0,
    }),
    new Option('transports', 'r', {
      description: 'Transports to send.',
      default: 0,
    }),
    new Option('troops', 't', {
      description: 'Troops to send. 50 fit in a Transport.',
      default: 0,
    }),
    new Option('points', 'p', {
      description: 'Build points to send. 50 fit in a Transport.',
      default: 0,
    }),
  ];
}

function advancedUnits(): Option[] {
  return [
    new Option('stealthships', 's', {
      description: 'StealthShips to send.',
      default: 0,
    }),
    new Option('missiles', 'm', {
      description: 'Missiles to send.',
      default: 0,
    }),
  ];
}

export default function (
  options: {
    enableNoviceMode: boolean;
    enableSystemDefenses: boolean;
  } = {
    enableNoviceMode: false,
    enableSystemDefenses: true,
  },
): Command[] {
  if (options.enableNoviceMode) {
    options.enableSystemDefenses = false;
  }
  return [
    new Command('attack', 'Send an offensive fleet to an enemy system.', [
      ...basicUnits(),
      ...(options.enableNoviceMode ? [] : advancedUnits()),
      new Option('source', 'o', {
        description:
          '' +
          'Source system. ' +
          'Defaults to the closest system you control.',
      }),
    ]),
    new Command(
      'build',
      '' +
        'Changes the production queue for a system. Units build automatically ' +
        'upon ending your turn. To increase your production, build more ' +
        'factories and keep your morale high.',
      [
        new Option('source', 0, { default: 'System to build in.' }),
        new Option('unit', 1, {
          allowed: ((): string[] => {
            const canBuild = [
              'nothing',
              'warships',
              'transports',
              'factories',
              'planets',
            ];
            if (options.enableSystemDefenses) {
              canBuild.push('defenses');
            }
            if (!options.enableNoviceMode) {
              canBuild.push('stealthships', 'missiles');
            }
            return canBuild;
          })(),
          description: 'What to build.',
        }),
      ],
    ),
    new Command('end', 'Ends your turn.'),
    new Command('help', 'Explains the command system.', [
      new Option('command', 0),
    ]),
    new Command('map', 'Show a map only.'),
    new Command('move', 'Reinforce a friendly system.', [
      ...basicUnits(),
      ...(options.enableNoviceMode ? [] : advancedUnits()),
      new Option('source', 'o', {
        description:
          '' +
          'Source system. ' +
          'Defaults to the closest system you control.',
      }),
    ]),
    new Command('recall', 'Recall a fleet or scount.', [
      new Option('number', 0, { description: 'Fleet or scout number.' }),
      new Option('scout', 's', {
        default: false,
        description: 'Recalls scout (not fleet).',
      }),
    ]),
    new Command('scan', 'Show intelligence about aother system.', [
      new Option('target', 0, { description: 'Target system.' }),
      new Option('planets', 'p', {
        default: true,
        description: 'Whether to show planets.',
      }),
    ]),
    new Command(
      'scout',
      '' +
        'Send a scout to another system. Will send a StealthShip if available, ' +
        'otherwise a WarShip. WarShips can be detected!',
      [
        new Option('target', 0, { description: 'Target system.' }),
        new Option('source', 'o', {
          description:
            '' +
            'Source system. ' +
            'Defaults to the closest system you control.',
        }),
      ],
    ),
    new Command('summary', 'Shows a summary of your game.', [
      new Option('show-scouts', 's', {
        description: 'Show outgoing scouts.',
        default: false,
      }),
    ]),
    new Command('troops', 'Load/unload troops from planet(s).', [
      new Option('command', 0, {
        allowed: ['invade', 'load', 'unload'],
        description:
          'In order to move troops between planets, you must load ' +
          'them into Transports, and unload them upon arrival at their ' +
          'intended destination.',
      }),
      new Option('system', 1, { description: 'Target system, such as Alfa.' }),
      new Option('amount', 2, {
        description: 'Number of troops, otherwise maximum available.',
        default: 0,
      }),
      new Option('planet', 'p', {
        description: 'From/to planet, otherwise equally split.',
        default: 0,
      }),
    ]),
  ];
}
