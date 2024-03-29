import { camelCase } from 'camel-case';
import minimist from 'minimist';
import stringArv from 'string-argv';
import { Command } from './config';

export interface Parsed {
  readonly matched?: Command;
  readonly options: { [key: string]: boolean | number | string | undefined };
  readonly error?: string;
}

export function parse(
  args: string | string[] | minimist.ParsedArgs,
  commands: Command[],
): Parsed {
  if (typeof args === 'string') {
    args = stringArv(args);
  }
  if (Array.isArray(args)) {
    args = minimist(args);
  }
  let error: string | undefined;
  let matched: Command | undefined;
  for (const command of commands) {
    if (command.name === args._[0]) {
      matched = command;
      break;
    }
  }
  const options: { [key: string]: boolean | number | string | undefined } = {};
  if (matched) {
    const found = new Set<string>().add('_');
    for (const option of matched.options) {
      let value: boolean | number | string | undefined;
      if (option.name in args) {
        value = args[option.name];
        found.add(option.name);
      } else if (
        typeof option.alias === 'number' &&
        option.alias + 1 in args._
      ) {
        value = args._[option.alias + 1];
      } else if (option.alias !== undefined && option.alias in args) {
        value = args[option.alias];
        found.add(option.alias as string);
      } else {
        value = option.default;
      }
      if (value !== undefined) {
        if (
          option.allowed &&
          typeof value !== 'boolean' &&
          option.allowed.indexOf(value) === -1
        ) {
          error = `Invalid value "${value}" for "${
            option.name
          }". Expected: "${option.allowed.join(', ')}".`;
        }
        options[camelCase(option.name)] = value;
      }
    }
    const parsed = new Set(Object.keys(args));
    const unknown = [...parsed].filter((p) => !found.has(p));
    if (unknown.length) {
      error = `Unknown option(s): "${unknown.join(', ')}".`;
    }
  } else if (args._.length) {
    error = `No command found for "${args._[0]}".`;
  } else {
    error = `No command inputted.`;
  }
  return {
    matched,
    options,
    error,
  };
}
