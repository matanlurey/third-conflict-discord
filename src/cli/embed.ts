import { capitalCase } from 'capital-case';
import discord from 'discord.js';
import minimist from 'minimist';
import { allCommands, Command } from './options';

export function prettyPrintFields(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: {},
): discord.EmbedFieldData[] {
  const fields: discord.EmbedFieldData[] = [];
  const entries = Object.entries(options);
  // eslint-disable-next-line prefer-const
  for (let [k, v] of entries) {
    v = v !== undefined && v !== '' ? v : '_Unspecified_';
    if (v === true) {
      v = 'Yes';
    } else if (v === false) {
      v = 'No';
    } else if (typeof v === 'string') {
      v = capitalCase(v);
    }
    fields.push({
      name: capitalCase(k),
      value: v,
      inline: true,
    });
  }
  return fields;
}

export function prettyPrint(
  title: string,
  description: string,
  options: {},
): discord.MessageEmbed {
  return new discord.MessageEmbed()
    .setTitle(title)
    .setColor('#0099ff')
    .setThumbnail('https://i.imgur.com/WBbbYXV.png')
    .setDescription(description)
    .addFields(prettyPrintFields(options));
}

/**
 * Main-menu for the game.
 *
 * @param options
 */
export function preGameMenu(options: {
  waitingForPlayers: boolean;
}): discord.MessageEmbed {
  const embed = new discord.MessageEmbed()
    .setColor('#0099ff')
    .setThumbnail('https://i.imgur.com/WBbbYXV.png')
    .setDescription(
      '_Third Conflict_ is a multiplayer turn-based space strategy.',
    );

  if (!options.waitingForPlayers) {
    embed
      .setTitle('Main Menu (No Game In Progress)')
      .addField(
        '🆕 Create a new game',
        'Type `game create [options]` or `help game create`.',
      )
      .addField(
        '💾 Load an existing game',
        'Type `game load <name>` or `help game load`.',
      );
  } else {
    embed
      .setTitle('Main Menu (Waiting For Players)')
      .addField('🤝 Join the game', 'Type `game join`.')
      .addField('🎬 Start the game', 'Type `game start`.');
  }

  return embed;
}

export function lookup(tree: string[]): [Command, string[]] {
  const crumbs: string[] = [];
  let command!: Command;
  let start: Command[] = allCommands;
  tree.forEach((name) => {
    for (const c of start) {
      if (c.name === name) {
        command = c;
        start = c.commands || [];
        crumbs.push(name);
      }
    }
  });
  return [command, crumbs];
}

/**
 * Explains how to use the provided command.
 *
 * @param command
 */
export function getUsage(
  command: Command,
  crumbs: string[] = [],
): discord.MessageEmbed {
  const embed = new discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`Help`)
    .setThumbnail('https://i.imgur.com/WBbbYXV.png');

  if (command.name) {
    embed.setDescription(
      `\`${crumbs.length ? crumbs.join(' ') + ' ' : ''}${command.name}\`: ${
        command.description || 'Usage'
      }`,
    );
  } else {
    embed.setDescription(command.description);
  }

  if (command.commands && command.options) {
    throw new Error('Unsupported: commands and options.');
  }

  if (command.commands) {
    embed.setDescription(`${embed.description}\n\n**Commands**:`);
    const sorted = command.commands.sort((a, b) => (a.name > b.name ? 1 : -1));
    sorted.forEach((c) => {
      if (!c.hidden) {
        let name = c.name;
        if (c.options) {
          if (c.options.some((c) => typeof c.name === 'number')) {
            name = `${name} ${c.options
              .filter((o) => typeof o.name === 'number')
              .map((n) => `<${n.alias}>`)
              .join(' ')}`;
          }
          if (c.options.some((c) => typeof c.name === 'string')) {
            name = `${name} [options]`;
          }
        }
        embed.addField(name, c.description);
      }
    });
  } else if (command.options) {
    embed.setDescription(`${embed.description}\n\n**Options**:`);
    const sorted = command.options.sort((a, b) => (a.name > b.name ? 1 : -1));
    sorted.forEach((o) => {
      if (!o.hidden) {
        let name: string;
        if (typeof o.name === 'string') {
          name = `--${o.default === true ? '[no-]' : ''}${o.name}`;
          if (o.alias) {
            name = `-${o.alias}, ${name}`;
          }
        } else {
          name = `{${o.name}}${o.alias ? `: ${o.alias}` : ''}`;
        }
        let description = o.description;
        if (o.default !== undefined) {
          description = `_Defaults to \`${o.default}\`._\n\n${description}`;
        }
        if (o.allowed) {
          const allowed = o.allowed.map((i) => `\`${i}\``).join(', ');
          description = `${description}\n\n_Allowed_: ${allowed}`;
        }
        embed.addField(name, description);
      }
    });
  }

  return embed;
}

export function inGameMenu(description: string): discord.MessageEmbed {
  return getUsage({
    name: '',
    description,
    commands: allCommands.filter((c) => c.name !== 'game'),
  });
}

export function parseArgs(
  args: minimist.ParsedArgs,
  tree = allCommands,
): {
  command: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { [key: string]: any };
  matched: boolean;
  terminal: boolean;
  error?: string;
} {
  const matched: string[] = [];
  const positional = args._;
  let command: Command | undefined;
  let noMatch = false;

  function matchArg(name: string): boolean {
    for (const c of tree) {
      if (c.name === name) {
        matched.push(name);
        command = c;
        tree = c.commands || [];
        return true;
      }
    }
    return false;
  }

  for (const a of positional) {
    if (!matchArg(a)) {
      noMatch = true;
      break;
    }
  }

  if (!noMatch && tree.length) {
    for (const c of tree) {
      if (c.default) {
        command = c;
        tree = [];
        break;
      }
    }
  }

  const options: { [key: string]: unknown } = {};
  let error: string | undefined;

  if (command && command.options) {
    positional.splice(0, matched.length);
    for (const o of command.options) {
      let value = o.default;
      if (typeof o.name === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options[o.alias!] = positional[o.name];
        noMatch = false;
      } else {
        if (o.name in args) {
          value = args[o.name];
        } else if (o.alias && o.alias in args) {
          if (o.default === true) {
            value = false;
          } else {
            value = args[o.alias];
          }
        }
        if (value !== undefined) {
          options[o.name] = value;
        }
      }
      if (o.allowed && o.allowed.indexOf(value) === -1) {
        error = `Invalid value for \`${command.name}\`: \`${value}\`.`;
      }
    }
  }

  return {
    command: matched.join(' '),
    options,
    matched: !!command && !noMatch,
    terminal: !command?.commands || !!command?.default,
    error,
  };
}
