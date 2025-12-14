/**
 * Browser compatibility checker
 * Verifies that required features are supported
 */

export interface BrowserSupport {
  webgl: boolean;
  camera: boolean;
  webWorkers: boolean;
  isSupported: boolean;
  unsupportedFeatures: string[];
}

/**
 * Checks if the browser supports all required features
 */
export function checkBrowserSupport(): BrowserSupport {
  const unsupportedFeatures: string[] = [];

  // Check WebGL support
  const webgl = checkWebGLSupport();
  if (!webgl) {
    unsupportedFeatures.push('WebGL');
  }

  // Check camera API support
  const camera = checkCameraSupport();
  if (!camera) {
    unsupportedFeatures.push('Camera API');
  }

  // Check Web Workers support (optional but recommended)
  const webWorkers = checkWebWorkersSupport();

  return {
    webgl,
    camera,
    webWorkers,
    isSupported: webgl && camera,
    unsupportedFeatures,
  };
}

/**
 * Checks if WebGL is supported
 */
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * Checks if Camera API (getUserMedia) is supported
 */
function checkCameraSupport(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Checks if Web Workers are supported
 */
function checkWebWorkersSupport(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Gets the browser name and version
 */
export function getBrowserInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  // Chrome
  if (ua.includes('Chrome')) {
    name = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
  // Firefox
  else if (ua.includes('Firefox')) {
    name = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) version = match[1];
  }
  // Safari
  else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    if (match) version = match[1];
  }
  // Edge
  else if (ua.includes('Edg')) {
    name = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    if (match) version = match[1];
  }

  return { name, version };
}

/**
 * Gets recommended browser message for unsupported browsers
 */
export function getRecommendedBrowserMessage(): string {
  const { name } = getBrowserInfo();

  if (name === 'Safari') {
    return 'For the best experience, please use Chrome, Firefox, or Edge.';
  }

  return 'Please use a modern browser (Chrome, Firefox, Edge, or Safari).';
}
