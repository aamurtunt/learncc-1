import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { HandTrackerConfig } from './types';
import {
  MIN_DETECTION_CONFIDENCE,
  MIN_TRACKING_CONFIDENCE,
  MAX_NUM_HANDS,
} from '../utils/constants';

export class HandTracker {
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  // Stored for reference and cleanup in dispose()
  // @ts-expect-error - used for lifecycle management
  private videoElement: HTMLVideoElement | null = null;
  private config: HandTrackerConfig;

  constructor(config: HandTrackerConfig) {
    this.config = {
      ...config,
      minDetectionConfidence: config.minDetectionConfidence ?? MIN_DETECTION_CONFIDENCE,
      minTrackingConfidence: config.minTrackingConfidence ?? MIN_TRACKING_CONFIDENCE,
      maxNumHands: config.maxNumHands ?? MAX_NUM_HANDS,
    };
  }

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;

    try {
      // Initialize MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      this.hands.setOptions({
        maxNumHands: this.config.maxNumHands!,
        modelComplexity: 1,
        minDetectionConfidence: this.config.minDetectionConfidence!,
        minTrackingConfidence: this.config.minTrackingConfidence!,
      });

      this.hands.onResults((results: Results) => {
        this.config.onResults(results);
      });

      // Initialize camera
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.hands && videoElement) {
            await this.hands.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });
    } catch (error) {
      this.config.onError(error as Error);
    }
  }

  async start(): Promise<void> {
    if (!this.camera) {
      throw new Error('HandTracker not initialized. Call initialize() first.');
    }

    try {
      await this.camera.start();
    } catch (error) {
      this.config.onError(error as Error);
    }
  }

  stop(): void {
    if (this.camera) {
      this.camera.stop();
    }
  }

  dispose(): void {
    this.stop();
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
    this.camera = null;
    this.videoElement = null;
  }
}
