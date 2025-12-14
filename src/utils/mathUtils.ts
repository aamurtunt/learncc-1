import * as THREE from 'three';
import { TextPoint } from '../three/types';

/**
 * Easing function: ease out cubic
 * Provides smooth deceleration
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Easing function: ease in out cubic
 * Smooth acceleration and deceleration
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation between two Vector3 points
 */
export function lerpVector3(
  a: THREE.Vector3,
  b: THREE.Vector3,
  t: number
): THREE.Vector3 {
  return new THREE.Vector3(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
    lerp(a.z, b.z, t)
  );
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Centers a set of points around the origin (0, 0, 0)
 */
export function centerPoints(points: TextPoint[]): TextPoint[] {
  if (points.length === 0) return points;

  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  }

  // Calculate center
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // Translate points to center
  return points.map(point => ({
    x: point.x - centerX,
    y: point.y - centerY,
    z: point.z - centerZ,
  }));
}

/**
 * Scales a set of points by a uniform factor
 */
export function scalePoints(points: TextPoint[], factor: number): TextPoint[] {
  return points.map(point => ({
    x: point.x * factor,
    y: point.y * factor,
    z: point.z * factor,
  }));
}

/**
 * Normalizes points to fit within a target width
 */
export function normalizePointsToWidth(
  points: TextPoint[],
  targetWidth: number
): TextPoint[] {
  if (points.length === 0) return points;

  // Find current width
  let minX = Infinity, maxX = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
  }

  const currentWidth = maxX - minX;
  if (currentWidth === 0) return points;

  const scaleFactor = targetWidth / currentWidth;
  return scalePoints(points, scaleFactor);
}

/**
 * Samples points uniformly along a curve
 */
export function samplePointsOnCurve(
  curve: THREE.Curve<THREE.Vector3>,
  count: number
): TextPoint[] {
  const points: TextPoint[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const point = curve.getPoint(t);
    points.push({ x: point.x, y: point.y, z: point.z });
  }

  return points;
}

/**
 * Generates random points within a sphere
 */
export function generateRandomPointsInSphere(
  count: number,
  radius: number
): TextPoint[] {
  const points: TextPoint[] = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = Math.random() * radius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    points.push({ x, y, z });
  }

  return points;
}

/**
 * Calculates the distance between two points
 */
export function distance(a: TextPoint, b: TextPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Maps a value from one range to another
 */
export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Generates a random number between min and max
 */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
