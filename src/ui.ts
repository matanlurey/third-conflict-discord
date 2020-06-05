import { MessageEmbed } from 'discord.js';
import { simpleVisualize } from './game/map/visualize';
import { Dispatch, Fleet, Scout } from './game/state/fleet';
import { Player } from './game/state/player';
import { Settings } from './game/state/settings';
import { Production, System } from './game/state/system';

export abstract class UI<
  T extends string | MessageEmbed = string | MessageEmbed
> {
  abstract ackEndTurn(): T;

  abstract changeProduction(target: System, unitType: Production): T;

  abstract displayReports(forPlayer: Player): T;

  abstract displaySystem(
    pointOfView: Player,
    target: System,
    owner: Player,
    currentTurn: number,
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

  displayReports(forPlayer: Player): string {
    const output: string[] = [];

    for (const report of forPlayer.state.reports) {
      switch (report.kind) {
        case 'intel':
          output.push(`[INTEL] Gathered intel from "${report.system}".`);
          break;
      }
    }

    return output.join('\n');
  }

  displaySystem(
    pointOfView: Player,
    target: System,
    owner: Player,
    currentTurn: number,
  ): string {
    if (owner.state.userId === pointOfView.state.userId) {
      return (
        '' +
        `Report on "${target.state.name}" (You control this system):\n` +
        '\n' +
        `Home System: ${target.state.home ? 'Yes' : 'No'}\n` +
        `Producing: ${target.state.production}\n` +
        '\n' +
        `Factories: ${target.state.factories}\n` +
        `Planets: ${target.state.planets.length}\n` +
        '\n' +
        `WarShips: ${target.state.warShips}\n` +
        `StealthShips: ${target.state.stealthShips}\n` +
        `Missiles: ${target.state.missiles}\n` +
        `Transports: ${target.state.transports}\n` +
        `Troops: ${target.state.troops}\n` +
        `Points: ${target.state.buildPoints}\n`
      );
    } else {
      const fogOfWar = pointOfView.state.fogOfWar[target.state.name];
      if (!fogOfWar) {
        return `Report on "${target.state.name}: No information.`;
      }
      return (
        '' +
        `Report on "${target.state.name}" (Last updated ${
          currentTurn - fogOfWar.updated
        } turns ago)\n` +
        '\n' +
        `Factories: ${mask(target.state.factories)}\n` +
        `Planets: ${mask(target.state.planets.length)}\n` +
        '\n' +
        `WarShips: ${mask(target.state.warShips)}\n` +
        `StealthShips: ${mask(target.state.stealthShips)}\n` +
        `Missiles: ${mask(target.state.missiles)}\n` +
        `Transports: ${mask(target.state.transports)}\n`
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
    return [
      `Summary of Admiral ${pointOfView.state.name} on turn ${currentTurn}.\n`,
      visualize,
      `SYSTEMS:`,
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
            return `  ${s.state.source} -> ${s.state.target} (ETA ${s.eta(
              settings.shipSpeedATurn,
            )})`;
          })),
      `\nFLEETS:`,
      ...(fleets.length === 0
        ? [`  <None>`]
        : fleets.map((s) => {
            const total =
              s.state.warShips +
              s.state.stealthShips +
              s.state.missiles +
              s.state.transports;
            return `  ${s.state.source} -> ${
              s.state.target
            }: ${total} (ETA ${s.eta(settings.shipSpeedATurn)})`;
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
      `Attack "${total} ships" sent from "${to.state.name}" to ` +
      `"${from.state.name}"; eta ${etaTurns} turns.`
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
