import { CombatResult } from '../combat/naval';
import { Mission } from './fleet';

/**
 * A report of what occurred before this turn started.
 */
export type Report = IntelReport | CombatReport | DetectReport;

/**
 * A report that intel was gathered at a system.
 */
export interface IntelReport {
  readonly kind: 'intel';
  readonly name?: string;
  readonly scout: boolean;
  readonly system: string;
}

export interface CombatReport {
  readonly attacker: boolean;
  readonly kind: 'combat';
  readonly mission: Mission;
  readonly result: CombatResult;
  readonly system: string;
}

export interface DetectReport {
  readonly kind: 'detect';
  readonly size: number;
  readonly missiles: boolean;
  readonly eta: number;
  readonly system: string;
}
