import { Totals } from '../score';

/**
 * A report of what occurred before this turn started.
 */
export interface Report {
  /**
   * Kind of report.
   */
  readonly kind: string;

  /**
   * System the report occurred at.
   */
  readonly system: string;
}

/**
 * A report that intel was gathered at a system.
 */
export interface IntelReport extends Report {
  readonly kind: 'intel';
}

/**
 * A report that combat occurred at a system.
 */
export interface CombatReport extends Report {
  readonly kind: 'combat';
  readonly mission: 'conquest';
  readonly losses: {
    readonly attacker: Partial<Totals>;
    readonly defender: Partial<Totals>;
  };
}
