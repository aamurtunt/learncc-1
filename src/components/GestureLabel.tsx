import { useState, useEffect } from 'react';
import styles from '../styles/GestureLabel.module.css';

interface GestureLabelProps {
  text: string | null;
}

/**
 * GestureLabel Component
 *
 * Displays the current gesture text in the top-right corner of the viewport
 *
 * Features:
 * - Fixed positioning in top-right corner
 * - Fade in/out animations (0.3s ease) when text changes
 * - Cyan color (#00FFFF) with glow effect
 * - Only renders when text is not null
 * - Semi-transparent dark background for readability
 * - Smooth transitions between different text values
 * - Responsive design for mobile devices
 * - Above canvas (z-index: 1000)
 *
 * Props:
 * @param text - The gesture text to display (e.g., "SoC", "Curiosity"), or null to hide
 *
 * Usage:
 * <GestureLabel text={targetText} />
 *
 * Accessibility:
 * - Non-interactive (pointer-events: none)
 * - Respects prefers-reduced-motion
 * - High contrast cyan text on dark background
 */
export const GestureLabel: React.FC<GestureLabelProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (text !== null && text !== displayText) {
      // New text incoming
      if (displayText !== null) {
        // Fade out current text first
        setAnimationClass(styles.fadeOut);
        setTimeout(() => {
          setDisplayText(text);
          setAnimationClass(styles.fadeIn);
          setIsVisible(true);
        }, 300); // Wait for fade out to complete
      } else {
        // First time showing text
        setDisplayText(text);
        setAnimationClass(styles.fadeIn);
        setIsVisible(true);
      }
    } else if (text === null && displayText !== null) {
      // Fade out and hide
      setAnimationClass(styles.fadeOut);
      setTimeout(() => {
        setDisplayText(null);
        setIsVisible(false);
      }, 300); // Wait for fade out to complete
    }
  }, [text, displayText]);

  // Don't render if no text
  if (!isVisible && !displayText) {
    return null;
  }

  return (
    <div
      className={`${styles.gestureLabel} ${animationClass}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {displayText}
    </div>
  );
};
