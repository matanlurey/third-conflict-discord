import { Chance } from 'chance';

export function startingRatings(chance = new Chance()): [number, number] {
  const naval = chance.integer({ min: 60, max: 80 });
  const ground = 60 + (80 - naval);
  return [naval, ground];
}
