/**
 * 1-Euro Filter for Real-Time Human Motion & Landmark Tracking
 * Reference: Casiez, G., Roussel, N. and Vogel, D. (2012)
 * "1 € Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Human-Computer Interaction"
 * CHI '12 Proceedings of the SIGCHI Conference on Human Factors in Computing Systems
 */

class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  constructor(private alpha: number = 0.5) {}

  public filter(value: number, alpha: number): number {
    this.alpha = alpha;
    if (this.y === null) {
      this.s = value;
      this.y = value;
    } else {
      this.s = alpha * value + (1.0 - alpha) * (this.s as number);
      this.y = this.s;
    }
    return this.y;
  }

  public hasLast(): boolean {
    return this.y !== null;
  }

  public last(): number {
    return this.y || 0;
  }

  public reset(): void {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number | null = null;

  constructor(
    private minCutoff: number = 1.0, // Minimum cutoff frequency in Hz (handles jitter when still)
    private beta: number = 0.007,    // Speed coefficient (handles lag when moving fast)
    private dCutoff: number = 1.0    // Cutoff frequency for derivative
  ) {
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private alpha(rate: number, cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  public filter(value: number, timestamp: number = performance.now()): number {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      return this.xFilter.filter(value, 1.0);
    }

    const dt = (timestamp - this.lastTime) / 1000.0; // Seconds
    this.lastTime = timestamp;

    if (dt <= 0) {
      return this.xFilter.last();
    }

    const rate = 1.0 / dt;

    // Estimate derivative (velocity)
    const prevValue = this.xFilter.hasLast() ? this.xFilter.last() : value;
    const dx = (value - prevValue) * rate;
    const edx = this.dxFilter.filter(dx, this.alpha(rate, this.dCutoff));

    // Dynamic adaptive cutoff frequency
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.xFilter.filter(value, this.alpha(rate, cutoff));
  }

  public reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

/**
 * 2D 1-Euro Filter for (X, Y) Coordinates
 */
export class OneEuroFilter2D {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor(minCutoff = 1.2, beta = 0.008, dCutoff = 1.0) {
    this.filterX = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.filterY = new OneEuroFilter(minCutoff, beta, dCutoff);
  }

  public filter(x: number, y: number, timestamp: number = performance.now()): { x: number; y: number } {
    return {
      x: this.filterX.filter(x, timestamp),
      y: this.filterY.filter(y, timestamp),
    };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}
