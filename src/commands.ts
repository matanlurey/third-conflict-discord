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
    new Command('build', 'Changes the production queue for a system.', [
      new Option('source', 0, { default: 'Where to build.' }),
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
    ]),
    new Command('end', 'Ends your turn.'),
    new Command('invade', 'Invade planet(s) in an occupied system.', [
      new Option('target', 0, {
        description: 'Target system',
      }),
      new Option('planet', 'p', {
        description:
          '' +
          'Planet number (1 to N). ' +
          'If not specified, splits troops automatically.',
      }),
      new Option('troops', 't', {
        description: 'Amount of troops. Defaults to all.',
      }),
    ]),
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
    new Command('scan', 'Show intelligence about aother system.', [
      new Option('target', 0, { description: 'Target system.' }),
    ]),
    new Command('scout', 'Send a scout to another system.', [
      new Option('target', 0, { description: 'Target system.' }),
      new Option('source', 'o', {
        description:
          '' +
          'Source system. ' +
          'Defaults to the closest system you control.',
      }),
    ]),
    new Command('summary', 'Shows a summary of your game.'),
  ];
}
