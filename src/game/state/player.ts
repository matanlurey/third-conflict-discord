import { Dispatch, Scout } from './fleet';
import { DetectReport, IntelReport, PrivateerReport, Report } from './report';
import { PlanetState, System, SystemState } from './system';

export class Player {
  constructor(public readonly state: PlayerState) {}

  clearReports(): void {
    this.state.reports.length = 0;
  }

  computeScore(fleets: Dispatch[], systems: System[], scouts: Scout[]): number {
    const total = {
      warShips: 0,
      transports: 0,
      stealthShips: 0,
      defenses: 0,
      troops: 0,
      missiles: 0,
      systems: 0,
      planets: 0,
      factories: 0,
    };
    fleets.forEach((f) => {
      total.warShips += f.state.warShips;
      total.transports += f.state.transports;
      total.stealthShips += f.state.stealthShips;
      total.troops += f.state.troops;
      total.missiles += f.state.missiles;
    });
    scouts.forEach((s) => {
      if (s.state.scout === 'stealthship') {
        total.stealthShips++;
      } else {
        total.warShips++;
      }
    });
    systems.forEach((f) => {
      total.warShips += f.state.warShips;
      total.transports += f.state.transports;
      total.stealthShips += f.state.stealthShips;
      total.troops += f.state.troops;
      total.missiles += f.state.missiles;
      total.defenses += f.state.defenses;
      total.factories += f.state.factories;
      total.systems++;
      f.state.planets.forEach((p) => {
        if (p.owner === this.state.userId) {
          total.planets++;
          total.troops += p.troops;
        }
      });
    });
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
        total.systems * 25 +
        total.planets * 3 +
        total.factories * 1,
    );
  }

  /**
   * Filters a collection of fleets.
   */
  filterFleets(fleets: Dispatch[]): Dispatch[] {
    return fleets.filter((s) => s.state.owner === this.state.userId);
  }

  filterPlanets(planets: PlanetState[]): PlanetState[] {
    return planets.filter((p) => p.owner === this.state.userId);
  }

  /**
   * Filters a collection of scouts.
   */
  filterScouts(scouts: Scout[]): Scout[] {
    return scouts.filter((s) => s.state.owner === this.state.userId);
  }

  /**
   * Filters a collection of systems.
   */
  filterSystems(systems: System[]): System[] {
    return systems.filter((s) => s.state.owner === this.state.userId);
  }

  private report(report: Report): void {
    this.state.reports.push(report);
  }

  get isAI(): boolean {
    // TODO: Add AI field instead.
    return this.state.name.toUpperCase().trim() === 'EMPIRE';
  }

  reportIncoming(fleet: Dispatch, speed: number, fuzz: Chance.Chance): void {
    let size = fleet.totalShips;
    size = fuzz.integer({ min: size * 0.75, max: size * 1.25 });
    const report: DetectReport = {
      kind: 'detect',
      eta: fleet.eta(speed),
      missiles: fleet.isMissilesOnly,
      size: size,
      system: fleet.state.target,
    };
    this.report(report);
  }

  reportPrivateers(system: System, warships: number): void {
    const report: PrivateerReport = {
      kind: 'privateer',
      system: system.state.name,
      warships,
    };
    this.report(report);
  }

  reportUnrest(
    system: System,
    options?: {
      planet?: number;
      overthrown?: { who: string; reverted: string };
    },
  ): void {
    this.report({
      kind: 'unrest',
      system: system.state.name,
      planet: options?.planet,
      overthrown: options?.overthrown,
    });
  }

  reportScouted(system: System): void {
    const report: IntelReport = {
      kind: 'intel',
      system: system.state.name,
      scout: true,
    };
    this.report(report);
  }

  reportScoutedBy(system: System, player: Player): void {
    const report: IntelReport = {
      kind: 'intel',
      system: system.state.name,
      name: player.state.name,
      scout: true,
    };
    this.report(report);
  }

  reportEvent(text: string): void {
    this.report({ kind: 'event', text });
  }

  wonCombat(arena: 'ground' | 'naval'): void {
    const previous = this.state.ratings[arena];
    this.state.ratings[arena] = Math.max(25, Math.min(90, previous + 1));
  }

  lostCombat(arena: 'ground' | 'naval'): void {
    const previous = this.state.ratings[arena];
    this.state.ratings[arena] = Math.max(25, Math.min(90, previous - 1));
  }
}

export interface HiddenSystemState {
  /**
   * System that is potentially revealed.
   */
  readonly system: Partial<SystemState>;

  /**
   * Turn the system was last gathered intel on.
   *
   * If undefined, this system is unknown.
   */
  readonly updated?: number;
}

export interface PlayerState {
  /**
   * Unique ID of the player.
   */
  readonly userId: string;

  /**
   * Screen name of the player.
   */
  readonly name: string;

  /**
   * Chance of attack hitting in a fleet (nava) or planetary (ground) combat.
   */
  readonly ratings: Ratings;

  /**
   * Latest intelligence report of what a system looks like.
   */
  readonly fogOfWar: { [key: string]: HiddenSystemState | undefined };

  /**
   * Intelligence reports.
   */
  readonly reports: Report[];

  /**
   * Whether the turn is over.
   */
  endedTurn: boolean;
}

/**
 * Chance of attack hitting in a fleet (nava) or planetary (ground) combat.
 */
export interface Ratings {
  /**
   * 25 - 90 (percent).
   */
  naval: number;

  /**
   * 25 - 90 (percent).
   */
  ground: number;
}
