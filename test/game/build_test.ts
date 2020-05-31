import { Coordinate, createFleet, System } from '../../src/game/sector';
import { GameState } from '../../src/game/state';
import { noMessaging, simpleSettings, tenEmptyPlanets } from '../common';

let state: GameState;
let system: System;

beforeEach(() => {
  state = new GameState(
    {
      fleets: [],
      scouts: [],
      players: [
        {
          didEndTurn: false,
          name: 'Empire',
          combatRatings: {
            ground: 50,
            naval: 50,
          },
          fogOfWar: {},
        },
        {
          didEndTurn: false,
          name: 'Player',
          combatRatings: {
            ground: 50,
            naval: 50,
          },
          fogOfWar: {},
        },
      ],
      systems: [
        (system = {
          buildPoints: 0,
          defenses: 0,
          factories: 10,
          home: false,
          name: 'Alpha',
          fleet: createFleet({}),
          owner: 1,
          planets: tenEmptyPlanets(1),
          position: [0, 0] as Coordinate,
        }),
        {
          buildPoints: 0,
          defenses: 0,
          factories: 10,
          home: false,
          name: 'Beta',
          fleet: createFleet({}),
          owner: 0,
          planets: tenEmptyPlanets(0),
          position: [0, 0] as Coordinate,
        },
      ],
      settings: simpleSettings(),
      turn: 1,
    },
    noMessaging,
  );
});

test('should build WarShips', () => {
  expect(system.fleet.warShips).toEqual(0);
  system.building = 'WarShips';
  state.nextTurn();
  expect(system.fleet.warShips).toEqual(10);
});

test('should build StealthShips', () => {
  expect(system.fleet.stealthShips).toEqual(0);
  expect(system.buildPoints).toEqual(0);
  system.building = 'StealthShips';
  state.nextTurn();
  expect(system.fleet.stealthShips).toEqual(3);
  expect(system.buildPoints).toEqual(1);
});

test('should build Transports', () => {
  expect(system.fleet.transports).toEqual(0);
  expect(system.buildPoints).toEqual(0);
  system.building = 'Transports';
  state.nextTurn();
  expect(system.fleet.transports).toEqual(3);
  expect(system.buildPoints).toEqual(1);
});

test('should build Missiles', () => {
  expect(system.fleet.missiles).toEqual(0);
  system.building = 'Missiles';
  state.nextTurn();
  expect(system.fleet.missiles).toEqual(5);
});

test('should build Defenses', () => {
  expect(system.defenses).toEqual(0);
  system.building = 'Defenses';
  state.nextTurn();
  expect(system.defenses).toEqual(10);
});

test('should reserve Points', () => {
  expect(system.buildPoints).toEqual(0);
  system.building = undefined;
  state.nextTurn();
  expect(system.buildPoints).toEqual(10);
  system.building = 'WarShips';
  state.nextTurn();
  expect(system.buildPoints).toEqual(0);
  expect(system.fleet.warShips).toEqual(20);
});

describe('should build Planets', () => {
  test('except when there is already 10', () => {
    while (system.buildPoints < 100) {
      system.building = 'Planets';
      state.nextTurn();
    }
    expect(system.planets).toHaveLength(10);
    expect(system.buildPoints).toEqual(100);
  });

  test('', () => {
    system.planets.splice(0, 1);
    system.buildPoints = 80;
    state.nextTurn();
    expect(system.planets).toHaveLength(9);
    expect(system.buildPoints).toEqual(90);
    // TODO: Finish implementing building planets.
  });
});

describe('should build Factories', () => {
  test('except when you have 50', () => {
    system.factories = 50;
    while (system.buildPoints < 300) {
      system.building = 'Factories';
      state.nextTurn();
    }
    expect(system.buildPoints).toEqual(300);
    expect(system.factories).toEqual(50);
  });

  test('0 -> 1', () => {
    system.factories = 0;
    system.buildPoints = 1;
    system.building = 'Factories';
    state.nextTurn();
    expect(system.buildPoints).toEqual(1);
    expect(system.factories).toEqual(0);
    system.buildPoints = 3;
    state.nextTurn();
    expect(system.buildPoints).toEqual(0);
    expect(system.factories).toEqual(1);
  });

  test('10 -> 11', () => {
    system.building = 'Factories';
    state.nextTurn();
    expect(system.buildPoints).toEqual(10);
    expect(system.factories).toEqual(10);
    state.nextTurn();
    expect(system.buildPoints).toEqual(20);
    expect(system.factories).toEqual(10);
    state.nextTurn();
    expect(system.buildPoints).toEqual(0);
    expect(system.factories).toEqual(11);
  });
});
