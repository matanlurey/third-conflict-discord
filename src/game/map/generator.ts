import { Chance } from 'chance';
import { System } from '../state/system';

export abstract class Generator {
  constructor(
    private readonly chance = new Chance(),
    private readonly names = [
      'Alfa',
      'Bravo',
      'Charlie',
      'Delta',
      'Echo',
      'Foxtrot',
      'Golf',
      'Hotel',
      'India',
      'Juliett',
      'Kilo',
      'Lima',
      'Mike',
      'November',
      'Oscar',
      'Papa',
      'Quebec',
      'Romeo',
      'Sierra',
      'Tango',
      'Uniform',
      'Victor',
      'Whiskey',
      'Xray',
      'Yankee',
      'Zulu',
    ],
  ) {}

  abstract generateMap(players: string[]): System[];

  protected fetchNames(amount: number): string[] {
    return this.chance.pickset(this.names, amount);
  }
}
