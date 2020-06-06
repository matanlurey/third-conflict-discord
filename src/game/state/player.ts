import { Dispatch, Scout } from './fleet';
import { DetectReport, IntelReport, Report } from './report';
import { System, SystemState } from './system';

export class Player {
  constructor(public readonly state: PlayerState) {}

  clearReports(): void {
    this.state.reports.length = 0;
  }

  /**
   * Filters a collection of fleets.
   */
  filterFleets(fleets: Dispatch[]): Dispatch[] {
    return fleets.filter((s) => s.state.owner === this.state.userId);
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
    console.log(`>>> ${this.state.name}`, report);
    this.state.reports.push(report);
  }

  reportIncoming(fleet: Dispatch, speed: number): void {
    const report: DetectReport = {
      kind: 'detect',
      eta: fleet.eta(speed),
      missiles: fleet.isMissilesOnly,
      size: fleet.totalShips,
      system: fleet.state.target,
    };
    this.report(report);
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
