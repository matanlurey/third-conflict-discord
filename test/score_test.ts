import { calculateScore, calculateTotals } from '../src/game/score';
import { Coordinate, createFleet, Player } from '../src/game/sector';

test('should calculate scores from totals', () => {
  expect(
    calculateScore({
      warShips: 5, // 1
      transports: 5, // 3
      stealthShips: 5, // 3
      defenseUnits: 5, // 2
      troops: 20, // 1
      missiles: 5, // 2
      starSystems: 1, // 25
      planets: 1, // 3
      factories: 1, // 1
    }),
  ).toEqual(1 + 3 + 3 + 2 + 1 + 2 + 25 + 3 + 1);
});

test('should calculate totals from fleets', () => {
  const players: Player[] = [
    { name: 'Player 1', userId: '1234', didEndTurn: false },
    { name: 'Player 2', userId: '5678', didEndTurn: false },
  ];
  const totals = calculateTotals(
    players,
    [
      {
        owner: 0,
        contents: createFleet({
          warShips: 10,
          stealthShips: 5,
          transports: 3,
          missiles: 2,
          troops: 10,
        }),
        origin: 'Beta',
        destination: 'Alpha',
        distance: 0,
      },
      {
        owner: 0,
        contents: createFleet({
          warShips: 4,
          stealthShips: 5,
          transports: 5,
          missiles: 1,
          troops: 5,
        }),
        origin: 'Beta',
        destination: 'Alpha',
        distance: 0,
      },
    ],
    [],
  );
  expect(totals.get(players[0])).toEqual({
    warShips: 14,
    stealthShips: 10,
    transports: 8,
    missiles: 3,
    troops: 15,
    defenseUnits: 0,
    factories: 0,
    planets: 0,
    starSystems: 0,
  });
});

test('should calculate totals from systems', () => {
  const point: Coordinate = [0, 0];
  const players: Player[] = [
    { name: 'Player 1', userId: '1234', didEndTurn: false },
    { name: 'Player 2', userId: '5678', didEndTurn: false },
  ];
  const totals = calculateTotals(
    players,
    [],
    [
      {
        buildPoints: 0,
        factories: 5,
        home: true,
        name: 'Alpha',
        orbiting: {
          buildPoints: 0,
          missiles: 3,
          stealthShips: 2,
          transports: 1,
          troops: 10,
          warShips: 4,
        },
        owner: 0,
        planets: [{ morale: 0, owner: 0, troops: 10, recruit: 5 }],
        position: point,
        defenses: 5,
      },
    ],
  );
  expect(totals.get(players[0])).toEqual({
    defenseUnits: 0,
    factories: 5,
    missiles: 3,
    planets: 1,
    starSystems: 1,
    stealthShips: 2,
    transports: 1,
    troops: 20,
    warShips: 4,
  });
});
