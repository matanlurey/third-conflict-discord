import { Game } from '../../src/game/state/game';
import { defaultSettings } from '../../src/game/state/settings';

let game: Game;

beforeAll(() => {
  game = new Game({
    seed: '1234',
    fleets: [],
    players: [
      {
        fogOfWar: {},
        name: 'Vader',
        ratings: {
          naval: 90,
          ground: 90,
        },
        reports: [],
        userId: '12345',
      },
    ],
    scouts: [],
    settings: defaultSettings,
    systems: [
      {
        buildPoints: 0,
        defenses: 0,
        factories: 0,
        missiles: 0,
        name: 'Alfa',
        owner: '12345',
        home: false,
        planets: [],
        position: [0, 1],
        production: 'nothing',
        stealthShips: 0,
        transports: 0,
        troops: 0,
        warShips: 0,
      },
    ],
    turn: 1,
  });
});

describe('findSystem', () => {
  test('should find by full name', () => {
    const system = game.findSystem('Alfa');
    expect(system?.state.name).toBe('Alfa');
  });

  test('should find by initial', () => {
    const system = game.findSystem('A');
    expect(system?.state.name).toBe('Alfa');
  });
});

describe('findPlay', () => {
  test('should find by ID', () => {
    const player = game.findPlayer('12345');
    expect(player?.state.name).toBe('Vader');
  });
});
