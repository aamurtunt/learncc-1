import { NormalizedLandmark, Results } from '@mediapipe/hands';

export interface HandTrackerConfig {
  onResults: (results: Results) => void;
  onError: (error: Error) => void;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  maxNumHands?: number;
}

export interface HandLandmarks {
  landmarks: NormalizedLandmark[];
  handedness: string;
}

export { type NormalizedLandmark, type Results } from '@mediapipe/hands';
