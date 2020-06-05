import { Chance } from 'chance';

function dist2(x1: number, y1: number, x2: number, y2: number): number {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

/**
 * @see https://github.com/ogus/poisson-disk/blob/master/src/poisson-disk.js.
 */
export class PoissonDiskSampler {
  private readonly xMin = 0;
  private readonly yMin = 0;
  private readonly xMax: number;
  private readonly yMax: number;
  private readonly radius: number;
  private readonly cellSize: number;
  private readonly k: number;

  private state!: {
    width: number;
    height: number;
    data: [number, number][];
  };
  private queue!: [number, number][];
  private firstPoint = true;

  constructor(
    viewport: [number, number],
    minDistance = 1,
    private readonly maxTries = 30,
    private readonly chance = new Chance(),
  ) {
    this.xMax = viewport[0];
    this.yMax = viewport[1];
    this.radius = Math.max(minDistance, 1);
    this.cellSize = this.radius * Math.SQRT1_2;
    this.k = Math.max(maxTries, 2);
    this.reset();
  }

  /**
   * Reset the sampler.
   */
  reset(): void {
    const width = Math.ceil((this.xMax - this.xMin) / this.cellSize);
    const height = Math.ceil((this.yMax - this.yMin) / this.cellSize);
    this.state = {
      width,
      height,
      data: new Array(width * height).fill(null),
    };
    this.queue = [];
    this.firstPoint = true;
  }

  /**
   * Creates and returns a new point.
   *
   * @param x
   * @param y
   */
  private createPoint(x: number, y: number): [number, number] {
    const index =
      Math.floor(x / this.cellSize) +
      Math.floor(y / this.cellSize) * this.state.width;
    const point = (this.state.data[index] = [x, y]);
    this.queue.push(point);
    return point;
  }

  /**
   * Returns whether the provided points are valid.
   *
   * @param x
   * @param y
   */
  private isValidPoint(x: number, y: number): boolean {
    if (x < this.xMin || x > this.xMax || y < this.yMin || y > this.yMax) {
      return false;
    }
    const col = Math.floor((x - this.xMin) / this.cellSize);
    const row = Math.floor((y - this.yMin) / this.cellSize);
    let index = 0;
    for (let i = col - 2; i <= col + 2; i++) {
      for (let j = row - 2; j <= row + 2; j++) {
        if (i >= 0 && i < this.state.width && j >= 0 && j < this.state.height) {
          index = i + j * this.state.width;
          if (
            this.state.data[index] !== null &&
            dist2(x, y, this.state.data[index][0], this.state.data[index][1]) <=
              this.radius * this.radius
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Returns a standard `Math.random()`-like result.
   */
  private rng(): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.chance as any).random();
  }

  /**
   * Returns the next point in the sampling, or `null` if there is no more.
   */
  nextPoint(): [number, number] | null {
    let x = 0;
    let y = 0;
    if (this.firstPoint) {
      this.firstPoint = false;
      x = this.xMin + (this.xMax - this.xMin) * this.rng();
      y = this.yMin + (this.yMax - this.yMin) * this.rng();
      return this.createPoint(x, y);
    }
    let index = 0;
    let distance = 0;
    let angle = 0;
    while (this.queue.length) {
      index = (this.queue.length * this.rng()) | 0;
      for (let i = 0; i < this.k; i++) {
        distance = this.radius * (this.rng() + 1);
        angle = 2 * Math.PI * this.rng();
        x = this.queue[index][0] + distance * Math.cos(angle);
        y = this.queue[index][1] + distance * Math.sin(angle);
        if (this.isValidPoint(x, y)) {
          return this.createPoint(x, y);
        }
      }
      this.queue.splice(index, 1);
    }
    return null;
  }

  /**
   * Returns whether there are no points.
   */
  get done(): boolean {
    return !this.firstPoint && this.queue.length === 0;
  }

  /**
   * Returns all the points possible, up to a maximum requested.
   *
   * @param max
   */
  points(max: number = Number.MAX_SAFE_INTEGER): [number, number][] {
    const result: [number, number][] = [];
    for (let i = 0; i < max; i++) {
      const point = this.nextPoint();
      if (point) {
        result.push(point);
      }
    }
    return result;
  }
}
