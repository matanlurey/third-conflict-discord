import { capitalCase } from 'change-case';
import { simpleVisualize } from '../game/map/visualize';
import { Dispatch, Fleet, Scout } from '../game/state/fleet';
import { HiddenSystemState, Player } from '../game/state/player';
import { CombatReport } from '../game/state/report';
import { Settings } from '../game/state/settings';
import { Production, System, SystemState } from '../game/state/system';
import { UI } from './interface';

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

  defendedPlanet(target: System, index: number, remaining: number): string {
    return `System ${target.state.name} planet ${
      index + 1
    } defended an attack with ${remaining} troops left.`;
  }

  invadedPlanet(target: System, index: number, remaining: number): string {
    return `System ${target.state.name} planet ${
      index + 1
    } was invaded with ${remaining} troops.`;
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
    showScouts: boolean,
  ): string {
    const visualize =
      simpleVisualize(
        allSystems,
        systems.map((s) => s.state.name),
      )
        .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
        .join('\n') + '\n';
    const controls = new Set(systems.map((s) => s.state.name));
    return [
      `Summary of Admiral ${pointOfView.state.name} on turn ${currentTurn} of ${settings.maxGameLength}.\n`,
      `SCORE: ${pointOfView.computeScore(fleets, systems, scouts)}\n`,
      visualize,
      `REPORTS:`,
      ...(pointOfView.state.reports.length === 0
        ? [`  <None>`]
        : pointOfView.state.reports.map((r) => {
            switch (r.kind) {
              case 'intel':
                if (r.scout) {
                  if (r.name) {
                    return `  System ${r.system} scouted by ${r.name}`;
                  } else {
                    return `  Scout reaches system ${r.system}`;
                  }
                }
                break;
              case 'combat':
                return this.displayCombat(r);
              case 'detect':
                return `  Incoming approximately ${r.size} ${
                  r.missiles ? 'missile(s)' : 'flee(t)'
                } to ${r.system}; eta turn ${currentTurn + r.eta}`;
              case 'unrest':
                if (r.planet) {
                  return `  Discontent builds on planet ${r.planet} of ${r.system}`;
                }
                if (r.overthrown) {
                  return `  System ${r.system} overthrows ${r.overthrown.who}, control reverst to ${r.overthrown.reverted}`;
                }
                return `  System ${r.system} garrison reports unrest`;
              case 'privateer':
                return `  Privateers capture ${r.warships} WarShip(s) in ${r.system}`;
              case 'reinforced':
                return `  The Emperor reinforces ${r.system} with <TODO: List Units>`;
            }
            return `  <BUG! UI Handler Missing> ${JSON.stringify(r)}`;
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
      `\nSCOUTS:${showScouts ? '' : ` ${scouts.length}`}`,
      ...(!showScouts
        ? []
        : scouts.length === 0
        ? [`  <None>`]
        : showScouts
        ? scouts.map((s, i) => {
            let recall = ``;
            if (controls.has(s.state.target)) {
              recall = ` [Returning]`;
            }
            return `  #${i + 1} ${s.state.source} -> ${
              s.state.target
            }${recall} (ETA Turn ${
              currentTurn + s.eta(settings.shipSpeedATurn)
            })`;
          })
        : `  ${scouts.length}`),
      `\nFLEETS:`,
      ...(fleets.length === 0
        ? [`  <None>`]
        : fleets.map((s, i) => {
            let recall = '';
            if (controls.has(s.state.target)) {
              recall = ` [Returning]`;
            }
            const total =
              s.state.warShips +
              s.state.stealthShips +
              s.state.missiles +
              s.state.transports;
            return `  #${i + 1} ${s.state.source} -> ${
              s.state.target
            }: ${total}${recall} (ETA Turn ${
              currentTurn + s.eta(settings.shipSpeedATurn)
            })`;
          })),
    ].join('\n');
  }

  private displayCombat(r: CombatReport): string {
    const result =
      r.result.winner === 'draw'
        ? 'draw'
        : r.attacker === (r.result.winner === 'attacker')
        ? 'victory'
        : 'defeat';

    function renderChanges(changes: {
      [key: string]: number | undefined;
    }): string {
      const out: string[] = [];
      for (const name in changes) {
        const value = changes[name];
        if (value) {
          out.push(`    ${capitalCase(name)}: ${value}`);
        }
      }
      if (out.length === 0) {
        return `    <No Changes>`;
      }
      return out.join('\n');
    }

    const you = renderChanges(
      r.attacker ? r.result.attacker : r.result.defender,
    );
    const them = renderChanges(
      r.attacker ? r.result.defender : r.result.attacker,
    );
    return (
      '' +
      `  Combat @ ${r.system} resulted in ${result}.\n` +
      `  YOU:\n${you}\n` +
      `  THEM:\n${them}`
    );
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

  sentMove(
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
      `Reinforcements of "${total} ships" sent from "${from.state.name}" to ` +
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
