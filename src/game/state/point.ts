/**
 * 2-D point.
 */
export type PointState = [number, number];

export class Point {
  constructor(public readonly state: PointState) {}

  distance(to: Point): number {
    const x1 = this.state[0];
    const y1 = this.state[1];
    const x2 = to.state[0];
    const y2 = to.state[1];
    return parseFloat(
      Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2),
    );
  }
}
