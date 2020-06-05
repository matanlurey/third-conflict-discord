import { CombatResult } from '../combat/naval';
import { Mission } from './fleet';

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

export interface CombatReport extends Report {
  readonly kind: 'combat';
  readonly mission: Mission;
  readonly result: CombatResult;
}
