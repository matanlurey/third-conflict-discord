import { Dispatch, Fleet, Scout } from '../../src/game/state/fleet';

describe('Scout', () => {
  test('should move at 1.5 times speed', () => {
    const scout = new Scout({
      owner: 'Vader',
      source: 'A',
      target: 'B',
      distance: 6,
      scout: 'warship',
    });

    expect(scout.hasReachedTarget).toBe(false);
    expect(scout.eta(4)).toBe(1);

    expect(scout.move(4));
    expect(scout.hasReachedTarget).toBe(true);
  });
});

describe('Fleet', () => {
  test('should add units', () => {
    const fleet = new Fleet({
      buildPoints: 0,
      missiles: 0,
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
    });

    fleet.add({
      warShips: 30,
      stealthShips: 15,
    });

    expect(fleet.state).toEqual({
      buildPoints: 0,
      missiles: 0,
      stealthShips: 15,
      transports: 0,
      troops: 0,
      warShips: 30,
    });
  });

  test('should fork units', () => {
    const fleet = new Fleet({
      buildPoints: 0,
      missiles: 0,
      stealthShips: 15,
      transports: 0,
      troops: 0,
      warShips: 30,
    });

    const fork = fleet.fork({
      warShips: 10,
      stealthShips: 5,
    });

    expect(fleet.state).toEqual({
      buildPoints: 0,
      missiles: 0,
      stealthShips: 10,
      transports: 0,
      troops: 0,
      warShips: 20,
    });

    expect(fork).toEqual({
      buildPoints: 0,
      missiles: 0,
      stealthShips: 5,
      transports: 0,
      troops: 0,
      warShips: 10,
    });
  });
});

describe('Dispatch', () => {
  test('should move at normal speed', () => {
    const fleet = new Dispatch({
      owner: 'Vader',
      source: 'A',
      target: 'B',
      distance: 8,
      mission: 'conquest',
      buildPoints: 0,
      missiles: 0,
      stealthShips: 10,
      transports: 0,
      troops: 0,
      warShips: 20,
    });

    expect(fleet.hasReachedTarget).toBe(false);
    expect(fleet.eta(4)).toBe(2);

    expect(fleet.move(4));
    expect(fleet.hasReachedTarget).toBe(false);
    expect(fleet.eta(4)).toBe(1);

    expect(fleet.move(4));
    expect(fleet.hasReachedTarget).toBe(true);
  });

  test('should move at double speed (missiles)', () => {
    const fleet = new Dispatch({
      owner: 'Vader',
      source: 'A',
      target: 'B',
      distance: 8,
      mission: 'conquest',
      buildPoints: 0,
      missiles: 10,
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
    });

    expect(fleet.hasReachedTarget).toBe(false);
    expect(fleet.eta(4)).toBe(1);

    expect(fleet.move(4));
    expect(fleet.hasReachedTarget).toBe(true);
  });
});
