import { Fleet, InTransitFleet, Planet, Player, System } from './sector';

export interface Totals {
  warShips: number;
  transports: number;
  stealthShips: number;
  defenses: number;
  troops: number;
  missiles: number;
  starSystems: number;
  planets: number;
  factories: number;
}

/**
 * Calculates a player's score based on what they control.
 *
 * Since controlling the entire sector is your goal, score is slanted towards
 * territory.
 *
 * @param total
 */
export function calculateScore(total: Totals): number {
  const oneFifth = 1 / 5;
  const threeFifths = 3 / 5;
  const twoFifths = 2 / 5;
  const oneTwentieth = 1 / 20;
  return Math.floor(
    0 +
      total.warShips * oneFifth +
      total.transports * threeFifths +
      total.stealthShips * threeFifths +
      total.defenses * twoFifths +
      total.troops * oneTwentieth +
      total.missiles * twoFifths +
      total.starSystems * 25 +
      total.planets * 3 +
      total.factories * 1,
  );
}

function addFleetContents(fleet: Fleet, totals: Totals): void {
  totals.warShips += fleet.warShips;
  totals.transports += fleet.transports;
  totals.stealthShips += fleet.stealthShips;
  totals.troops += fleet.troops;
  totals.missiles += fleet.missiles;
}

function addSystemContents(system: System, totals: Totals): void {
  addFleetContents(system.fleet, totals);
  totals.starSystems += 1;
  totals.factories += system.factories;
}

function addPlanetContents(planet: Planet, totals: Totals): void {
  totals.planets += 1;
  totals.troops += planet.troops;
}

/**
 * Given all of the fleets, systems, and players, calculates their totals.
 *
 * @param players
 */
export function calculateTotals(
  players: Player[],
  fleets: InTransitFleet[],
  systems: System[],
): Map<Player, Totals> {
  const results: Totals[] = Array(players.length);
  for (let i = 0; i < results.length; i++) {
    results[i] = {
      warShips: 0,
      transports: 0,
      stealthShips: 0,
      troops: 0,
      missiles: 0,
      factories: 0,
      starSystems: 0,
      planets: 0,
      defenses: 0,
    };
  }
  fleets.forEach((f) => {
    addFleetContents(f.contents, results[f.owner]);
  });
  systems.forEach((s) => {
    addSystemContents(s, results[s.owner]);
    s.planets.forEach((p) => {
      addPlanetContents(p, results[p.owner]);
    });
  });
  return new Map(players.map((p, i) => [p, results[i]]));
}
