import { Point } from '../../src/game/state/point';

test('should compute distance (horizontal)', () => {
  const a = new Point([0, 0]);
  const b = new Point([4, 0]);
  expect(a.distance(b)).toEqual(4);
});

test('should compute distance (vertical)', () => {
  const a = new Point([0, 0]);
  const b = new Point([0, 4]);
  expect(a.distance(b)).toEqual(4);
});

test('should compute distance (diagonal)', () => {
  const a = new Point([0, 0]);
  const b = new Point([4, 4]);
  expect(a.distance(b)).toEqual(5.66);
});
