import { calculateScore } from '../src/game/score';
import { Player } from '../src/game/sector';

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
    { index: 0, name: 'Player 1', userId: '1234' },
    { index: 1, name: 'Player 2', userId: '5678' },
  ];
  expect;
});
