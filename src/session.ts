/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageEmbed } from 'discord.js';
import gameHook from './cli/hooks';
import {
  ArgumentError,
  CliHandler,
  CliMessenger,
  CliReader,
  GameStateError,
} from './cli/reader';
import { Command } from './command/config';
import { parse } from './command/parser';
import commands from './commands';
import { Fleet } from './game/state/fleet';
import { Game } from './game/state/game';
import { Player } from './game/state/player';
import { Production, System } from './game/state/system';
import { UI } from './ui';

export class Session implements CliHandler {
  private readonly commands: Command[];
  private readonly reader: CliReader;
  private replyTo?: string;

  constructor(
    private readonly game: Game,
    private readonly ui: UI,
    private readonly messenger: CliMessenger,
  ) {
    this.commands = commands({
      enableNoviceMode: game.state.settings.enableNoviceMode,
      enableSystemDefenses: game.state.settings.enableSystemDefenses,
    });
    this.reader = new CliReader(gameHook(game), this);
  }

  private reply(message: string | MessageEmbed): void {
    if (!this.replyTo) {
      throw new Error(`No user to reply to.`);
    }
    this.messenger.message(this.replyTo, message);
  }

  handle(userId: string, wasDm: boolean, input: string): void {
    try {
      this.replyTo = userId;
      const args = parse(input, this.commands);
      if (args.error) {
        console.warn('Could not parse:', args.error);
      } else {
        this.reader.read(userId, args);
      }
    } catch (e) {
      if (e instanceof ArgumentError) {
        // TODO: Handle.
        console.error('Unhandled error', e);
      } else if (e instanceof GameStateError) {
        // TODO: Handle.
        console.error('Unhandled error', e);
      } else {
        // TODO: Handle.
        console.error('Unhandled error', e);
      }
    } finally {
      this.replyTo = undefined;
    }
  }

  attack(source: System, target: System, fleet: Fleet): void {
    const dispatch = source.attack(source, target, fleet, 'conquest');
    this.game.state.fleets.push(dispatch.state);
    this.reply(
      this.ui.sentAttack(
        source,
        target,
        dispatch.eta(this.game.state.settings.shipSpeedATurn),
        dispatch,
      ),
    );
  }

  build(source: System, unit: Production): void {
    source.change(unit);
    this.reply(this.ui.changeProduction(source, unit));
  }

  end(user: Player): void {
    this.game.endTurn(user);
  }

  reports(user: Player): void {
    this.reply(this.ui.displayReports(user));
  }

  scan(user: Player, target: System): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const owner = this.game.findPlayer(target.state.owner)!;
    this.reply(
      this.ui.displaySystem(user, target, owner, this.game.state.turn),
    );
  }

  scout(target: System, source: System): void {
    let scout: 'warship' | 'stealthship';
    if (source.state.stealthShips) {
      source.state.stealthShips--;
      scout = 'stealthship';
    } else if (source.state.warShips) {
      source.state.warShips--;
      scout = 'warship';
    } else {
      throw new GameStateError(
        `No valid units for scouting from "${source.state.name}".`,
      );
    }
    const result = source.scout(target, source, scout);
    this.game.state.scouts.push(result.state);
    this.reply(
      this.ui.sentScout(
        source,
        target,
        result.eta(this.game.state.settings.shipSpeedATurn),
        result.state.scout === 'warship' ? 'WarShip' : 'StealthShip',
      ),
    );
  }

  summary(user: Player): void {
    const settings = this.game.state.settings;
    const currentTurn = this.game.state.turn;
    const systems = user.filterSystems(this.game.systems);
    const scouts = user.filterScouts(this.game.scouts);
    const fleets = user.filterFleets(this.game.fleets);
    this.reply(
      this.ui.displaySummary(
        settings,
        user,
        currentTurn,
        this.game.systems,
        systems,
        scouts,
        fleets,
      ),
    );
  }
}
