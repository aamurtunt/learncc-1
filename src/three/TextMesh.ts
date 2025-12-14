import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/**
 * TextMesh - Renders 3D text with materials and effects
 */
export class TextMesh {
  private mesh: THREE.Mesh | null = null;
  private geometry: TextGeometry | null = null;
  private material: THREE.MeshStandardMaterial;
  private boundingBox: THREE.Box3 | null = null;

  constructor() {
    // Create glowing cyberpunk material
    this.material = new THREE.MeshStandardMaterial({
      color: 0x00ffff, // Cyan
      emissive: 0x0088ff, // Blue glow
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
  }

  /**
   * Creates 3D text mesh from string
   */
  public createText(text: string, font: Font): THREE.Mesh {
    // Clean up existing geometry
    if (this.geometry) {
      this.geometry.dispose();
    }

    // Create text geometry
    this.geometry = new TextGeometry(text, {
      font: font,
      size: 10,
      height: 2, // 3D depth
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 0.3,
      bevelSegments: 5,
    });

    // Center the geometry
    this.geometry.computeBoundingBox();
    const bbox = this.geometry.boundingBox!;
    const centerX = (bbox.max.x - bbox.min.x) / 2 + bbox.min.x;
    const centerY = (bbox.max.y - bbox.min.y) / 2 + bbox.min.y;
    const centerZ = (bbox.max.z - bbox.min.z) / 2 + bbox.min.z;
    this.geometry.translate(-centerX, -centerY, -centerZ);

    // Recompute bounding box after centering
    this.geometry.computeBoundingBox();
    this.boundingBox = this.geometry.boundingBox!;

    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    return this.mesh;
  }

  /**
   * Updates text material color
   */
  public setColor(color: THREE.Color): void {
    this.material.color.copy(color);
  }

  /**
   * Gets the bounding box of the text
   */
  public getBoundingBox(): THREE.Box3 | null {
    return this.boundingBox;
  }

  /**
   * Gets the mesh
   */
  public getMesh(): THREE.Mesh | null {
    return this.mesh;
  }

  /**
   * Sets visibility
   */
  public setVisible(visible: boolean): void {
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  /**
   * Disposes of resources
   */
  public dispose(): void {
    if (this.geometry) {
      this.geometry.dispose();
    }
    this.material.dispose();
  }
}
