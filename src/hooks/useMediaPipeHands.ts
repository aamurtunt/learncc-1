import { useState, useEffect, useRef, useCallback } from 'react';
import { HandTracker } from '../mediapipe/HandTracker';
import { NormalizedLandmark, Results } from '../mediapipe/types';

interface UseMediaPipeHandsReturn {
  landmarks: NormalizedLandmark[] | null;
  isTracking: boolean;
  error: Error | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

/**
 * useMediaPipeHands Hook
 *
 * Manages MediaPipe Hands lifecycle and camera input for hand tracking
 *
 * Features:
 * - Creates hidden video element for camera input
 * - Initializes HandTracker with MediaPipe Hands
 * - Requests camera permissions via getUserMedia
 * - Stores latest hand landmarks in state
 * - Handles errors gracefully (permissions, no camera, load failures)
 * - Properly cleans up resources on unmount
 *
 * Returns:
 * - landmarks: Array of 21 hand landmarks or null
 * - isTracking: Boolean indicating if tracking is active
 * - error: Error object if something went wrong
 * - videoRef: Ref to hidden video element (must be rendered in DOM)
 *
 * Usage:
 * const { landmarks, isTracking, error, videoRef } = useMediaPipeHands();
 * return <video ref={videoRef} style={{ display: 'none' }} />;
 */
export const useMediaPipeHands = (): UseMediaPipeHandsReturn => {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const handTrackerRef = useRef<HandTracker | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Handle MediaPipe results callback
  const handleResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Get first hand's landmarks (we only track one hand)
      setLandmarks(results.multiHandLandmarks[0]);
    } else {
      // No hands detected
      setLandmarks(null);
    }
  }, []);

  // Handle errors callback
  const handleError = useCallback((err: Error) => {
    console.error('MediaPipe Hands error:', err);
    setError(err);
    setIsTracking(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    let mediaStream: MediaStream | null = null;

    const initializeTracking = async () => {
      if (!videoRef.current || isInitializedRef.current) {
        return;
      }

      try {
        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
        });

        if (!mounted) {
          // Component unmounted during async operation
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        mediaStream = stream;
        videoRef.current.srcObject = stream;

        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().then(() => resolve()).catch(reject);
            }
          };

          videoRef.current.onerror = () => {
            reject(new Error('Failed to load video stream'));
          };
        });

        if (!mounted || !videoRef.current) {
          return;
        }

        // Initialize HandTracker
        const tracker = new HandTracker({
          onResults: handleResults,
          onError: handleError,
        });

        handTrackerRef.current = tracker;

        // Initialize and start tracking
        await tracker.initialize(videoRef.current);

        if (!mounted) {
          // Component unmounted during initialization
          tracker.dispose();
          return;
        }

        await tracker.start();

        if (mounted) {
          setIsTracking(true);
          isInitializedRef.current = true;
        }
      } catch (err) {
        if (!mounted) return;

        const error = err as Error;
        console.error('Failed to initialize hand tracking:', error);

        // Provide user-friendly error messages
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError(new Error('Camera permission denied. Please allow camera access to use hand tracking.'));
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setError(new Error('No camera found. Please connect a camera to use hand tracking.'));
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setError(new Error('Camera is already in use by another application.'));
        } else {
          setError(new Error(`Failed to initialize hand tracking: ${error.message}`));
        }

        setIsTracking(false);
      }
    };

    initializeTracking();

    // Cleanup function
    return () => {
      mounted = false;

      // Stop media stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      // Dispose hand tracker
      if (handTrackerRef.current) {
        handTrackerRef.current.dispose();
        handTrackerRef.current = null;
      }

      // Reset state
      setIsTracking(false);
      setLandmarks(null);
      isInitializedRef.current = false;
    };
  }, [handleResults, handleError]);

  return {
    landmarks,
    isTracking,
    error,
    videoRef,
  };
};
