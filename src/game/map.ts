import { Chance } from 'chance';
import { Coordinate, createFleet, Planet, Player, System } from './sector';
import { Settings } from './settings';

export function debugMap(systems: System[]): string {
  // Determine dimensions.
  let width = 0;
  let height = 0;
  systems.forEach((value) => {
    const origin = value.position;
    const x = origin[0];
    const y = origin[1];
    if (x > width) {
      width = x + 1;
    }
    if (y > height) {
      height = y + 1;
    }
  });

  // Create initial multi-dimensional array.
  // First, create the height of the array.
  const output: string[][] = Array(height);
  for (let i = 0; i < height; i++) {
    // Fill with an initial width.
    output[i] = Array(width);
    output[i].fill('• ');
  }

  // Replace names of the blank coordinates with the system letter.
  systems.forEach((value) => {
    const origin = value.position;
    const x = origin[0];
    const y = origin[1];
    const letter = `${value.name.substring(0, 1)} `;
    output[y][x] = letter;
  });

  // Return as a flat string.
  return '\n' + output.map((o) => o.join('')).join('\n') + '\n';
}

export class SimpleMapGenerator {
  private static readonly names = [
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
  ];

  private static readonly template = [
    [1, 0, 0, 2, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 2, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 2, 0, 0, 1],
  ];

  constructor(
    private readonly settings: Settings,
    private readonly chance = new Chance(),
  ) {
    if (!this.settings.enableNoviceMode) {
      throw new Error(`Only "enableNoviceMode: true" is supported.`);
    }
  }

  generate(players: Player[]): System[] {
    if (players.length < 1) {
      throw new RangeError('At least one player required.');
    }
    if (players.length > 4) {
      throw new RangeError('Maximum 4 players supported.');
    }
    const template = SimpleMapGenerator.template;
    const startPlayers: Coordinate[] = [];
    const startEmpire: Coordinate[] = [];
    template.forEach((row, y) => {
      row.forEach((value, x) => {
        const point: Coordinate = [x, y];
        switch (value) {
          case 1:
            startPlayers.push(point);
            break;
          case 2:
            startEmpire.push(point);
            break;
        }
      });
    });
    const count = startPlayers.length + startEmpire.length;
    const names = SimpleMapGenerator.names.slice(0, count);
    const systems: System[] = [];
    this.chance.pick(startPlayers, players.length).forEach((origin, index) => {
      systems.push(this.fillPlayerStart(names[index], origin, index + 1));
    });
    // TODO: Include non-included players as Empire planets?
    this.chance.shuffle(startEmpire).forEach((origin, index) => {
      systems.push(this.fillEmpireStart(names[index + players.length], origin));
    });
    return systems;
  }

  private generatePlanet(owner?: number): Planet {
    // TODO: Make initial generation more fair by giving players a chance to
    // have a slight advantage in some area (i.e. better planets, more troops,
    // more ships) without possibly having all of those or none of those.
    const recruit = this.chance.weighted(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 6, 3, 2, 1, 1, 1, 1],
    );
    const troops = this.chance.integer({
      min: 20,
      max: 80,
    });
    return {
      morale: 1,
      owner: owner || 0,
      recruit,
      troops,
    };
  }

  private fillPlayerStart(
    name: string,
    origin: Coordinate,
    owner: number,
  ): System {
    const planets: Planet[] = [];
    for (let i = 0; i < 10; i++) {
      planets.push(this.generatePlanet(owner));
    }
    const transports = this.chance.integer({ min: 16, max: 26 });
    return {
      buildPoints: 0,
      factories: this.settings.initialFactories,
      home: true,
      owner,
      name,
      orbiting: createFleet({
        warShips: this.chance.integer({ min: 180, max: 220 }),
        transports,
        troops: transports * 50,
      }),
      planets: planets,
      position: origin,
      defenses: 0,
    };
  }

  private fillEmpireStart(name: string, origin: Coordinate): System {
    const planets: Planet[] = [];
    const amount = this.chance.integer({ min: 2, max: 5 });
    for (let i = 0; i < amount; i++) {
      planets.push(this.generatePlanet());
    }
    return {
      buildPoints: 0,
      factories: this.chance.integer({ min: 2, max: 4 }),
      home: false,
      name,
      orbiting: createFleet({
        warShips: this.chance.integer({ min: 10, max: 40 }),
      }),
      owner: 0,
      planets,
      position: origin,
      defenses: 0,
    };
  }
}
