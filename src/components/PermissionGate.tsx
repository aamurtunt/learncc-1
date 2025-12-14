import { useState, useEffect } from 'react';
import styles from '../styles/PermissionGate.module.css';

interface PermissionGateProps {
  children: React.ReactNode;
}

type PermissionState = 'checking' | 'prompt' | 'granted' | 'denied';

/**
 * PermissionGate Component
 *
 * Checks camera permissions before rendering children
 *
 * Features:
 * - Checks camera permissions on mount
 * - Shows prompt UI if permissions not granted
 * - Handles permission states: checking, prompt, granted, denied
 * - Clean, minimal design with cyan theme
 * - Renders children only when permissions granted
 *
 * Props:
 * - children: React components to render after permission granted
 *
 * Usage:
 * <PermissionGate>
 *   <Canvas3D />
 * </PermissionGate>
 *
 * Accessibility:
 * - Semantic HTML structure
 * - ARIA labels for button
 * - Keyboard navigation support
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ children }) => {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('denied');
        setErrorMessage('Camera API not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
      }

      // Try to query permission status (not supported in all browsers)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });

          if (permissionStatus.state === 'granted') {
            setPermissionState('granted');
            return;
          } else if (permissionStatus.state === 'denied') {
            setPermissionState('denied');
            setErrorMessage('Camera access denied. Please enable camera permissions in your browser settings.');
            return;
          }
        } catch (e) {
          // Permission query not supported, continue to prompt
          console.log('Permission query not supported, showing prompt');
        }
      }

      // If we can't determine permission state, show prompt
      setPermissionState('prompt');
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionState('prompt');
    }
  };

  const requestPermissions = async () => {
    setPermissionState('checking');
    setErrorMessage('');

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
        },
      });

      // Permission granted, stop the stream and update state
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
    } catch (error) {
      const err = error as Error;
      console.error('Camera permission error:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage('Camera access denied. Please click "Allow" when prompted, or enable camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('denied');
        setErrorMessage('No camera found. Please connect a camera to use this application.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionState('denied');
        setErrorMessage('Camera is already in use by another application. Please close other applications using the camera.');
      } else {
        setPermissionState('denied');
        setErrorMessage(`Failed to access camera: ${err.message}`);
      }
    }
  };

  if (permissionState === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Camera Access Required</h1>

        {permissionState === 'checking' && (
          <div className={styles.message}>
            <p>Checking camera permissions...</p>
            <div className={styles.spinner} aria-label="Loading"></div>
          </div>
        )}

        {permissionState === 'prompt' && (
          <>
            <p className={styles.description}>
              This application uses hand tracking to create interactive kinetic typography.
              Please grant camera access to continue.
            </p>
            <button
              className={styles.button}
              onClick={requestPermissions}
              aria-label="Enable camera access"
            >
              Enable Camera
            </button>
            <p className={styles.note}>
              Your camera feed is not recorded or transmitted. All processing happens locally in your browser.
            </p>
          </>
        )}

        {permissionState === 'denied' && (
          <>
            <p className={styles.error}>{errorMessage}</p>
            <button
              className={styles.button}
              onClick={requestPermissions}
              aria-label="Try again"
            >
              Try Again
            </button>
            <div className={styles.instructions}>
              <p className={styles.instructionsTitle}>Need help?</p>
              <ul className={styles.instructionsList}>
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Allow" or "Always allow" for camera access</li>
                <li>Refresh the page if needed</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
