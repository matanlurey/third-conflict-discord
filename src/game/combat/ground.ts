import { Chance } from 'chance';

export function determineGroundResults(
  attacker: { rating: number; troops: number },
  defender: { rating: number; troops: number },
  chance = new Chance(),
): {
  winner: 'attacker' | 'defender';
  attacker: number;
  defender: number;
} {
  // TODO: Should this have rounds of combat?
  function isAttackerRemaining(): boolean {
    return attacker.troops > 0;
  }

  function isDefenderRemaining(): boolean {
    return defender.troops > 0;
  }

  let attacking = true;
  while (isAttackerRemaining() && isDefenderRemaining()) {
    const didHit = chance.bool({
      likelihood: attacking ? attacker.rating : defender.rating,
    });
    if (didHit) {
      if (attacking) {
        defender.troops--;
      } else {
        attacker.troops--;
      }
    }
    attacking = !attacking;
  }

  return {
    winner: isAttackerRemaining() ? 'attacker' : 'defender',
    attacker: attacker.troops,
    defender: defender.troops,
  };
}
