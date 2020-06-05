import { Chance } from 'chance';
import { Point } from '../state/point';
import { Settings } from '../state/settings';
import { PlanetState, System, SystemState } from '../state/system';

export abstract class Generator {
  constructor(
    protected readonly chance = new Chance(),
    private readonly names = [
      'Alfa',
      'Bravo',
      'Charlie',
      'Delta',
      'Echo',
      'Foxtrot',
      'Golf',
      'Hotel',
      'India',
      'Juliett',
      'Kilo',
      'Lima',
      'Mike',
      'November',
      'Oscar',
      'Papa',
      'Quebec',
      'Romeo',
      'Sierra',
      'Tango',
      'Uniform',
      'Victor',
      'Whiskey',
      'Xray',
      'Yankee',
      'Zulu',
    ],
  ) {}

  abstract generateMap(settings: Settings, players: string[]): System[];

  protected fetchNames(amount: number): string[] {
    return this.names.slice(0, amount);
  }

  protected createEmpire(
    state: SystemState,
    chance: Chance.Chance,
    settings: Settings,
  ): SystemState {
    let ratio = 1;
    switch (settings.gameDifficulty) {
      case 'hard':
        ratio = 2;
        break;
      case 'tough':
        ratio = 3;
        break;
    }
    let defenses = 0;
    if (!settings.enableNoviceMode && settings.enableSystemDefenses) {
      defenses = this.chance.integer({ min: 5, max: 15 }) * ratio;
    }
    const warShips = this.chance.integer({ min: 10, max: 30 }) * ratio;
    let stealthShips = 0;
    if (!settings.enableNoviceMode) {
      stealthShips = this.chance.integer({ min: 5, max: 15 }) * ratio;
    }
    const planets: PlanetState[] = new Array(
      this.chance.integer({ min: 2, max: 5 }),
    );
    for (let i = 0; i < planets.length; i++) {
      planets[i] = this.createPlanet(chance, 'Empire');
    }
    const factories = this.chance.integer({
      min: Math.floor(settings.initialFactories / 4),
      max: Math.floor(settings.initialFactories / 2),
    });
    return {
      ...state,
      defenses,
      factories,
      planets,
      owner: 'Empire',
      warShips,
      stealthShips,
    };
  }

  protected createPlayer(
    owner: string,
    state: SystemState,
    chance: Chance.Chance,
    settings: Settings,
  ): SystemState {
    let defenses = 0;
    if (!settings.enableNoviceMode && settings.enableSystemDefenses) {
      defenses = this.chance.integer({ min: 10, max: 30 });
    }
    const warShips = this.chance.integer({ min: 160, max: 240 });
    let stealthShips = 0;
    if (!settings.enableNoviceMode) {
      stealthShips = this.chance.integer({ min: 15, max: 35 });
    }
    let missiles = 0;
    if (!settings.enableNoviceMode) {
      missiles = this.chance.integer({ min: 10, max: 25 });
    }
    const planets: PlanetState[] = new Array(10);
    for (let i = 0; i < planets.length; i++) {
      planets[i] = this.createPlanet(chance, owner);
    }
    const factories = settings.initialFactories;
    return {
      ...state,
      home: true,
      defenses,
      factories,
      planets,
      owner,
      warShips,
      missiles,
      stealthShips,
    };
  }

  protected createPlanet(chance: Chance.Chance, owner: string): PlanetState {
    // TODO: Make initial generation more fair by giving players a chance to
    // have a slight advantage in some area (i.e. better planets, more troops,
    // more ships) without possibly having all of those or none of those.
    const recruit = chance.weighted(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 6, 3, 2, 1, 1, 1, 1],
    );
    const troops = chance.integer({
      min: 20,
      max: 80,
    });
    return {
      morale: 1,
      owner: owner,
      recruit,
      troops,
    };
  }

  protected collatePositions(systems: SystemState[]): SystemState[] {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    for (const system of systems) {
      const [x, y] = system.position;
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
    }
    return systems.map((system) => {
      let [x, y] = system.position;
      x -= minX;
      y -= minY;
      return {
        ...system,
        position: [x, y],
      };
    });
  }

  protected pickFarthestSystem(systems: SystemState[]): number {
    let result;
    let lowsum = Number.MAX_SAFE_INTEGER;
    let maximum = 0;
    for (const a of systems) {
      for (const b of systems) {
        const d = new Point(a.position).distance(new Point(b.position));
        if (d > maximum) {
          maximum = d;
        }
      }
    }
    for (let i = 0; i < systems.length; i++) {
      const a = systems[i];
      if (a.home) {
        continue;
      }
      const distances: number[] = [];
      for (const b of systems) {
        const distance = new Point(a.position).distance(new Point(b.position));
        let weight = maximum - distance;
        if (b.home) {
          weight = Math.pow(2, weight);
        }
        distances.push(weight);
      }
      const sumDistance = distances.reduce((p, c) => p + c, 0);
      if (sumDistance < lowsum) {
        lowsum = sumDistance;
        result = i;
      }
    }
    if (!result) {
      const open = systems.filter((s) => !s.home);
      const name = this.chance.pickone(open).name;
      for (let i = 0; i < systems.length; i++) {
        if (systems[i].name === name) {
          return i;
        }
      }
      throw new Error('Failed to find a home system.');
    }
    return result;
  }
}
