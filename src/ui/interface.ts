import { MessageEmbed } from 'discord.js';
import { Dispatch, Fleet, Scout } from '../game/state/fleet';
import { HiddenSystemState, Player } from '../game/state/player';
import { Settings } from '../game/state/settings';
import { Production, System, SystemState } from '../game/state/system';
export abstract class UI<
  T extends string | MessageEmbed = string | MessageEmbed
> {
  abstract ackEndTurn(players: Player[]): T;

  abstract changeProduction(target: System, unitType: Production): T;

  abstract displaySystem(
    pointOfView: Player,
    target: SystemState | HiddenSystemState,
  ): T;

  abstract displayMap(systems: System[], owned: System[]): T;

  abstract displaySummary(
    setting: Settings,
    pointOfView: Player,
    currentTurn: number,
    allSystems: System[],
    systems: System[],
    scouts: Scout[],
    fleets: Dispatch[],
    showScouts: boolean,
  ): T;

  abstract defendedPlanet(target: System, index: number, remaining: number): T;

  abstract invadedPlanet(target: System, index: number, remaining: number): T;

  abstract sentAttack(
    from: System,
    to: System,
    etaTurns: number,
    unitTypes: Fleet,
  ): T;

  abstract sentMove(
    from: System,
    to: System,
    etaTurns: number,
    unitTypes: Fleet,
  ): T;

  abstract sentScout(
    from: System,
    to: System,
    etaTurns: number,
    shipType: 'WarShip' | 'StealthShip',
  ): T;
}
