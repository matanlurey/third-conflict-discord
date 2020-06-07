import { ArgumentError, CliReader, OptionReader } from '../../src/cli/reader';
import { parse, Parsed } from '../../src/command/parser';
import commands from '../../src/commands';
import { Point } from '../../src/game/state/point';

describe('OptionReader', () => {
  let reader: OptionReader;

  describe('boolean', () => {
    test('should read', () => {
      reader = new OptionReader({ a: true });
      expect(reader.requireBoolean('a')).toBe(true);
    });

    test('should throw', () => {
      reader = new OptionReader({ a: 'foo' });
      expect(() => reader.requireBoolean('a')).toThrowError(ArgumentError);
    });
  });

  describe('integer', () => {
    test('should read', () => {
      reader = new OptionReader({ a: 1 });
      expect(reader.requireInteger('a')).toBe(1);
    });

    test('should throw [invalid]', () => {
      reader = new OptionReader({ a: 'foo' });
      expect(() => reader.requireInteger('a')).toThrowError(ArgumentError);
    });
  });

  describe('string', () => {
    test('should read', () => {
      reader = new OptionReader({ a: 'foo' });
      expect(reader.requireString('a')).toBe('foo');
    });

    test('should throw [invalid]', () => {
      reader = new OptionReader({ a: true });
      expect(() => reader.requireString('a')).toThrowError(ArgumentError);
    });

    test('should throw [empty]', () => {
      reader = new OptionReader({ a: '    ' });
      expect(() => reader.requireString('a')).toThrowError(ArgumentError);
    });
  });
});

describe('CliReader', () => {
  function cli(input: string): Parsed {
    return parse(input, commands());
  }

  let reader: CliReader;
  let mockHooks: { [key: string]: jest.Mock };
  let mockHandlers: { [key: string]: jest.Mock };

  beforeEach(() => {
    mockHooks = {
      player: jest.fn(),
      system: jest.fn(),
      closest: jest.fn(),
    };
    mockHandlers = {
      attack: jest.fn(),
      build: jest.fn(),
      end: jest.fn(),
      scan: jest.fn(),
      scout: jest.fn(),
      summary: jest.fn(),
      troops: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reader = new CliReader(mockHooks as any, mockHandlers as any);
  });

  describe('attack', () => {
    test('should throw [invalid user]', () => {
      expect(() =>
        reader.read('4455', cli('attack Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid player: \\"4455\\" is not in the game."`,
      );
    });

    test('should throw [invalid target]', () => {
      mockHooks.player.mockReturnValue({ state: {} });
      expect(() =>
        reader.read('1234', cli('attack Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid system: \\"Alfa\\" is not in the game."`,
      );
    });

    test('should throw [no nearby system]', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      mockHooks.system.mockReturnValue({ state: { name: 'Bravo' } });
      expect(() =>
        reader.read('1234', cli('attack Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Could not find a friendly system of \\"Joe\\"."`,
      );
    });

    test('should call handler.attack', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      mockHooks.closest.mockReturnValue({
        state: { name: 'Alfa' },
        position: new Point([0, 0]),
      });
      mockHooks.system.mockReturnValue({
        state: { name: 'Bravo' },
        position: new Point([4, 0]),
      });
      reader.read('1234', cli('attack Alfa -w 10'));
      expect(mockHandlers.attack.mock.calls).toHaveLength(1);
    });
  });

  describe('build', () => {
    test('should throw [invalid user]', () => {
      expect(() =>
        reader.read('4455', cli('build Alfa warships')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid player: \\"4455\\" is not in the game."`,
      );
    });

    test('should call handler.build', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      mockHooks.system.mockReturnValue({ state: { name: 'Alfa' } });
      reader.read('1234', cli('build Alfa warships'));
      expect(mockHandlers.build.mock.calls).toHaveLength(1);
    });
  });

  describe('end', () => {
    test('should throw [invalid user]', () => {
      expect(() =>
        reader.read('4455', cli('end')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid player: \\"4455\\" is not in the game."`,
      );
    });

    test('should call handler.end', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      reader.read('1234', cli('end'));
      expect(mockHandlers.end.mock.calls).toHaveLength(1);
    });
  });

  describe('troops', () => {
    test('should throw [invalid system]', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      expect(() =>
        reader.read('1234', cli('troops unload Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid system: \\"Alfa\\" is not in the game."`,
      );
    });

    test('should throw [invalid sub-command]', () => {
      mockHooks.system.mockReturnValue({});
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      expect(() =>
        reader.read('1234', cli('troops explode Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid: Invalid value \\"explode\\" for \\"command\\". Expected: \\"invade, load, unload\\".."`,
      );
    });

    test('should call handler.troops', () => {
      mockHooks.system.mockReturnValue({});
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      reader.read('1234', cli('troops unload Alfa'));
      expect(mockHandlers.troops.mock.calls).toMatchInlineSnapshot(`
        Array [
          Array [
            Object {},
            "unload",
            0,
            0,
          ],
        ]
      `);
    });
  });

  describe('scan', () => {
    test('should throw [invalid user]', () => {
      expect(() =>
        reader.read('4455', cli('scan Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid player: \\"4455\\" is not in the game."`,
      );
    });

    test('should call handler.scan', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      mockHooks.system.mockReturnValue({ state: { name: 'Alfa' } });
      reader.read('1234', cli('scan Alfa'));
      expect(mockHandlers.scan.mock.calls).toHaveLength(1);
    });
  });

  describe('scout', () => {
    test('should throw [invalid user]', () => {
      expect(() =>
        reader.read('4455', cli('scout Alfa')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid player: \\"4455\\" is not in the game."`,
      );
    });

    test('should call handler.scout', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      mockHooks.system.mockReturnValue({ state: { name: 'Alfa' } });
      reader.read('1234', cli('scout Alfa -o Bravo'));
      expect(mockHandlers.scout.mock.calls).toHaveLength(1);
    });
  });

  describe('summary', () => {
    test('should throw [invalid user]', () => {
      expect(() =>
        reader.read('4455', cli('summary')),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid player: \\"4455\\" is not in the game."`,
      );
    });

    test('should call handler.summary', () => {
      mockHooks.player.mockReturnValue({ state: { name: 'Joe' } });
      reader.read('1234', cli('summary'));
      expect(mockHandlers.summary.mock.calls).toHaveLength(1);
    });
  });
});
