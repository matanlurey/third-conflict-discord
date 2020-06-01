import discord from 'discord.js';
import minimist from 'minimist';
import { allCommands, Command } from './options';

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
    .setThumbnail('https://i.imgur.com/WBbbYXV.png')
    .setDescription(
      `\`${crumbs.length ? crumbs.join(' ') + ' ' : ''}${command.name}\`: ${
        command.description || 'Usage'
      }`,
    );

  if (command.commands && command.options) {
    throw new Error('Unsupported: commands and options.');
  }

  if (command.commands) {
    embed.setDescription(`${embed.description}\n\n**Commands**:`);
    command.commands.forEach((c) => {
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
    command.options.forEach((o) => {
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

export function parseArgs(
  args: minimist.ParsedArgs,
  tree = allCommands,
): {
  command: string;
  options: { [key: string]: unknown | undefined };
  matched: boolean;
} {
  const matched: string[] = [];
  const positional = args._;
  let command: Command | undefined;

  function matchArg(name: string): boolean {
    for (const c of tree) {
      if (c.name === name) {
        matched.push(name);
        command = c;
        tree = c.commands || [];
        return !!c.commands;
      }
    }
    return false;
  }

  for (const a of positional) {
    if (!matchArg(a)) {
      break;
    }
  }

  const options = {};

  if (command && command.options) {
    positional.splice(0, matched.length);
    for (const o of command.options) {
      if (typeof o.name === 'number') {
      }
    }
  }

  return {
    command: matched.join(' '),
    options,
    matched: !!command,
  };
}
