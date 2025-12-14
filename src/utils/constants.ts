// Project constants
export const PARTICLE_COUNT = 3000;
export const BACKGROUND_COLOR = 0x121212;
export const PARTICLE_COLOR = 0x00FFFF; // Cyan
export const CONFIDENCE_THRESHOLD = 0.8;

// Camera settings
export const CAMERA_FOV = 75;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_POSITION_Z = 100;

// Particle settings
export const PARTICLE_SIZE = 2.5;
export const PARTICLE_IDLE_RADIUS = 80;
export const PARTICLE_DRIFT_SPEED = 0.05;
export const PARTICLE_MORPH_SPEED = 0.08;
export const PARTICLE_JITTER_AMOUNT = 0.08;

// Text settings
export const TEXT_SCALE = 60;

// MediaPipe settings
export const MIN_DETECTION_CONFIDENCE = 0.8;
export const MIN_TRACKING_CONFIDENCE = 0.8;
export const MAX_NUM_HANDS = 1;

// Rapid pulse detection
export const RAPID_PULSE_WINDOW_MS = 1500;
export const RAPID_PULSE_MIN_CHANGES = 3;

// Performance settings
export const TARGET_FPS = 60;
export const MIN_FPS_THRESHOLD = 30;
export const FPS_SAMPLE_SIZE = 60;
