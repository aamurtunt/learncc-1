import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../three/SceneManager';
import { ParticleSystem } from '../three/ParticleSystem';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface UseThreeSceneReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  sceneManager: SceneManager | null;
  particleSystem: ParticleSystem | null;
  performanceMonitor: PerformanceMonitor;
}

/**
 * Custom hook to initialize and manage Three.js scene
 *
 * Usage:
 * const { canvasRef, sceneManager, particleSystem, performanceMonitor } = useThreeScene();
 * <canvas ref={canvasRef} />
 *
 * Features:
 * - Initializes Three.js scene on mount
 * - Creates SceneManager and ParticleSystem
 * - Starts requestAnimationFrame render loop (independent of React renders)
 * - Monitors performance with PerformanceMonitor
 * - Properly cleans up resources on unmount
 */
export const useThreeScene = (): UseThreeSceneReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
  const [particleSystem, setParticleSystem] = useState<ParticleSystem | null>(null);

  // Memoize performance monitor to maintain consistent instance across renders
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

  // Use refs to store managers for cleanup without triggering re-renders
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Three.js scene
    const manager = new SceneManager(canvas);
    const particles = new ParticleSystem();

    // Add particle system to scene
    manager.scene.add(particles.getPoints());

    // Store in state for external access
    setSceneManager(manager);
    setParticleSystem(particles);

    // Store in refs for cleanup
    sceneManagerRef.current = manager;
    particleSystemRef.current = particles;

    // Start the render loop
    const clock = clockRef.current;
    clock.start();

    const animate = (): void => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Record frame for performance monitoring
      performanceMonitor.recordFrame();

      // Get delta time for smooth animations (independent of frame rate)
      const deltaTime = clock.getDelta();

      // Update particle system
      particles.update(deltaTime);

      // Render the scene
      manager.renderer.render(manager.scene, manager.camera);
    };

    animate();

    // Cleanup function
    return () => {
      // Stop the animation loop
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      // Dispose of Three.js resources
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
        particleSystemRef.current = null;
      }

      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }

      // Stop the clock
      clock.stop();
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return {
    canvasRef,
    sceneManager,
    particleSystem,
    performanceMonitor,
  };
};
