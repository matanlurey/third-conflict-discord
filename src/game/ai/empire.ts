import { Fleet } from '../state/fleet';
import { Game } from '../state/game';
import { Player } from '../state/player';
import { EmpireReinforced } from '../state/report';
import { System } from '../state/system';

export class EmpireAI {
  private readonly player: Player;

  constructor(
    private readonly chance: Chance.Chance,
    private readonly game: Game,
  ) {
    this.player = game.mustPlayer('Empire');
  }

  runAI(): void {
    let attempts = this.game.players.length - 1;
    let reinforce = 1;
    switch (this.game.state.settings.gameDifficulty) {
      case 'hard':
        attempts *= 2;
        reinforce = 2;
        break;
      case 'tough':
        attempts *= 3;
        reinforce = 3;
        break;
    }
    const owned = this.player.filterSystems(this.game.systems);
    if (!owned.length) {
      return;
    }
    while (attempts) {
      const system = this.chance.pickone(owned);
      let attempted;
      if (this.chance.bool()) {
        attempted = this.maybeLaunchAssault(system);
      } else {
        attempted = this.maybeFireZeMissiles(system);
      }
      if (attempted) {
        attempts--;
      }
    }
    while (reinforce) {
      if (this.chance.bool({ likelihood: 33.33 })) {
        this.sendReinforcemnts(this.chance.pickone(owned));
        return;
      }
      reinforce--;
    }
  }

  private sendReinforcemnts(system: System): void {
    const ratio = this.chance.weighted([1, 2, 3, 5], [5, 3, 2, 1]);
    const transports = this.chance.integer({ min: 2 * ratio, max: 6 * ratio });
    const fleet = Fleet.create({
      warShips: this.chance.integer({ min: 10 * ratio, max: 30 * ratio }),
      stealthShips: this.chance.integer({ min: 3 * ratio, max: 10 * ratio }),
      missiles: this.chance.integer({ min: 2 * ratio, max: 4 * ratio }),
      transports,
      troops: transports * 50,
    });
    const defenses = this.chance.integer({ min: 3 * ratio, max: 8 * ratio });
    system.add(fleet.state);
    system.state.defenses += defenses;
    const report: EmpireReinforced = {
      kind: 'reinforced',
      system: system.state,
    };
    this.game.players.forEach((p) => {
      if (!p.isAI) {
        // TODO: Add .reportReinforcements().
        p.state.reports.push(report);
      }
    });
  }

  private randomEnemySystem(): System | undefined {
    const enemies = this.game.systems.filter(
      (s) => s.state.owner !== this.player.state.userId,
    );
    if (enemies.length) {
      return this.chance.pickone(enemies);
    }
  }

  private maybeLaunchAssault(system: System): boolean {
    if (!this.chance.bool()) {
      return true;
    }
    if (system.offensiveShips >= 100) {
      const enemy = this.randomEnemySystem();
      if (enemy) {
        const fleet = Fleet.create({
          warShips: this.chance.integer({
            min: 0,
            max: system.state.warShips,
          }),
          stealthShips: this.chance.integer({
            min: 0,
            max: system.state.stealthShips,
          }),
          transports: this.chance.integer({
            min: 0,
            max: system.state.transports,
          }),
        });
        if (fleet.isEliminated) {
          return false;
        }
        const sent = system.attack(
          enemy,
          Fleet.create({
            warShips: this.chance.integer({
              min: 0,
              max: system.state.warShips,
            }),
            stealthShips: this.chance.integer({
              min: 0,
              max: system.state.stealthShips,
            }),
            transports: this.chance.integer({
              min: 0,
              max: system.state.transports,
            }),
          }),
          'conquest',
        );
        // Cheat a bit, add 50 troops per Transport.
        sent.state.troops = sent.state.transports * 50;
        return true;
      }
    }
    return false;
  }

  private maybeFireZeMissiles(system: System): boolean {
    if (!this.chance.bool()) {
      return true;
    }
    if (system.state.missiles >= 5) {
      const enemy = this.randomEnemySystem();
      if (enemy) {
        system.attack(
          enemy,
          Fleet.create({
            missiles: this.chance.integer({
              min: 5,
              max: system.state.missiles,
            }),
          }),
          'conquest',
        );
        return true;
      }
    }
    return false;
  }
}
