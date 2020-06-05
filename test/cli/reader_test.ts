import { ArgumentError, OptionReader } from '../../src/cli/reader';

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
