import { useRef, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  score: number;
}

class LowPassFilter {
  private y: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.y = value;
    } else {
      this.y = alpha * value + (1 - alpha) * this.y;
    }
    return this.y;
  }

  reset() {
    this.y = null;
  }
}

class OneEuroPointFilter {
  private xFilter = new LowPassFilter();
  private yFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private dyFilter = new LowPassFilter();
  
  private lastX: number | null = null;
  private lastY: number | null = null;
  private lastTime: number | null = null;

  constructor(
    private minCutoff: number = 1.0,
    private beta: number = 0.05,
    private dCutoff: number = 1.0
  ) {}

  private getAlpha(cutoff: number, dt: number): number {
    const r = 2 * Math.PI * cutoff * dt;
    return r / (r + 1);
  }

  filter(x: number, y: number, time: number): { x: number; y: number } {
    if (this.lastTime === null || this.lastX === null || this.lastY === null) {
      this.lastTime = time;
      this.lastX = x;
      this.lastY = y;
      this.xFilter.filter(x, 1);
      this.yFilter.filter(y, 1);
      return { x, y };
    }

    const dt = (time - this.lastTime) / 1000; // in seconds
    if (dt <= 0) return { x: this.lastX, y: this.lastY };

    // Calculate raw velocity
    const dx = (x - this.lastX) / dt;
    const dy = (y - this.lastY) / dt;

    // Filter velocity
    const alphaD = this.getAlpha(this.dCutoff, dt);
    const edx = this.dxFilter.filter(dx, alphaD);
    const edy = this.dyFilter.filter(dy, alphaD);

    // Compute cutoff frequency based on velocity
    const speed = Math.sqrt(edx * edx + edy * edy);
    const cutoffX = this.minCutoff + this.beta * speed;
    const cutoffY = this.minCutoff + this.beta * speed;

    // Filter signal
    const alphaX = this.getAlpha(cutoffX, dt);
    const alphaY = this.getAlpha(cutoffY, dt);

    const rx = this.xFilter.filter(x, alphaX);
    const ry = this.yFilter.filter(y, alphaY);

    this.lastTime = time;
    this.lastX = rx;
    this.lastY = ry;

    return { x: rx, y: ry };
  }

  reset() {
    this.xFilter.reset();
    this.yFilter.reset();
    this.dxFilter.reset();
    this.dyFilter.reset();
    this.lastX = null;
    this.lastY = null;
    this.lastTime = null;
  }
}

export const usePoseSmoother = () => {
  const filtersRef = useRef<Map<number, OneEuroPointFilter>>(new Map());

  const smoothPose = useCallback((keypoints: Point[]): Point[] => {
    const now = performance.now();
    
    return keypoints.map((kp, idx) => {
      // Only smooth if we have sufficient score
      if (kp.score < 0.2) {
        return kp;
      }

      if (!filtersRef.current.has(idx)) {
        // High smoothing for hips and shoulders (low minCutoff)
        // Responsive for wrists (higher minCutoff/beta)
        const isCoreJoint = idx === 5 || idx === 6 || idx === 11 || idx === 12;
        const minCut = isCoreJoint ? 0.35 : 0.8;
        const betaVal = isCoreJoint ? 0.01 : 0.1;
        filtersRef.current.set(idx, new OneEuroPointFilter(minCut, betaVal, 1.0));
      }

      const filter = filtersRef.current.get(idx)!;
      const smoothed = filter.filter(kp.x, kp.y, now);
      
      return {
        ...kp,
        x: smoothed.x,
        y: smoothed.y
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    filtersRef.current.clear();
  }, []);

  return { smoothPose, resetFilters };
};
