import { System } from '../state/system';

/**
 * A simple text visualization of systems.
 *
 * @param systems
 */
export function simpleVisualize(
  systems: System[],
  owned?: string[],
): string[][] {
  const bracket = new Set(owned || []);
  let width = 0;
  let height = 0;
  systems.forEach((system) => {
    const x = system.position.state[0];
    const y = system.position.state[1];
    if (x > width) {
      width = x;
    }
    if (y > height) {
      height = y;
    }
  });
  const grid: string[][] = new Array(height + 1);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = new Array(width + 1).fill('');
  }
  systems.forEach((system) => {
    const x = system.position.state[0];
    const y = system.position.state[1];
    let s = system.state.name.substring(0, 1);
    if (owned) {
      if (bracket.has(system.state.name)) {
        s = `[${s}]`;
      } else {
        s = ` ${s} `;
      }
    }
    grid[y][x] = s;
  });
  return grid;
}
