import { Command, Option } from '../../src/command/config';
import { parse } from '../../src/command/parser';

test('should match a command', () => {
  const result = parse('foo', [new Command('foo', 'A command.')]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({});
  expect(result.error).toBeUndefined();
});

test('should return a failure [no input]', () => {
  const result = parse('', []);
  expect(result.matched).toBeUndefined();
  expect(result.options).toEqual({});
  expect(result.error).toEqual('No command inputted.');
});

test('should return a failure [no match]', () => {
  const result = parse('foo', []);
  expect(result.matched).toBeUndefined();
  expect(result.options).toEqual({});
  expect(result.error).toEqual('No command found for "foo".');
});

test('should return a failure [no option match]', () => {
  const result = parse('foo --bar -c', [new Command('foo', 'A command.')]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({});
  expect(result.error).toEqual(`Unknown option(s): "bar, c".`);
});

test('should return a failure [not allowed option]', () => {
  const result = parse('foo --bar d', [
    new Command('foo', 'A command.', [
      new Option('bar', 'b', { allowed: ['a', 'b', 'c'] }),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    bar: 'd',
  });
  expect(result.error).toEqual(
    `Invalid value "d" for "bar". Expected: "a, b, c".`,
  );
});

test('should match an option', () => {
  const result = parse('foo --bar baz', [
    new Command('foo', 'A command.', [new Option('bar', 'b')]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    bar: 'baz',
  });
  expect(result.error).toBeUndefined();
});

test('should match an option [default]', () => {
  const result = parse('foo', [
    new Command('foo', 'A command.', [
      new Option('bar', 'b', { default: 'baz' }),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    bar: 'baz',
  });
  expect(result.error).toBeUndefined();
});

test('should match an option [alias]', () => {
  const result = parse('foo -b baz', [
    new Command('foo', 'A command.', [new Option('bar', 'b')]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    bar: 'baz',
  });
  expect(result.error).toBeUndefined();
});

test('should match an option [flag]', () => {
  const result = parse('foo --enable-bar', [
    new Command('foo', 'A command.', [
      new Option('enable-bar', 'b', { default: false }),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    enableBar: true,
  });
  expect(result.error).toBeUndefined();
});

test('should default to an option [flag]', () => {
  const result = parse('foo', [
    new Command('foo', 'A command.', [
      new Option('enable-bar', 'b', { default: false }),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    enableBar: false,
  });
  expect(result.error).toBeUndefined();
});

test('should match an option [negatable]', () => {
  const result = parse('foo --no-enable-bar', [
    new Command('foo', 'A command.', [
      new Option('enable-bar', 'b', { default: true }),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    enableBar: false,
  });
  expect(result.error).toBeUndefined();
});

test('should match an alias [positional]', () => {
  const result = parse('foo bar baz', [
    new Command('foo', 'A command.', [
      new Option('name', 0),
      new Option('description', 1),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    name: 'bar',
    description: 'baz',
  });
  expect(result.error).toBeUndefined();
});

test('should match an alias [positional w/ non-positional]', () => {
  const result = parse('foo bar --baz 50', [
    new Command('foo', 'A command.', [
      new Option('name', 0),
      new Option('baz', 'b'),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    name: 'bar',
    baz: 50,
  });
  expect(result.error).toBeUndefined();
});

test('should match multiple aliased positional arguments', () => {
  const result = parse('foo bar baz 50', [
    new Command('foo', 'A command.', [
      new Option('a1', 0),
      new Option('a2', 1),
      new Option('a3', 2, { default: 0 }),
    ]),
  ]);
  expect(result.matched?.name).toEqual('foo');
  expect(result.options).toEqual({
    a1: 'bar',
    a2: 'baz',
    a3: 50,
  });
  expect(result.error).toBeUndefined();
});
