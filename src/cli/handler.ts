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
   * Explains comand usage.
   *
   * @param user
   * @param command
   */
  usage(command: string | undefined): void;

  /**
   * Issues an move command.
   *
   * @param source
   * @param target
   * @param fleet
   */
  move(source: System, target: System, fleet: Fleet): void;

  /**
   * Issues a recall command.
   *
   * @param user
   * @param index
   * @param isScout
   */
  recall(user: Player, index: number, isScout: boolean): void;

  /**
   * Issues a scan command.
   *
   * @param user
   * @param target
   * @param showPlanets
   */
  scan(user: Player, target: System, showPlanets: boolean): void;

  /**
   * Issues a scout command.
   *
   * @param target
   * @param source
   */
  scout(target: System, source: System): void;

  /**
   * Issues a map request.
   *
   * @param user
   */
  map(user: Player): void;

  /**
   * Issues a summary request command.
   *
   * @param user
   */
  summary(user: Player, showScouts: boolean): void;

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
}
