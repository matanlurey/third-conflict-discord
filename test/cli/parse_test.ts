import minimist from 'minimist';
import stringArgv from 'string-argv';
import { parseArgs } from '../../src/cli/embed';

// Minimal command processor.
function parse(
  args: string,
): {
  command: string;
  options: { [key: string]: unknown | undefined };
  matched: boolean;
} {
  const argv = stringArgv(args);
  const objs = minimist(argv);
  return parseArgs(objs);
}

test('should parse "game create"', () => {
  const args = parse('game create');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
});

test('should parse "game create" with options', () => {
  const args = parse('game create --initial-factories 10');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    'initial-factories': 10,
  });
});

test('should parse "game create" with an alias', () => {
  const args = parse('game create -f 10');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    'initial-factories': 10,
  });
});

test('should parse "game create" with a flag', () => {
  const args = parse('game create --novice-mode');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    'novice-mode': true,
  });
});

test('should parse "game create" with an alias (flag)', () => {
  const args = parse('game create -n');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    'novice-mode': true,
  });
});

test('should parse "game create" with a negative flag', () => {
  const args = parse('game create --no-random-events');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    'random-events': false,
  });
});

test('should parse "game create" with an alias (negative flag)', () => {
  const args = parse('game create -R');
  expect(args.command).toBe('game create');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    'random-events': false,
  });
});

test('should parse "game load" with positional args', () => {
  const args = parse('game load foo.json');
  expect(args.command).toBe('game load');
  expect(args.matched).toBe(true);
  expect(args.options).toMatchObject({
    file: 'foo.json',
  });
});

test('should parse a default command', () => {
  const args = parse('view A');
  expect(args.command).toBe('view system');
  expect(args.options).toMatchObject({
    system: 'A',
  });
});

test('should parse a default command fully spelled out', () => {
  const args = parse('view system A');
  expect(args.command).toBe('view system');
  expect(args.options).toMatchObject({
    system: 'A',
  });
});

test('should parse "end"', () => {
  const args = parse('end');
  expect(args.command).toBe('end');
  expect(args.matched).toBe(true);
});
