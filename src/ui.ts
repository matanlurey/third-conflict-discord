import { MessageEmbed } from 'discord.js';
import { simpleVisualize } from './game/map/visualize';
import { Dispatch, Fleet, Scout } from './game/state/fleet';
import { HiddenSystemState, Player } from './game/state/player';
import { Settings } from './game/state/settings';
import { Production, System, SystemState } from './game/state/system';

export abstract class UI<
  T extends string | MessageEmbed = string | MessageEmbed
> {
  abstract ackEndTurn(): T;

  abstract changeProduction(target: System, unitType: Production): T;

  abstract displaySystem(
    pointOfView: Player,
    target: SystemState | HiddenSystemState,
  ): T;

  abstract displaySummary(
    setting: Settings,
    pointOfView: Player,
    currentTurn: number,
    allSystems: System[],
    systems: System[],
    scouts: Scout[],
    fleets: Dispatch[],
  ): T;

  abstract sentAttack(
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

function mask(input: unknown): string {
  return input === undefined ? '?' : `${input}`;
}

export class SimpleUI extends UI<string> {
  ackEndTurn(): string {
    return `Ended your turn.`;
  }

  changeProduction(target: System, unitType: Production): string {
    return `Now producing "${unitType}" at "${target.state.name}".`;
  }

  displaySystem(
    pointOfView: Player,
    target: SystemState | HiddenSystemState,
  ): string {
    if ('name' in target) {
      return (
        '' +
        `Report on "${target.name}" (You control this system):\n` +
        '\n' +
        `Home System: ${target.home ? 'Yes' : 'No'}\n` +
        `Producing: ${target.production}\n` +
        '\n' +
        `Factories: ${target.factories}\n` +
        `Planets: ${target.planets.length}\n` +
        '\n' +
        `WarShips: ${target.warShips}\n` +
        `StealthShips: ${target.stealthShips}\n` +
        `Missiles: ${target.missiles}\n` +
        `Transports: ${target.transports}\n` +
        `Troops: ${target.troops}\n` +
        `Points: ${target.buildPoints}\n`
      );
    } else {
      if (target.updated === undefined) {
        return `Report on "${target.system.name}: No information.`;
      }
      return (
        '' +
        `Report on "${target.system.name}" (Last updated on turn ${target.updated})\n` +
        '\n' +
        `Factories: ${mask(target.system.factories)}\n` +
        `Planets: ${mask(target.system.planets?.length)}\n` +
        '\n' +
        `WarShips: ${mask(target.system.warShips)}\n` +
        `StealthShips: ${mask(target.system.stealthShips)}\n` +
        `Missiles: ${mask(target.system.missiles)}\n` +
        `Transports: ${mask(target.system.transports)}\n`
      );
    }
  }

  displaySummary(
    settings: Settings,
    pointOfView: Player,
    currentTurn: number,
    allSystems: System[],
    systems: System[],
    scouts: Scout[],
    fleets: Dispatch[],
  ): string {
    const visualize =
      simpleVisualize(allSystems)
        .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
        .join('\n') + '\n';
    const controls = new Set(systems.map((s) => s.state.name));
    return [
      `Summary of Admiral ${pointOfView.state.name} on turn ${currentTurn}.\n`,
      visualize,
      `REPORTS:`,
      ...(pointOfView.state.reports.length === 0
        ? [`  <None>`]
        : pointOfView.state.reports.map((r) => {
            return '';
          })),
      `\nSYSTEMS:`,
      ...(systems.length === 0
        ? [`  <None>`]
        : systems.map((s) => {
            const total =
              s.state.warShips +
              s.state.stealthShips +
              s.state.missiles +
              s.state.transports;
            return `  ${s.state.name}. P: ${s.state.production}, T: ${total}, M: ${s.morale}`;
          })),
      `\nSCOUTS:`,
      ...(scouts.length === 0
        ? [`  <None>`]
        : scouts.map((s) => {
            let recall = '';
            if (controls.has(s.state.target)) {
              recall = ` [Returning]`;
            }
            return `  ${s.state.source} -> ${
              s.state.target
            }${recall} (ETA Turn ${
              currentTurn + s.eta(settings.shipSpeedATurn)
            })`;
          })),
      `\nFLEETS:`,
      ...(fleets.length === 0
        ? [`  <None>`]
        : fleets.map((s) => {
            let recall = '';
            if (controls.has(s.state.target)) {
              recall = ` [Returning]`;
            }
            const total =
              s.state.warShips +
              s.state.stealthShips +
              s.state.missiles +
              s.state.transports;
            return `  ${s.state.source} -> ${
              s.state.target
            }: ${total}${recall} (ETA Turn ${
              currentTurn + s.eta(settings.shipSpeedATurn)
            })`;
          })),
    ].join('\n');
  }

  sentAttack(
    from: System,
    to: System,
    etaTurns: number,
    unitTypes: Fleet,
  ): string {
    const total =
      unitTypes.state.warShips +
      unitTypes.state.stealthShips +
      unitTypes.state.missiles +
      unitTypes.state.transports;
    return (
      `Attack "${total} ships" sent from "${from.state.name}" to ` +
      `"${to.state.name}"; eta ${etaTurns} turns.`
    );
  }

  sentScout(
    from: System,
    to: System,
    etaTurns: number,
    shipType: 'WarShip' | 'StealthShip',
  ): string {
    return (
      `Scout "${shipType}" sent from "${to.state.name}" to ` +
      `"${from.state.name}"; eta ${etaTurns} turns.`
    );
  }
}
