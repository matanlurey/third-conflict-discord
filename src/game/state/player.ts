import { Report } from './report';
import { System } from './system';

export class Player {
  constructor(private readonly state: PlayerState) {}

  /**
   * Whether this player is a human player.
   */
  get isHuman(): boolean {
    return !!this.state.userId;
  }

  /**
   * Filters a collection of systems.
   */
  systems(systems: System[]): System[] {
    return systems.filter((s) => s.owner.userId === this.state.userId);
  }
}

export interface HiddenSystem {
  /**
   * System that is potentially revealed.
   */
  readonly system: Partial<System>;

  /**
   * Turn the system was last gathered intel on.
   */
  readonly updated: number;
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
  readonly fogOfWar: { [key: string]: HiddenSystem | undefined };

  /**
   * Intelligence reports.
   */
  readonly reports: Report[];
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
