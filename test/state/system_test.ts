import { System } from '../../src/game/state/system';

describe('produce', () => {
  let system: System;

  const noPlanetBuildSupport = {
    buildPlanet: (): never => {
      throw 'No support for building planets.';
    },
  };

  beforeEach(() => {
    system = new System({
      buildPoints: 0,
      defenses: 0,
      factories: 10,
      missiles: 0,
      name: 'Alfa',
      owner: '12345',
      planets: Array(10),
      position: [0, 0],
      production: 'nothing',
      stealthShips: 0,
      transports: 0,
      troops: 0,
      warShips: 0,
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
    expect(system.state.defenses).toEqual(0);

    system.change('defenses');
    system.produce(noPlanetBuildSupport);
    expect(system.state.defenses).toEqual(10);
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
