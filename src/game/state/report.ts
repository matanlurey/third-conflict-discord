import { CombatResult } from '../combat/naval';
import { Mission } from './fleet';
import { SystemState } from './system';

/**
 * A report of what occurred before this turn started.
 */
export type Report =
  | IntelReport
  | CombatReport
  | DetectReport
  | UnrestReport
  | PrivateerReport
  | EmpireReinforced;

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

export interface UnrestReport {
  readonly kind: 'unrest';
  readonly system: string;
  readonly planet?: number;
  readonly overthrown?: {
    who: string;
    reverted: string;
  };
}

export interface PrivateerReport {
  readonly kind: 'privateer';
  readonly warships: number;
  readonly system: string;
}

export interface EmpireReinforced {
  readonly kind: 'reinforced';
  readonly system: Partial<SystemState>;
}
