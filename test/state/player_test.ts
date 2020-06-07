import { Player } from '../../src/game/state/player';
import { System, SystemState } from '../../src/game/state/system';

test('should filter systems', () => {
  const player = new Player({
    fogOfWar: {},
    name: 'Vader',
    ratings: {
      naval: 90,
      ground: 90,
    },
    reports: [],
    userId: '12345',
    endedTurn: false,
  });

  const systems = (([
    { name: 'Alfa', owner: '12345' },
    { name: 'Bravo', owner: '67890' },
    { name: 'Charlie', owner: '12345' },
  ] as unknown) as SystemState[]).map((s) => new System(s));

  expect(player.filterSystems(systems).map((s) => s.state)).toEqual([
    { name: 'Alfa', owner: '12345' },
    { name: 'Charlie', owner: '12345' },
  ]);
});
