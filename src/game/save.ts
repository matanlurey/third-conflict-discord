import { Settings } from './state/settings';
import { SystemState } from './state/system';

export interface NewlyCreatedGame {
  readonly seed: string;
  readonly settings: Settings;
  readonly systems: SystemState[];
}
