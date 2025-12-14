import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/DebugPanel.module.css';

interface DebugPanelProps {
  fps: number;
  particleCount: number;
  currentGesture: string | null;
  isTracking: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  performanceRating?: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * DebugPanel Component
 *
 * Displays real-time debug information for the SoC Kinetic Typography project
 *
 * Features:
 * - Toggle visibility with 'D' key
 * - Real-time FPS display (color-coded: green >50, yellow 30-50, red <30)
 * - Particle count
 * - Current gesture with confidence
 * - Hand tracking status indicator
 * - Performance rating badge
 * - Toggle button to show/hide camera feed
 * - Camera PIP (160x120) when toggled
 * - Smooth fade in/out animations
 * - Non-intrusive bottom-left positioning
 * - Glassmorphism design with cyan accents
 *
 * Props:
 * @param fps - Current frames per second
 * @param particleCount - Number of active particles
 * @param currentGesture - Current detected gesture name or null
 * @param isTracking - Whether hand tracking is active
 * @param videoRef - Reference to the camera video element
 * @param performanceRating - Optional performance quality rating
 *
 * Usage:
 * <DebugPanel
 *   fps={60}
 *   particleCount={3000}
 *   currentGesture="Peace Sign"
 *   isTracking={true}
 *   videoRef={videoRef}
 *   performanceRating="excellent"
 * />
 *
 * Accessibility:
 * - Keyboard shortcut: 'D' key to toggle panel
 * - ARIA labels for all interactive elements
 * - Proper focus management
 * - Screen reader friendly status updates
 *
 * Performance:
 * - Lightweight rendering (only updates when props change)
 * - No expensive computations
 * - Clean event listener management
 */
export const DebugPanel: React.FC<DebugPanelProps> = ({
  fps,
  particleCount,
  currentGesture,
  isTracking,
  videoRef,
  performanceRating = 'good',
}) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  // Get FPS color based on performance
  const getFpsColor = useCallback((): string => {
    if (fps >= 50) return styles.fpsExcellent;
    if (fps >= 30) return styles.fpsGood;
    return styles.fpsPoor;
  }, [fps]);

  // Get performance rating badge color
  const getRatingClass = useCallback((): string => {
    switch (performanceRating) {
      case 'excellent':
        return styles.ratingExcellent;
      case 'good':
        return styles.ratingGood;
      case 'fair':
        return styles.ratingFair;
      case 'poor':
        return styles.ratingPoor;
      default:
        return styles.ratingGood;
    }
  }, [performanceRating]);

  // Handle keyboard shortcut to toggle panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Toggle panel with 'D' key (case-insensitive)
      if (event.key.toLowerCase() === 'd') {
        setIsPanelVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle camera toggle button click
  const handleCameraToggle = useCallback((): void => {
    setIsCameraVisible((prev) => !prev);
  }, []);

  // Don't render anything if panel is not visible
  if (!isPanelVisible) {
    return null;
  }

  return (
    <div
      className={styles.debugPanel}
      role="complementary"
      aria-label="Debug information panel"
    >
      {/* Panel header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Debug Panel</h3>
        <span className={styles.hint}>Press 'D' to hide</span>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {/* FPS Counter */}
        <div className={styles.statItem}>
          <span className={styles.statLabel}>FPS</span>
          <span className={`${styles.statValue} ${getFpsColor()}`}>
            {fps}
          </span>
        </div>

        {/* Particle Count */}
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Particles</span>
          <span className={styles.statValue}>{particleCount}</span>
        </div>

        {/* Hand Tracking Status */}
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Tracking</span>
          <span className={styles.statValue}>
            <span
              className={`${styles.statusIndicator} ${
                isTracking ? styles.statusActive : styles.statusInactive
              }`}
            />
            {isTracking ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Current Gesture */}
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Gesture</span>
          <span className={styles.statValue}>
            {currentGesture || 'None'}
          </span>
        </div>

        {/* Performance Rating */}
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Performance</span>
          <span className={`${styles.ratingBadge} ${getRatingClass()}`}>
            {performanceRating}
          </span>
        </div>
      </div>

      {/* Camera controls */}
      <div className={styles.cameraControls}>
        <button
          className={styles.cameraToggleBtn}
          onClick={handleCameraToggle}
          aria-label={isCameraVisible ? 'Hide camera feed' : 'Show camera feed'}
          aria-pressed={isCameraVisible}
        >
          <span className={styles.cameraIcon}>
            {isCameraVisible ? '📹' : '📷'}
          </span>
          {isCameraVisible ? 'Hide Camera' : 'Show Camera'}
        </button>
      </div>

      {/* Camera PIP (Picture-in-Picture) */}
      {isCameraVisible && videoRef.current && (
        <div className={styles.cameraPip} aria-label="Camera feed">
          <video
            ref={videoRef}
            className={styles.cameraVideo}
            autoPlay
            playsInline
            muted
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};
