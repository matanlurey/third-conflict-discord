import { Settings } from '../state/settings';
import { System } from '../state/system';
import { Generator } from './generator';
import { PoissonDiskSampler } from './poisson-disk';

export class RandomMap extends Generator {
  private readonly sampler: PoissonDiskSampler;

  constructor(
    sampler: PoissonDiskSampler | [number, number],
    chance?: Chance.Chance,
    names?: string[],
  ) {
    super(chance, names);
    this.sampler = Array.isArray(sampler)
      ? new PoissonDiskSampler(sampler, 4, undefined, chance)
      : sampler;
  }

  generateMap(settings: Settings, players: string[], systems = 26): System[] {
    const points = this.sampler.points(systems);
    const names = this.chance.shuffle(this.fetchNames(systems));
    const result = this.chance.shuffle(
      points.map((point, i) => {
        let [x, y] = point;
        x = Math.max(Math.ceil(x - 1), 0);
        y = Math.max(Math.ceil(y - 1), 0);
        return this.createEmpire(
          {
            buildPoints: 0,
            defenses: 0,
            factories: 0,
            missiles: 0,
            position: [x, y],
            planets: [],
            production: 'warships',
            home: false,
            name: names[i],
            owner: '',
            stealthShips: 0,
            transports: 0,
            troops: 0,
            warShips: 0,
          },
          this.chance,
          settings,
        );
      }),
    );
    players.forEach((name) => {
      const i = this.pickFarthestSystem(result);
      result[i] = this.createPlayer(name, result[i], this.chance, settings);
    });
    return this.collatePositions(result).map((s) => new System(s));
  }
}
