export class PoissonDiskSampler {
  private xMin: number;
  private xMax: number;
  private yMin: number;
  private yMax: number;

  private radius: number;
  private k: number;

  constructor(
    private readonly viewport: [number, number],
    private readonly minDistance = 1,
    private readonly maxTries = 2,
    private readonly chance = new Chance(),
  ) {
    this.reset();
  }

  reset(): void {
    this.xMin = 0;
    this.xMax = this.viewport[0];
    this.yMin = 0;
    this.yMax = this.viewport[1];

    this.radius = Math.max(this.minDistance, 1);
    this.k = Math.max(this.maxTries, 2);
  }
}
