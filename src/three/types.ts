import * as THREE from 'three';

export interface SceneConfig {
  backgroundColor: number;
  cameraPosition: { x: number; y: number; z: number };
  particleCount: number;
}

export interface TextPoint {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  current: THREE.Vector3;
  target: THREE.Vector3;
  velocity: THREE.Vector3;
  idleOffset: THREE.Vector3;
  color: THREE.Color;
  speed: number; // Random speed multiplier for this particle
  orbitAxis: THREE.Vector3; // Random rotation axis for orbital motion
}
