import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { TextPoint } from './types';
import { centerPoints, normalizePointsToWidth } from '../utils/mathUtils';
import { TEXT_SCALE } from '../utils/constants';

/**
 * Generates 3D point clouds from text strings
 */
export class TextGeometryGenerator {
  private font: Font | null = null;
  private fontLoader: FontLoader;
  private pointsCache: Map<string, TextPoint[]> = new Map();

  constructor() {
    this.fontLoader = new FontLoader();
  }

  /**
   * Loads the font file
   */
  async loadFont(path: string = '/fonts/helvetiker_regular.typeface.json'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fontLoader.load(
        path,
        (font) => {
          this.font = font;
          resolve();
        },
        undefined,
        (error) => {
          reject(new Error(`Failed to load font: ${error}`));
        }
      );
    });
  }

  /**
   * Generates points from text string
   */
  generatePoints(text: string, pointCount: number): TextPoint[] {
    // Check cache first
    const cacheKey = `${text}-${pointCount}`;
    if (this.pointsCache.has(cacheKey)) {
      return this.pointsCache.get(cacheKey)!;
    }

    if (!this.font) {
      throw new Error('Font not loaded. Call loadFont() first.');
    }

    let points: TextPoint[];

    // For multi-character text, generate each letter separately and space them out
    if (text.length > 1) {
      points = this.generateSpacedText(text, pointCount);
    } else {
      // Single character - use original method
      const textGeometry = new TextGeometry(text, {
        font: this.font,
        size: 10,
        height: 1,
        curveSegments: 48, // Increased from 12 for more detailed curves
        bevelEnabled: false,
      });

      textGeometry.computeBoundingBox();

      // Sample points from geometry
      points = this.sampleGeometry(textGeometry, pointCount);

      // Center points around origin
      points = centerPoints(points);

      // Normalize to target width
      points = normalizePointsToWidth(points, TEXT_SCALE);

      // Dispose of geometry
      textGeometry.dispose();
    }

    // Cache the result
    this.pointsCache.set(cacheKey, points);

    return points;
  }

  /**
   * Generates text with proper letter spacing for clarity
   */
  private generateSpacedText(text: string, pointCount: number): TextPoint[] {
    if (!this.font) {
      throw new Error('Font not loaded');
    }

    const allPoints: TextPoint[] = [];
    const letterGeometries: { geometry: TextGeometry; width: number }[] = [];

    // Generate geometry for each letter
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Handle spaces
      if (char === ' ') {
        letterGeometries.push({ geometry: null as any, width: 5 }); // Space width
        continue;
      }

      const geometry = new TextGeometry(char, {
        font: this.font,
        size: 10,
        height: 1,
        curveSegments: 48,
        bevelEnabled: false,
      });

      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      const width = bbox.max.x - bbox.min.x;

      letterGeometries.push({ geometry, width });
    }

    // Calculate total width with spacing
    const letterSpacing = 2.5; // Space between letters
    let totalWidth = 0;
    for (const item of letterGeometries) {
      totalWidth += item.width + letterSpacing;
    }
    totalWidth -= letterSpacing; // Remove trailing space

    // Calculate points per letter based on vertex count
    const pointsPerLetter: number[] = [];
    let totalVertices = 0;

    for (const item of letterGeometries) {
      if (item.geometry) {
        totalVertices += item.geometry.attributes.position.count;
      }
    }

    // Distribute points proportionally based on vertex density
    let remainingPoints = pointCount;
    for (let i = 0; i < letterGeometries.length; i++) {
      const item = letterGeometries[i];
      if (!item.geometry) {
        pointsPerLetter.push(0);
        continue;
      }

      const vertexCount = item.geometry.attributes.position.count;
      const ratio = vertexCount / totalVertices;
      const points = i === letterGeometries.length - 1
        ? remainingPoints // Last letter gets remaining points
        : Math.max(1, Math.floor(pointCount * ratio));

      pointsPerLetter.push(points);
      remainingPoints -= points;
    }

    // Generate and position points for each letter
    let xOffset = -totalWidth / 2; // Start from left

    for (let i = 0; i < letterGeometries.length; i++) {
      const item = letterGeometries[i];

      if (!item.geometry) {
        xOffset += item.width + letterSpacing;
        continue;
      }

      const letterPoints = this.sampleGeometry(item.geometry, pointsPerLetter[i]);

      // Offset points for this letter
      for (const point of letterPoints) {
        allPoints.push({
          x: point.x + xOffset,
          y: point.y,
          z: point.z,
        });
      }

      xOffset += item.width + letterSpacing;

      // Clean up
      item.geometry.dispose();
    }

    // Center the combined text
    let centeredPoints = centerPoints(allPoints);

    // Scale to target width
    centeredPoints = normalizePointsToWidth(centeredPoints, TEXT_SCALE);

    return centeredPoints;
  }

  /**
   * Samples points uniformly from geometry
   */
  private sampleGeometry(geometry: TextGeometry, count: number): TextPoint[] {
    const points: TextPoint[] = [];

    // Get position attribute
    const position = geometry.attributes.position;

    if (!position) {
      throw new Error('Geometry has no position attribute');
    }

    const vertexCount = position.count;

    if (vertexCount === 0) {
      throw new Error('Geometry has no vertices');
    }

    // Always use step-based sampling for even distribution
    const step = vertexCount / count;

    for (let i = 0; i < count; i++) {
      const index = Math.floor((i * step) % vertexCount);
      points.push({
        x: position.getX(index),
        y: position.getY(index),
        z: position.getZ(index),
      });
    }

    // If we need more points, interpolate between adjacent vertices
    const neededPoints = count - points.length;
    if (neededPoints > 0) {
      for (let i = 0; i < neededPoints; i++) {
        const t = i / neededPoints;
        const baseIndex = Math.floor(t * vertexCount);
        const nextIndex = (baseIndex + 1) % vertexCount;
        const localT = (t * vertexCount) - baseIndex;

        const x1 = position.getX(baseIndex);
        const y1 = position.getY(baseIndex);
        const z1 = position.getZ(baseIndex);

        const x2 = position.getX(nextIndex);
        const y2 = position.getY(nextIndex);
        const z2 = position.getZ(nextIndex);

        points.push({
          x: x1 + (x2 - x1) * localT,
          y: y1 + (y2 - y1) * localT,
          z: z1 + (z2 - z1) * localT,
        });
      }
    }

    return points;
  }

  /**
   * Pre-generates and caches all text strings
   */
  async preGenerateTexts(texts: string[], pointCount: number): Promise<void> {
    if (!this.font) {
      throw new Error('Font not loaded. Call loadFont() first.');
    }

    for (const text of texts) {
      this.generatePoints(text, pointCount);
    }
  }

  /**
   * Clears the points cache
   */
  clearCache(): void {
    this.pointsCache.clear();
  }

  /**
   * Checks if font is loaded
   */
  isLoaded(): boolean {
    return this.font !== null;
  }
}
