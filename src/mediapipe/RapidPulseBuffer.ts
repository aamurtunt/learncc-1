import { GestureType, GestureState } from '../types/gestures';
import { RAPID_PULSE_WINDOW_MS, RAPID_PULSE_MIN_CHANGES } from '../utils/constants';

/**
 * Represents a state change event
 */
interface StateChangeEvent {
  fromType: GestureType;
  toType: GestureType;
  timestamp: number;
}

/**
 * Detects rapid pulse gesture (fast open/close hand)
 * Maintains a temporal buffer of state changes
 */
export class RapidPulseBuffer {
  private buffer: StateChangeEvent[] = [];
  private lastGesture: GestureType | null = null;
  private readonly windowMs: number;
  private readonly minChanges: number;

  constructor(
    windowMs: number = RAPID_PULSE_WINDOW_MS,
    minChanges: number = RAPID_PULSE_MIN_CHANGES
  ) {
    this.windowMs = windowMs;
    this.minChanges = minChanges;
  }

  /**
   * Adds a gesture to the buffer and checks for state changes
   */
  addGesture(gesture: GestureState): void {
    const currentType = gesture.type;

    // Check if gesture type has changed
    if (this.lastGesture !== null && this.lastGesture !== currentType) {
      // Record the state change
      this.buffer.push({
        fromType: this.lastGesture,
        toType: currentType,
        timestamp: gesture.timestamp,
      });

      // Clean old events
      this.cleanOldEvents(gesture.timestamp);
    }

    this.lastGesture = currentType;
  }

  /**
   * Detects if a rapid pulse has occurred
   * A rapid pulse is defined as alternating between OPEN_PALM and FIST
   * at least 3 times within the time window
   */
  detectRapidPulse(): boolean {
    if (this.buffer.length < this.minChanges) {
      return false;
    }

    // Count alternations between OPEN_PALM and FIST
    let alternationCount = 0;
    let lastRelevantType: GestureType | null = null;

    for (const event of this.buffer) {
      // Check if this is a transition involving OPEN_PALM or FIST
      const isRelevantFrom =
        event.fromType === GestureType.OPEN_PALM || event.fromType === GestureType.FIST;
      const isRelevantTo =
        event.toType === GestureType.OPEN_PALM || event.toType === GestureType.FIST;

      if (isRelevantFrom && isRelevantTo) {
        // Check if this is an alternation from the last relevant type
        if (lastRelevantType === null || lastRelevantType !== event.toType) {
          alternationCount++;
          lastRelevantType = event.toType;
        }
      }
    }

    // Rapid pulse detected if we have enough alternations
    if (alternationCount >= this.minChanges) {
      // Clear buffer after detection to prevent repeated triggers
      this.reset();
      return true;
    }

    return false;
  }

  /**
   * Removes events older than the time window
   */
  private cleanOldEvents(currentTimestamp: number): void {
    const cutoffTime = currentTimestamp - this.windowMs;
    this.buffer = this.buffer.filter((event) => event.timestamp >= cutoffTime);
  }

  /**
   * Resets the buffer
   */
  reset(): void {
    this.buffer = [];
    this.lastGesture = null;
  }

  /**
   * Gets the current buffer size (for debugging)
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Gets recent events (for debugging)
   */
  getRecentEvents(): StateChangeEvent[] {
    return [...this.buffer];
  }
}
