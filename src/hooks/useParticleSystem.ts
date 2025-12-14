import { useEffect, useState, useRef } from 'react';
import { ParticleSystem } from '../three/ParticleSystem';
import { TextGeometryGenerator } from '../three/TextGeometryGenerator';
import { TextMesh } from '../three/TextMesh';
import { SceneManager } from '../three/SceneManager';
import { PARTICLE_COUNT } from '../utils/constants';

interface UseParticleSystemReturn {
  isReady: boolean;
  error: Error | null;
}

// Pre-defined texts to generate
const TEXTS_TO_GENERATE = [
  'SoC',
  'Curiosity',
  'Ingenuity',
  'Deterministic',
  'SP School Of Computing',
];

/**
 * useParticleSystem Hook
 *
 * Manages particle morphing based on gesture changes
 *
 * Features:
 * - Loads Helvetiker font on mount
 * - Pre-generates all text geometries for smooth performance
 * - Morphs particles to target text when gesture changes
 * - Special handling for "Curiosity": displays 3D text with orbital particles
 * - Returns to idle state when no gesture detected
 * - Proper error handling and logging
 * - Cleans up resources on unmount
 *
 * @param sceneManager - SceneManager instance from useThreeScene
 * @param particleSystem - ParticleSystem instance from useThreeScene
 * @param targetText - Target text from gesture recognizer (null = idle)
 * @returns Object containing isReady state and error
 *
 * Usage:
 * const { isReady, error } = useParticleSystem(sceneManager, particleSystem, targetText);
 */
export const useParticleSystem = (
  sceneManager: SceneManager | null,
  particleSystem: ParticleSystem | null,
  targetText: string | null
): UseParticleSystemReturn => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to store generator instance
  const generatorRef = useRef<TextGeometryGenerator | null>(null);

  // Use ref to store text mesh instance
  const textMeshRef = useRef<TextMesh | null>(null);

  // Track previous target text to detect changes
  const prevTargetTextRef = useRef<string | null>(null);

  // Initialize font and pre-generate texts on mount
  useEffect(() => {
    const initializeGenerator = async () => {
      try {
        console.log('Initializing TextGeometryGenerator...');

        // Create generator instance
        const generator = new TextGeometryGenerator();
        generatorRef.current = generator;

        // Load font
        console.log('Loading Helvetiker font...');
        await generator.loadFont('/fonts/helvetiker_regular.typeface.json');
        console.log('Font loaded successfully');

        // Pre-generate all texts
        console.log('Pre-generating text geometries...');
        await generator.preGenerateTexts(TEXTS_TO_GENERATE, PARTICLE_COUNT);
        console.log(
          `Pre-generated ${TEXTS_TO_GENERATE.length} text geometries: ${TEXTS_TO_GENERATE.join(', ')}`
        );

        // Mark as ready
        setIsReady(true);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error during initialization');
        console.error('Failed to initialize particle system:', error.message);
        setError(error);
        setIsReady(false);
      }
    };

    initializeGenerator();

    // Cleanup
    return () => {
      if (generatorRef.current) {
        generatorRef.current.clearCache();
        generatorRef.current = null;
      }
      if (textMeshRef.current) {
        // Remove from scene if it was added
        if (sceneManager && textMeshRef.current.getMesh()) {
          sceneManager.scene.remove(textMeshRef.current.getMesh()!);
        }
        textMeshRef.current.dispose();
        textMeshRef.current = null;
      }
    };
  }, []); // Only run on mount

  // Handle target text changes
  useEffect(() => {
    // Don't process if not ready or no particle system
    if (!isReady || !particleSystem || !generatorRef.current || !sceneManager) {
      return;
    }

    // Check if target text changed
    if (targetText === prevTargetTextRef.current) {
      return;
    }

    // Update previous target
    prevTargetTextRef.current = targetText;

    try {
      // If target is null, cleanup and disperse particles
      if (targetText === null) {
        console.log('No gesture detected, dispersing particles');

        // Remove 3D text if it exists
        if (textMeshRef.current && textMeshRef.current.getMesh()) {
          sceneManager.scene.remove(textMeshRef.current.getMesh()!);
          textMeshRef.current.setVisible(false);
        }

        particleSystem.disperse();
        return;
      }

      // Validate text is in our pre-generated list
      if (!TEXTS_TO_GENERATE.includes(targetText)) {
        console.warn(`Target text "${targetText}" not in pre-generated list, skipping morph`);
        return;
      }

      // Display 3D text with orbital particles for all gestures
      console.log(`Displaying 3D text "${targetText}" with orbital particle effects`);

      // Remove old text mesh if it exists
      if (textMeshRef.current && textMeshRef.current.getMesh()) {
        const oldMesh = textMeshRef.current.getMesh();
        if (oldMesh) {
          sceneManager.scene.remove(oldMesh);
          console.log('Removed old text mesh from scene');
        }
      }

      // Create text mesh if it doesn't exist, otherwise reuse
      if (!textMeshRef.current) {
        textMeshRef.current = new TextMesh();
      }

      // Create the 3D text
      const font = generatorRef.current['font']; // Access private font property
      if (!font) {
        throw new Error('Font not loaded');
      }

      const mesh = textMeshRef.current.createText(targetText, font);

      // Add new mesh to scene
      sceneManager.scene.add(mesh);
      console.log(`Added new text mesh "${targetText}" to scene`);

      // Special handling for "SP School Of Computing" - trigger explosion first
      if (targetText === 'SP School Of Computing') {
        console.log('💥 Triggering explosion for special text');
        particleSystem.explode();

        // Wait for explosion to settle before orbiting
        setTimeout(() => {
          const bounds = textMeshRef.current?.getBoundingBox();
          if (bounds && particleSystem) {
            particleSystem.orbitAroundBounds(bounds);
          }
        }, 500);
      } else {
        // Get bounding box and make particles orbit around it
        const bounds = textMeshRef.current.getBoundingBox();
        if (bounds) {
          particleSystem.orbitAroundBounds(bounds);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during morphing');
      console.error('Failed to morph particles:', error.message);
      setError(error);
    }
  }, [targetText, isReady, particleSystem, sceneManager]);

  return {
    isReady,
    error,
  };
};
