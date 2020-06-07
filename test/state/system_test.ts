import { GameStateError } from '../../src/cli/reader';
import { Fleet } from '../../src/game/state/fleet';
import { PlanetState, System } from '../../src/game/state/system';

describe('produce', () => {
  let system: System;

  const noPlanetBuildSupport = {
    buildPlanet: (): never => {
      throw 'No support for building planets.';
    },
  };

  beforeEach(() => {
    system = System.create({
      factories: 10,
      home: false,
      name: 'Alfa',
      owner: '12345',
      position: [0, 0],
    });
  });

  test('should build WarShips', () => {
    expect(system.state.warShips).toEqual(0);

    system.change('warships');
    system.produce(noPlanetBuildSupport);
    expect(system.state.warShips).toEqual(10);
  });

  test('should build StealthShips', () => {
    expect(system.state.stealthShips).toEqual(0);
    expect(system.state.buildPoints).toEqual(0);

    system.change('stealthships');
    system.produce(noPlanetBuildSupport);
    expect(system.state.stealthShips).toEqual(3);
    expect(system.state.buildPoints).toEqual(1);
  });

  test('should build Transports', () => {
    expect(system.state.transports).toEqual(0);
    expect(system.state.buildPoints).toEqual(0);

    system.change('transports');
    system.produce(noPlanetBuildSupport);
    expect(system.state.transports).toEqual(3);
    expect(system.state.buildPoints).toEqual(1);
  });

  test('should build Missiles', () => {
    expect(system.state.missiles).toEqual(0);

    system.change('missiles');
    system.produce(noPlanetBuildSupport);
    expect(system.state.missiles).toEqual(5);
  });

  test('should build Defenses', () => {
    system.state.planets.push({
      owner: system.state.owner,
      morale: 0,
    } as PlanetState);
    expect(system.state.defenses).toEqual(0);

    system.change('defenses');
    system.produce(noPlanetBuildSupport);
    expect(system.state.defenses).toEqual(10);

    system.state.defenses = 45;
    system.produce(noPlanetBuildSupport);
    expect(system.state.defenses).toEqual(50);
    expect(system.state.buildPoints).toEqual(5);
  });

  test('should reserve Points', () => {
    expect(system.state.buildPoints).toEqual(0);

    system.change('nothing');
    system.produce(noPlanetBuildSupport);
    expect(system.state.buildPoints).toEqual(10);

    system.change('warships');
    system.produce(noPlanetBuildSupport);
    expect(system.state.buildPoints).toEqual(0);
    expect(system.state.warShips).toEqual(20);
  });

  describe('should build Planets', () => {
    test('except when there is already 10', () => {
      system.state.planets.push(...Array(10).fill({ morale: 0 }));
      system.change('planets');
      while (system.state.buildPoints < 100) {
        system.produce(noPlanetBuildSupport);
      }
      expect(system.state.planets).toHaveLength(10);
      expect(system.state.buildPoints).toEqual(100);
    });
  });

  describe('should build Factories', () => {
    test('except when you have 50', () => {
      system.state.factories = 50;
      system.change('factories');
      while (system.state.buildPoints < 300) {
        system.produce(noPlanetBuildSupport);
      }
      expect(system.state.buildPoints).toEqual(300);
      expect(system.state.factories).toEqual(50);
    });

    test('0 -> 1', () => {
      system.state.factories = 0;
      system.state.buildPoints = 1;

      system.change('factories');
      system.produce(noPlanetBuildSupport);
      expect(system.state.buildPoints).toEqual(1);
      expect(system.state.factories).toEqual(0);

      system.state.buildPoints = 3;
      system.produce(noPlanetBuildSupport);
      expect(system.state.buildPoints).toEqual(0);
      expect(system.state.factories).toEqual(1);
    });

    test('10 -> 11', () => {
      system.change('factories');
      system.produce(noPlanetBuildSupport);
      expect(system.state.buildPoints).toEqual(10);
      expect(system.state.factories).toEqual(10);

      system.produce(noPlanetBuildSupport);
      expect(system.state.buildPoints).toEqual(20);
      expect(system.state.factories).toEqual(10);

      system.produce(noPlanetBuildSupport);
      expect(system.state.buildPoints).toEqual(0);
      expect(system.state.factories).toEqual(11);
    });
  });
});

describe('morale', () => {
  test('should be the average of planets, adjusting for enemy', () => {
    const system = System.create({
      name: 'Hoth',
      owner: '1',
      position: [0, 0],
      planets: [
        {
          morale: 1,
          owner: '1',
          recruit: 0,
          troops: 0,
        },
        {
          morale: 2,
          owner: '1',
          recruit: 0,
          troops: 0,
        },
        {
          morale: 3,
          owner: '1',
          recruit: 0,
          troops: 0,
        },
        {
          morale: 4,
          owner: '0',
          recruit: 0,
          troops: 0,
        },
      ],
    });
    expect(system.morale).toBe(1);
  });
});

describe('', () => {
  let alfa: System;
  let bravo: System;
  let charlie: System;

  beforeEach(() => {
    alfa = System.create({
      factories: 10,
      home: false,
      name: 'Alfa',
      owner: '12345',
      position: [0, 0],
    });
    bravo = System.create({
      factories: 10,
      home: false,
      name: 'Alfa',
      owner: '67890',
      position: [0, 0],
    });
    charlie = System.create({
      factories: 10,
      home: false,
      name: 'Alfa',
      owner: '12345',
      position: [0, 0],
    });
  });

  test('should prevent attacking with 0 units', () => {
    expect(() => alfa.attack(bravo, Fleet.create({}), 'conquest')).toThrowError(
      GameStateError,
    );
  });

  test('should prevent moving with 0 units', () => {
    expect(() => alfa.moveTo(charlie, Fleet.create({}))).toThrowError(
      GameStateError,
    );
  });
});
