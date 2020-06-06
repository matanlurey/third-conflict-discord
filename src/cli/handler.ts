import { Fleet } from '../game/state/fleet';
import { Player } from '../game/state/player';
import { Production, System } from '../game/state/system';
/**
 * How to handle valid requests.
 */
export interface CliHandler {
  /**
   * Issues an attack command.
   *
   * @param source
   * @param target
   * @param fleet
   */
  attack(source: System, target: System, fleet: Fleet): void;

  /**
   * Issues a build command.
   *
   * @param source
   * @param unit
   */
  build(source: System, unit: Production): void;

  /**
   * Issues an end-turn command.
   *
   * @param user
   */
  end(user: Player): void;

  /**
   * Issues an invade command.
   *
   * @param target
   * @param command
   * @param planet
   * @param troops
   */
  troops(
    target: System,
    command: 'load' | 'unload',
    planet: number,
    troops: number,
  ): void;

  /**
   * Issues an move command.
   *
   * @param source
   * @param target
   * @param fleet
   */
  move(source: System, target: System, fleet: Fleet): void;

  /**
   * Issues a scan command.
   *
   * @param user
   * @param target
   */
  scan(user: Player, target: System): void;

  /**
   * Issues a scout command.
   *
   * @param target
   * @param source
   */
  scout(target: System, source: System): void;

  /**
   * Issues a summary request command.
   *
   * @param user
   */
  summary(user: Player): void;
}
