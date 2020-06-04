import columnify from 'columnify';
import { MessageEmbed } from 'discord.js';
import { Command } from './config';

/**
 * Describes a command in terms of the name and other options.
 *
 * @param command
 */
function describeCommand(command: Command): string {
  let text = command.name;
  let more = false;
  for (const option of command.options) {
    if (typeof option.alias === 'number') {
      text = `${text} <${option.name}>`;
    } else {
      more = true;
    }
  }
  if (more) {
    text = `${text} [options]`;
  }
  return text;
}

export function getSimpleUsage(commands: Command | Command[]): string {
  const result: string[] = [];
  if (commands instanceof Command) {
    result.push(describeCommand(commands));

    if (commands.description) {
      result.push(commands.description);
    }

    result.push('');

    const ordered = Array.from(commands.options).sort((a, b) =>
      a.name > b.name ? 1 : -1,
    );
    if (ordered.filter((o) => typeof o.alias !== 'number').length) {
      const records: Record<string, unknown> = {};
      for (const option of ordered) {
        if (typeof option.alias !== 'number') {
          const name = `--${option.name}, -${option.alias}`;
          const value = option.description;
          records[name] = value;
        }
      }
      result.push(
        columnify(records, {
          columns: ['option', 'details'],
          showHeaders: false,
          minWidth: 20,
          maxWidth: 60,
        }),
      );
    }
  } else {
    const ordered = Array.from(commands).sort((a, b) =>
      a.name > b.name ? 1 : -1,
    );
    for (const command of ordered) {
      result.push(describeCommand(command));

      if (command.description) {
        result.push(command.description);
      }

      result.push('');
    }
  }
  return result.join('\n');
}

export function getRichUsage(commands: Command | Command[]): MessageEmbed {
  const result = new MessageEmbed().setTitle('Usage');
  if (commands instanceof Command) {
    result.setDescription(describeCommand(commands));

    if (commands.description) {
      result.setDescription(`${result.description}\n${commands.description}`);
    }

    result.setDescription(`${result.description}\n`);

    const ordered = Array.from(commands.options).sort((a, b) =>
      a.name > b.name ? 1 : -1,
    );
    if (ordered.filter((o) => typeof o.alias !== 'number').length) {
      for (const option of ordered) {
        if (typeof option.alias !== 'number') {
          const name = `--${option.name}, -${option.alias}`;
          const value = option.description;
          result.addField(name, value);
        }
      }
    }
  } else {
    const ordered = Array.from(commands).sort((a, b) =>
      a.name > b.name ? 1 : -1,
    );
    for (const command of ordered) {
      const name = describeCommand(command);
      result.addField(name, command.description);
    }
  }
  return result;
}
