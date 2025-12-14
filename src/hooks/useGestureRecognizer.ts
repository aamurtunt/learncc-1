import { useState, useEffect, useMemo, useRef } from 'react';
import { GestureClassifier } from '../mediapipe/GestureClassifier';
import { RapidPulseBuffer } from '../mediapipe/RapidPulseBuffer';
import { type NormalizedLandmark } from '../mediapipe/types';
import { GestureState, GestureType, GESTURE_TEXT_MAP } from '../types/gestures';
import { CONFIDENCE_THRESHOLD } from '../utils/constants';

interface UseGestureRecognizerReturn {
  currentGesture: GestureState | null;
  targetText: string | null;
}

/**
 * useGestureRecognizer Hook
 *
 * Classifies hand landmarks into gestures and maps them to display text
 *
 * Features:
 * - Creates and memoizes GestureClassifier instance
 * - Processes landmarks on every update
 * - Filters by confidence threshold (> 0.8)
 * - Maps gesture type to target text via GESTURE_TEXT_MAP
 * - Logs gesture changes to console for debugging
 * - Returns null when no valid gesture detected
 *
 * @param landmarks - Array of 21 hand landmarks from MediaPipe or null
 * @returns Object containing currentGesture and targetText
 *
 * Usage:
 * const { currentGesture, targetText } = useGestureRecognizer(landmarks);
 */
export const useGestureRecognizer = (
  landmarks: NormalizedLandmark[] | null
): UseGestureRecognizerReturn => {
  const [currentGesture, setCurrentGesture] = useState<GestureState | null>(null);
  const [targetText, setTargetText] = useState<string | null>(null);

  // Memoize classifier instance to avoid recreating on every render
  const classifier = useMemo(() => new GestureClassifier(), []);

  // Memoize rapid pulse buffer instance
  const rapidPulseBuffer = useMemo(() => new RapidPulseBuffer(), []);

  // Store previous gesture type for change detection
  const prevGestureTypeRef = useRef<GestureType | null>(null);

  useEffect(() => {
    // No landmarks means no hand detected
    if (!landmarks || landmarks.length === 0) {
      if (currentGesture !== null) {
        setCurrentGesture(null);
        setTargetText(null);
        prevGestureTypeRef.current = null;
      }
      return;
    }

    // Classify the gesture
    const gesture = classifier.classify(landmarks);

    // Filter by confidence threshold
    if (gesture.confidence <= CONFIDENCE_THRESHOLD) {
      // Low confidence - treat as no gesture
      if (currentGesture !== null) {
        setCurrentGesture(null);
        setTargetText(null);
        prevGestureTypeRef.current = null;
      }
      return;
    }

    // Feed gesture to rapid pulse buffer
    rapidPulseBuffer.addGesture(gesture);

    // Check for rapid pulse detection
    const isRapidPulse = rapidPulseBuffer.detectRapidPulse();

    // Map gesture to target text
    let text = GESTURE_TEXT_MAP[gesture.type];

    // Override with special text if rapid pulse detected
    if (isRapidPulse) {
      text = 'SP School Of Computing';
      console.log('🚀 Rapid pulse detected! Triggering special animation...');
    }

    // Log gesture change to console
    if (gesture.type !== prevGestureTypeRef.current && !isRapidPulse) {
      const textLabel = text || 'None';
      console.log(
        `Gesture detected: ${gesture.type} -> ${textLabel} (confidence: ${gesture.confidence.toFixed(1)})`
      );
      prevGestureTypeRef.current = gesture.type;
    }

    // Update state
    setCurrentGesture(gesture);
    setTargetText(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmarks, classifier, rapidPulseBuffer]);

  return {
    currentGesture,
    targetText,
  };
};
