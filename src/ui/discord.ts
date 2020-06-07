import { capitalCase } from 'change-case';
import { EmbedField, MessageEmbed } from 'discord.js';
import { simpleVisualize } from '../game/map/visualize';
import { Dispatch, Fleet, Scout } from '../game/state/fleet';
import { HiddenSystemState, Player } from '../game/state/player';
import {
  CombatReport,
  DetectReport,
  EmpireReinforced,
  IntelReport,
  PrivateerReport,
  Report,
  UnrestReport,
} from '../game/state/report';
import { Settings } from '../game/state/settings';
import { Production, System, SystemState } from '../game/state/system';
import { UI } from './interface';

const typeToColor = {
  standard: undefined,
  good: '#00FF99',
  bad: '#FF0099',
};

const thumbnails = {
  default: 'https://i.imgur.com/WBbbYXV.png',
  defense: 'https://i.imgur.com/3Ea9c6v.png',
  factory: 'https://i.imgur.com/EyKjUxU.png',
  missile: 'https://i.imgur.com/5i8Z8Lh.png',
  planet: 'https://i.imgur.com/nCYnYtK.png',
  revolt: 'https://i.imgur.com/svFGtyx.png',
  system: 'https://i.imgur.com/So3q1Nz.png',
  stealth: 'https://i.imgur.com/z288qe2.png',
  transport: 'https://i.imgur.com/pJXZY7T.png',
  troops: 'https://i.imgur.com/5qfccTp.png',
  uprising: 'https://i.imgur.com/lAjCy4e.png',
  warship: 'https://i.imgur.com/wpQ5Z0c.png',
};

function mask(input: unknown): string {
  return input === undefined ? '?' : `${input}`;
}

function render(changes: { [key: string]: number | undefined }): string {
  const out: string[] = [];
  for (const name in changes) {
    const value = changes[name];
    if (value) {
      out.push(`${capitalCase(name)}: ${value}`);
    }
  }
  if (out.length === 0) {
    return `_No Changes_`;
  }
  return out.join('\n');
}

export class DiscordUI implements UI<string | MessageEmbed> {
  private template(
    type: 'standard' | 'good' | 'bad' = 'standard',
  ): MessageEmbed {
    return (
      new MessageEmbed()
        .setThumbnail(thumbnails.default)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .setColor(typeToColor[type]!)
    );
  }

  ackEndTurn(waitingFor: Player[]): MessageEmbed {
    return this.template().setDescription(
      `Ended your turn.\n\nWaiting for: ${waitingFor
        .map((p) => `<@${p.state.userId}>`)
        .join(', ')}`,
    );
  }

  changeProduction(target: System, unitType: Production): MessageEmbed {
    let icon = thumbnails.default;
    switch (unitType) {
      case 'defenses':
        icon = thumbnails.defense;
        break;
      case 'factories':
        icon = thumbnails.factory;
        break;
      case 'missiles':
        icon = thumbnails.missile;
        break;
      case 'planets':
        icon = thumbnails.planet;
        break;
      case 'stealthships':
        icon = thumbnails.stealth;
        break;
      case 'transports':
        icon = thumbnails.transport;
        break;
      case 'warships':
        icon = thumbnails.warship;
        break;
    }
    return this.template()
      .setTitle('Production')
      .setThumbnail(icon)
      .setDescription(
        `${target.state.name} now producing ${capitalCase(unitType)}`,
      );
  }

  defendedPlanet(
    target: System,
    index: number,
    remaining: number,
  ): MessageEmbed {
    return this.template('bad')
      .setTitle('Invasion Unsuccessful')
      .setThumbnail(thumbnails.revolt)
      .setDescription(
        `${target.state.name} planet ${
          index + 1
        } defended an attack with ${remaining} troops left.`,
      );
  }

  invadedPlanet(
    target: System,
    index: number,
    remaining: number,
  ): MessageEmbed {
    return this.template('good')
      .setTitle('Invasion Successful')
      .setThumbnail(thumbnails.planet)
      .setDescription(
        `System ${target.state.name} planet ${
          index + 1
        } was invaded with ${remaining} troops.`,
      );
  }

  displaySystem(
    pointOfView: Player,
    target: SystemState | HiddenSystemState,
  ): MessageEmbed {
    const message = this.template();
    if ('name' in target) {
      const friendly = pointOfView.filterPlanets(target.planets);
      message
        .setTitle('Friendly System')
        .setDescription(`System ${target.name}`)
        .addField('Home', target.home ? 'Yes' : 'No', true)
        .addField('Producing', capitalCase(target.production), true)
        .addField('Factories', target.factories, true)
        .addField('WarShips', target.warShips, true)
        .addField('StealthShips', target.stealthShips, true)
        .addField('Missiles', target.missiles, true)
        .addField('Transports', target.transports, true)
        .addField('Troops', target.troops, true)
        .addField('Build Points', target.buildPoints, true)
        .addField(
          'Planets',
          `You control ${friendly.length} of ${target.planets.length} planets`,
        );
      target.planets.forEach((planet, index) => {
        message.addField(
          `Planet ${index + 1}`,
          '' +
            `Controlled: ${
              planet.owner === pointOfView.state.userId ? 'Yes' : 'No'
            }\n` +
            `Morale:     ${planet.morale}\n` +
            `Troops:     ${planet.troops}\n` +
            `Recruit:    ${planet.recruit}`,
          true,
        );
      });
    } else {
      message.setTitle('Enemy System');
      if (target.updated === undefined) {
        message.setDescription(
          `No information on system ${target.system.name}.`,
        );
      } else {
        message
          .setDescription(`System ${target.system.name}`)
          .addField('Factories', mask(target.system.factories), true)
          .addField('War Ships', mask(target.system.warShips), true)
          .addField('Stealth Ships', mask(target.system.stealthShips), true)
          .addField('Missiles', mask(target.system.missiles), true)
          .addField('Transports', mask(target.system.transports), true)
          .addField('Build Points', mask(target.system.buildPoints), true);
      }
    }
    return message;
  }

  displaySummary(
    settings: Settings,
    pointOfView: Player,
    currentTurn: number,
    allSystems: System[],
    systems: System[],
    scouts: Scout[],
    fleets: Dispatch[],
  ): MessageEmbed {
    const map =
      simpleVisualize(allSystems)
        .map((row) => row.map((col) => (col === '' ? '•' : col)).join(' '))
        .join('\n') + '\n';

    const message = this.template()
      .setTitle(`Admiral ${pointOfView.state.name}`)
      .setDescription(
        '' +
          `Turn ${currentTurn}\n` +
          `\`\`\`\n${map}\n\`\`\`\n` +
          `Score: ${pointOfView.computeScore(fleets, systems, scouts)}\n` +
          `Combat: Naval ${pointOfView.state.ratings.naval}%, ` +
          `Ground ${pointOfView.state.ratings.ground}%`,
      );

    // Reports.
    const reports = pointOfView.state.reports;
    message.addField(
      '**Reports**',
      reports.length ? `${reports.length}` : 'None',
    );
    message.addFields(this.writeReports(reports, currentTurn));

    // Systems.
    message.addField(
      '**Systems**',
      systems.length ? `${systems.length}` : 'None',
    );
    message.addFields(this.writeSystems(systems));

    // Scouts.
    message.addField('**Scouts**', scouts.length ? `${scouts.length}` : 'None');
    message.addFields(
      this.writeScouts(scouts, currentTurn, settings.shipSpeedATurn),
    );

    // Fleets.
    message.addField('**Fleets**', fleets.length ? `${fleets.length}` : 'None');
    message.addFields(
      this.writeFleets(fleets, currentTurn, settings.shipSpeedATurn),
    );

    return message;
  }

  private writeReports(reports: Report[], turn: number): EmbedField[] {
    return reports.map((report) => {
      switch (report.kind) {
        case 'intel':
          return this.writeReportIntel(report);
        case 'combat':
          return this.writeReportCombat(report);
        case 'detect':
          return this.writeDetectFleet(report, turn);
        case 'unrest':
          return this.writeUnrestReport(report);
        case 'privateer':
          return this.writePrivateerReport(report);
        case 'reinforced':
          return this.writeReinforcementReport(report);
        case 'event':
          return {
            name: 'Event',
            value: report.text,
            inline: false,
          };
      }
    });
  }

  private writeReportIntel(report: IntelReport): EmbedField {
    let value;
    if (report.name) {
      value = `System ${report.system} scouted by ${report.name}.`;
    } else {
      value = `Scout reaches system ${report.system}.`;
    }
    return {
      name: `Intel at ${report.system}`,
      value,
      inline: false,
    };
  }

  private writeReportCombat(report: CombatReport): EmbedField {
    const name =
      report.result.winner === 'draw'
        ? 'Draw'
        : report.attacker === (report.result.winner === 'attacker')
        ? 'Victory'
        : 'Defeat';
    const you = render(
      report.attacker ? report.result.attacker : report.result.defender,
    );
    const them = render(
      report.attacker ? report.result.defender : report.result.attacker,
    );
    return {
      name: `Combat at ${report.system}: ${name}`,
      value: '' + `**You**:\n${you}\n\n` + `**Them**\n${them}`,
      inline: false,
    };
  }

  private writeDetectFleet(report: DetectReport, turn: number): EmbedField {
    return {
      inline: false,
      name: `Incoming ${report.missiles ? 'Missles' : 'Fleet'} at ${
        report.system
      }!`,
      value: `Approximately ${report.size} incoming; ETA ${turn + report.eta}`,
    };
  }

  private writeUnrestReport(report: UnrestReport): EmbedField {
    let value;
    if (report.planet) {
      value = `Discontent builds on planet ${report.planet + 1} of ${
        report.system
      }`;
    } else if (report.overthrown) {
      value =
        `System ${report.system} overthrows ${report.overthrown.who}, ` +
        `reverting to ${report.overthrown.reverted}`;
    } else {
      value = `System ${report.system} garrison reports unrest`;
    }
    return {
      inline: false,
      name: `Unrest at ${report.system}`,
      value,
    };
  }

  private writePrivateerReport(report: PrivateerReport): EmbedField {
    return {
      name: `Privateers at ${report.system}`,
      value: `Privateers capture ${report.warships}`,
      inline: false,
    };
  }

  private writeReinforcementReport(report: EmpireReinforced): EmbedField {
    return {
      name: `Emperor Reinforces ${report.system}`,
      value: render({
        warShips: report.system.warShips,
        stealthShips: report.system.stealthShips,
        transports: report.system.transports,
        troops: report.system.troops,
        defenses: report.system.defenses,
        missiles: report.system.missiles,
      }),
      inline: false,
    };
  }

  private writeSystems(systems: System[]): EmbedField[] {
    return systems.map((system) => {
      const value =
        '' +
        `P: ${capitalCase(system.state.production)}\n` +
        `S: ${system.offensiveShips}\n` +
        `D: ${system.state.defenses}\n` +
        `M: ${system.morale}`;
      return {
        name: `${system.state.name}`,
        value,
        inline: true,
      };
    });
  }

  private writeScouts(
    scouts: Scout[],
    turn: number,
    speed: number,
  ): EmbedField[] {
    return scouts.map((scout, index) => {
      return {
        name: `#${index + 1} ${scout.state.source} -> ${scout.state.target}`,
        value: `ETA Turn ${turn + scout.eta(speed)}`,
        inline: true,
      };
    });
  }

  private writeFleets(
    fleets: Dispatch[],
    turn: number,
    speed: number,
  ): EmbedField[] {
    return fleets.map((fleet, index) => {
      const total = fleet.totalShips;
      const value =
        '' +
        `ETA:     Turn ${turn + fleet.eta(speed)}\n` +
        `Ships:   ${total}\n` +
        `Troops:  ${fleet.state.troops}`;
      return {
        name: `#${index + 1} ${fleet.state.source} -> ${fleet.state.target}`,
        value,
        inline: true,
      };
    });
  }

  sentAttack(
    from: System,
    to: System,
    etaTurns: number,
    unitTypes: Fleet,
  ): MessageEmbed {
    const total =
      unitTypes.state.warShips +
      unitTypes.state.stealthShips +
      unitTypes.state.missiles +
      unitTypes.state.transports;
    return this.template()
      .setTitle(`Attacking ${to.state.name} with ${total} ships`)
      .setDescription(`ETA ${etaTurns} turns.`)
      .addField('WarShips', `${unitTypes.state.warShips}`, true)
      .addField('StealthShips', `${unitTypes.state.stealthShips}`, true)
      .addField('Missiles', `${unitTypes.state.missiles}`, true)
      .addField('Transports', `${unitTypes.state.transports}`, true)
      .addField('Troops', `${unitTypes.state.troops}`, true)
      .addField('Build Points', mask(unitTypes.state.buildPoints), true);
  }

  sentMove(
    from: System,
    to: System,
    etaTurns: number,
    unitTypes: Fleet,
  ): MessageEmbed {
    const total =
      unitTypes.state.warShips +
      unitTypes.state.stealthShips +
      unitTypes.state.missiles +
      unitTypes.state.transports;
    return this.template()
      .setTitle(`Reinforcing ${to.state.name} with ${total} ships`)
      .setDescription(`ETA ${etaTurns} turns.`)
      .addField('WarShips', `${unitTypes.state.warShips}`, true)
      .addField('StealthShips', `${unitTypes.state.stealthShips}`, true)
      .addField('Missiles', `${unitTypes.state.missiles}`, true)
      .addField('Transports', `${unitTypes.state.transports}`, true)
      .addField('Troops', `${unitTypes.state.troops}`, true)
      .addField('Build Points', mask(unitTypes.state.buildPoints), true);
  }

  sentScout(
    from: System,
    to: System,
    etaTurns: number,
    shipType: 'WarShip' | 'StealthShip',
  ): MessageEmbed {
    return this.template()
      .setThumbnail(
        shipType === `StealthShip` ? thumbnails.stealth : thumbnails.warship,
      )
      .setTitle(`Scouting ${to.state.name}`)
      .setDescription(`ETA ${etaTurns} turns.`);
  }
}
