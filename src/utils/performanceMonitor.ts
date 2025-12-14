import { FPS_SAMPLE_SIZE } from './constants';

/**
 * Monitors and tracks application performance metrics
 */
export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private readonly sampleSize: number;
  private lastFrameTime: number = 0;

  constructor(sampleSize: number = FPS_SAMPLE_SIZE) {
    this.sampleSize = sampleSize;
    this.lastFrameTime = performance.now();
  }

  /**
   * Records a new frame time
   * Call this once per frame in the render loop
   */
  recordFrame(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Add to buffer
    this.frameTimes.push(deltaTime);

    // Keep only the last N samples
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }
  }

  /**
   * Gets the current FPS based on recent samples
   */
  getCurrentFPS(): number {
    if (this.frameTimes.length === 0) {
      return 0;
    }

    // Calculate average frame time
    const averageFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;

    // Convert to FPS (1000ms / average frame time in ms)
    return averageFrameTime > 0 ? Math.round(1000 / averageFrameTime) : 0;
  }

  /**
   * Gets the minimum FPS from recent samples
   */
  getMinFPS(): number {
    if (this.frameTimes.length === 0) {
      return 0;
    }

    // Find the longest frame time (worst case)
    const maxFrameTime = Math.max(...this.frameTimes);

    return maxFrameTime > 0 ? Math.round(1000 / maxFrameTime) : 0;
  }

  /**
   * Gets the maximum FPS from recent samples
   */
  getMaxFPS(): number {
    if (this.frameTimes.length === 0) {
      return 0;
    }

    // Find the shortest frame time (best case)
    const minFrameTime = Math.min(...this.frameTimes);

    return minFrameTime > 0 ? Math.round(1000 / minFrameTime) : 0;
  }

  /**
   * Checks if performance is below acceptable threshold
   */
  shouldReduceQuality(threshold: number = 30): boolean {
    const currentFPS = this.getCurrentFPS();
    return currentFPS > 0 && currentFPS < threshold;
  }

  /**
   * Gets performance quality rating
   */
  getPerformanceRating(): 'excellent' | 'good' | 'fair' | 'poor' {
    const fps = this.getCurrentFPS();

    if (fps >= 55) return 'excellent';
    if (fps >= 40) return 'good';
    if (fps >= 25) return 'fair';
    return 'poor';
  }

  /**
   * Resets all performance data
   */
  reset(): void {
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
  }
}
