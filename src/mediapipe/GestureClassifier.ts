import { type NormalizedLandmark } from '../mediapipe/types';
import { GestureType, GestureState, FingerLandmark } from '../types/gestures';

/**
 * Classifies hand gestures based on MediaPipe hand landmarks
 */
export class GestureClassifier {
  /**
   * Classifies a hand gesture from landmarks
   */
  public classify(landmarks: NormalizedLandmark[]): GestureState {
    if (!landmarks || landmarks.length !== 21) {
      return {
        type: GestureType.UNKNOWN,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    const extendedFingers = this.countExtendedFingers(landmarks);

    // Classify based on extended fingers
    let type: GestureType;
    let confidence: number;

    if (extendedFingers === 5) {
      // All fingers extended = Open Palm
      type = GestureType.OPEN_PALM;
      confidence = 1.0;
    } else if (extendedFingers === 1 && this.isOnlyIndexExtended(landmarks)) {
      // Only index finger extended = Point
      type = GestureType.POINT;
      confidence = 0.9;
    } else if (extendedFingers === 2 && this.isIndexAndMiddleExtended(landmarks)) {
      // Index and middle extended = Victory
      type = GestureType.VICTORY;
      confidence = 0.95;
    } else if (extendedFingers === 3 && this.isIndexMiddleRingExtended(landmarks)) {
      // Index, middle, and ring extended = Three-Count
      type = GestureType.THREE_COUNT;
      confidence = 0.9;
    } else if (extendedFingers <= 1 && !this.isOnlyIndexExtended(landmarks)) {
      // No fingers (or just thumb) extended = Fist
      type = GestureType.FIST;
      confidence = 0.95;
    } else {
      // Ambiguous gesture
      type = GestureType.UNKNOWN;
      confidence = 0.5;
    }

    return {
      type,
      confidence,
      timestamp: Date.now(),
    };
  }

  /**
   * Checks if a specific finger is extended
   */
  private isFingerExtended(
    landmarks: NormalizedLandmark[],
    tipIndex: number,
    pipIndex: number
  ): boolean {
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];

    // Finger is extended if TIP is above (lower y value) PIP
    // MediaPipe uses normalized coordinates where y increases downward
    return tip.y < pip.y;
  }

  /**
   * Checks if thumb is extended
   * Thumb uses different logic since it moves horizontally
   */
  private isThumbExtended(landmarks: NormalizedLandmark[]): boolean {
    const tip = landmarks[FingerLandmark.THUMB_TIP];
    const mcp = landmarks[FingerLandmark.THUMB_MCP];

    // Thumb is extended if tip is farther from palm than MCP
    const tipDistance = Math.abs(tip.x - landmarks[FingerLandmark.WRIST].x);
    const mcpDistance = Math.abs(mcp.x - landmarks[FingerLandmark.WRIST].x);

    return tipDistance > mcpDistance * 1.3;
  }

  /**
   * Counts the number of extended fingers (excluding thumb)
   */
  private countExtendedFingers(landmarks: NormalizedLandmark[]): number {
    let count = 0;

    // Check index finger
    if (this.isFingerExtended(landmarks, FingerLandmark.INDEX_TIP, FingerLandmark.INDEX_PIP)) {
      count++;
    }

    // Check middle finger
    if (this.isFingerExtended(landmarks, FingerLandmark.MIDDLE_TIP, FingerLandmark.MIDDLE_PIP)) {
      count++;
    }

    // Check ring finger
    if (this.isFingerExtended(landmarks, FingerLandmark.RING_TIP, FingerLandmark.RING_PIP)) {
      count++;
    }

    // Check pinky finger
    if (this.isFingerExtended(landmarks, FingerLandmark.PINKY_TIP, FingerLandmark.PINKY_PIP)) {
      count++;
    }

    // Check thumb (uses different logic)
    if (this.isThumbExtended(landmarks)) {
      count++;
    }

    return count;
  }

  /**
   * Checks if only index finger is extended
   */
  private isOnlyIndexExtended(landmarks: NormalizedLandmark[]): boolean {
    const indexExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.INDEX_TIP,
      FingerLandmark.INDEX_PIP
    );
    const middleExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.MIDDLE_TIP,
      FingerLandmark.MIDDLE_PIP
    );
    const ringExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.RING_TIP,
      FingerLandmark.RING_PIP
    );
    const pinkyExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.PINKY_TIP,
      FingerLandmark.PINKY_PIP
    );

    return indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
  }

  /**
   * Checks if index and middle fingers are extended
   */
  private isIndexAndMiddleExtended(landmarks: NormalizedLandmark[]): boolean {
    const indexExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.INDEX_TIP,
      FingerLandmark.INDEX_PIP
    );
    const middleExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.MIDDLE_TIP,
      FingerLandmark.MIDDLE_PIP
    );
    const ringExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.RING_TIP,
      FingerLandmark.RING_PIP
    );
    const pinkyExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.PINKY_TIP,
      FingerLandmark.PINKY_PIP
    );

    return indexExtended && middleExtended && !ringExtended && !pinkyExtended;
  }

  /**
   * Checks if index, middle, and ring fingers are extended
   */
  private isIndexMiddleRingExtended(landmarks: NormalizedLandmark[]): boolean {
    const indexExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.INDEX_TIP,
      FingerLandmark.INDEX_PIP
    );
    const middleExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.MIDDLE_TIP,
      FingerLandmark.MIDDLE_PIP
    );
    const ringExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.RING_TIP,
      FingerLandmark.RING_PIP
    );
    const pinkyExtended = this.isFingerExtended(
      landmarks,
      FingerLandmark.PINKY_TIP,
      FingerLandmark.PINKY_PIP
    );

    return indexExtended && middleExtended && ringExtended && !pinkyExtended;
  }
}
