import { startingCombatRatings } from '../src/game/combat';
import { SimpleMapGenerator } from '../src/game/map';
import { Settings } from '../src/game/settings';
import { GameState } from '../src/game/state';

const settings: Settings = {
  displayLevel: 'Combat and Events',
  enableEmpireBuilds: true,
  enableNoviceMode: true,
  enableRandomEvents: false,
  enableSystemDefenses: false,
  gameDifficulty: 'Easy',
  initialFactories: 10,
  maxGameLength: 50,
  shipSpeedATurn: 4,
};

GameState.create({
  generator: new SimpleMapGenerator(settings),
  message: (): void => {
    // Not enabled.
  },
  players: [
    {
      combatRatings: startingCombatRatings(),
      didEndTurn: false,
      fogOfWar: {},
      name: 'Player 1',
      userId: '103004235385307136',
    },
  ],
  settings,
})
  .then((game) => {
    game.save(process.argv[2]);
  })
  .then(() => {
    console.info('Game saved as', process.argv[2]);
  });
