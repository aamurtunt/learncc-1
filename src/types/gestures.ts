/**
 * Gesture types detected by the system
 */
export enum GestureType {
  OPEN_PALM = 'OPEN_PALM',
  POINT = 'POINT',
  VICTORY = 'VICTORY',
  THREE_COUNT = 'THREE_COUNT',
  FIST = 'FIST',
  UNKNOWN = 'UNKNOWN',
}

/**
 * State of detected gesture
 */
export interface GestureState {
  type: GestureType;
  confidence: number;
  timestamp: number;
}

/**
 * Mapping of gesture types to display text
 */
export const GESTURE_TEXT_MAP: Record<GestureType, string | null> = {
  [GestureType.OPEN_PALM]: 'SoC',
  [GestureType.POINT]: 'Curiosity',
  [GestureType.VICTORY]: 'Ingenuity',
  [GestureType.THREE_COUNT]: 'Deterministic',
  [GestureType.FIST]: null, // Idle state
  [GestureType.UNKNOWN]: null,
};

/**
 * MediaPipe hand landmark indices
 */
export enum FingerLandmark {
  // Thumb
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,

  // Index finger
  INDEX_MCP = 5,
  INDEX_PIP = 6,
  INDEX_DIP = 7,
  INDEX_TIP = 8,

  // Middle finger
  MIDDLE_MCP = 9,
  MIDDLE_PIP = 10,
  MIDDLE_DIP = 11,
  MIDDLE_TIP = 12,

  // Ring finger
  RING_MCP = 13,
  RING_PIP = 14,
  RING_DIP = 15,
  RING_TIP = 16,

  // Pinky finger
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20,

  // Wrist
  WRIST = 0,
}
