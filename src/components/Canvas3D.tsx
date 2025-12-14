import { useEffect, useState, useRef } from 'react';
import { useThreeScene } from '../hooks/useThreeScene';
import { useMediaPipeHands } from '../hooks/useMediaPipeHands';
import { useGestureRecognizer } from '../hooks/useGestureRecognizer';
import { useParticleSystem } from '../hooks/useParticleSystem';
import { GestureLabel } from './GestureLabel';
import { DebugPanel } from './DebugPanel';
import styles from '../styles/Canvas3D.module.css';

/**
 * Canvas3D Component
 *
 * Renders a full-viewport canvas element for Three.js scene with hand tracking and gesture recognition
 *
 * Features:
 * - Fills entire viewport
 * - Initializes Three.js scene via useThreeScene hook
 * - Integrates MediaPipe Hands for hand tracking
 * - Recognizes hand gestures and displays corresponding text
 * - Morphs particles to text shapes based on gestures
 * - Handles responsive resize automatically via SceneManager
 * - Shows 3000 cyan particles in idle state
 * - Hidden camera video element for MediaPipe processing
 * - Gesture label display in top-right corner
 * - Debug panel (toggle with 'D' key) for performance monitoring
 *
 * Usage:
 * <Canvas3D />
 *
 * Performance:
 * - Runs at 60 FPS with 3000 particles
 * - Uses requestAnimationFrame for smooth animation
 * - Pre-generates text geometries for smooth morphing
 * - Properly disposes resources on unmount
 * - Real-time FPS monitoring via PerformanceMonitor
 *
 * Accessibility:
 * - Camera feed is hidden by default
 * - Can be toggled in debug panel
 * - All processing happens in background
 * - Gesture label has ARIA live region for screen readers
 * - Debug panel accessible via keyboard ('D' key)
 */
export const Canvas3D: React.FC = () => {
  const { canvasRef, sceneManager, particleSystem, performanceMonitor } = useThreeScene();
  const { landmarks, isTracking, error, videoRef } = useMediaPipeHands();
  const { currentGesture, targetText } = useGestureRecognizer(landmarks);
  const { isReady, error: particleError } = useParticleSystem(sceneManager, particleSystem, targetText);

  // FPS state - updated every 500ms for performance
  const [fps, setFps] = useState<number>(0);
  const fpsUpdateIntervalRef = useRef<number | null>(null);

  // Get particle count (default to 3000 if not available yet)
  const particleCount = particleSystem?.getParticleCount() ?? 3000;

  // Update FPS every 500ms using setInterval
  useEffect(() => {
    // Clear any existing interval
    if (fpsUpdateIntervalRef.current !== null) {
      clearInterval(fpsUpdateIntervalRef.current);
    }

    // Set up new interval to update FPS
    fpsUpdateIntervalRef.current = window.setInterval(() => {
      const currentFps = performanceMonitor.getCurrentFPS();
      setFps(currentFps);
    }, 500);

    // Cleanup interval on unmount
    return () => {
      if (fpsUpdateIntervalRef.current !== null) {
        clearInterval(fpsUpdateIntervalRef.current);
        fpsUpdateIntervalRef.current = null;
      }
    };
  }, [performanceMonitor]);

  // Log landmarks to console for debugging
  useEffect(() => {
    if (landmarks) {
      console.log(`Hand detected: ${landmarks.length} landmarks`);
    }
  }, [landmarks]);

  // Log tracking status
  useEffect(() => {
    if (isTracking) {
      console.log('Hand tracking started');
    }
  }, [isTracking]);

  // Log particle system ready state
  useEffect(() => {
    if (isReady) {
      console.log('Particle system ready');
    }
  }, [isReady]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('Hand tracking error:', error.message);
    }
  }, [error]);

  // Log particle system errors
  useEffect(() => {
    if (particleError) {
      console.error('Particle system error:', particleError.message);
    }
  }, [particleError]);

  return (
    <>
      {/* Gesture label display - top-right corner */}
      <GestureLabel text={targetText} />

      {/* Debug panel - bottom-left corner (toggle with 'D' key) */}
      <DebugPanel
        fps={fps}
        particleCount={particleCount}
        currentGesture={currentGesture?.type ?? null}
        isTracking={isTracking}
        videoRef={videoRef}
        performanceRating={performanceMonitor.getPerformanceRating()}
      />

      {/* Three.js canvas for particle rendering */}
      <canvas ref={canvasRef} className={styles.canvas3d} />

      {/* Hidden video element for MediaPipe Hands - must be in DOM but not visible */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        aria-hidden="true"
      />
    </>
  );
};
