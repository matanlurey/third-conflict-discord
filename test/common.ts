import { Planet, Player } from '../src/game/sector';
import { Settings } from '../src/game/settings';

export function tenEmptyPlanets(owner: number): Planet[] {
  const planets: Planet[] = Array(10);
  planets.forEach((_, i) => {
    planets[i] = {
      morale: 0,
      owner,
      recruit: 0,
      troops: 0,
    };
  });
  return planets;
}

export function noRngPlayer(name: string, userId?: string): Player {
  return {
    didEndTurn: false,
    name,
    userId,
    combatRatings: {
      ground: 100,
      naval: 100,
    },
    fogOfWar: {},
  };
}

export function simpleSettings(): Settings {
  return {
    displayLevel: 'Show Nothing',
    enableEmpireBuilds: false,
    enableNoviceMode: false,
    enableRandomEvents: false,
    enableSystemDefenses: true,
    gameDifficulty: 'Easy',
    initialFactories: 10,
    maxGameLength: 100,
    shipSpeedATurn: 4,
  };
}

export function noMessaging(): void {
  return;
}
