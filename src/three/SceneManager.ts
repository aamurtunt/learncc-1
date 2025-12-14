import * as THREE from 'three';
import { SceneConfig } from './types';
import {
  BACKGROUND_COLOR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
  CAMERA_POSITION_Z
} from '../utils/constants';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, config?: Partial<SceneConfig>) {
    this.canvas = canvas;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config?.backgroundColor ?? BACKGROUND_COLOR);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      CAMERA_NEAR,
      CAMERA_FAR
    );

    const cameraPos = config?.cameraPosition ?? { x: 0, y: 0, z: CAMERA_POSITION_Z };
    this.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add lighting for 3D text
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add directional light from front-top
    const directionalLight1 = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight1.position.set(50, 50, 100);
    directionalLight1.castShadow = true;
    this.scene.add(directionalLight1);

    // Add directional light from back for rim lighting
    const directionalLight2 = new THREE.DirectionalLight(0xff00ff, 0.4);
    directionalLight2.position.set(-50, -30, -50);
    this.scene.add(directionalLight2);

    // Add point light for extra glow
    const pointLight = new THREE.PointLight(0x00ffff, 1, 200);
    pointLight.position.set(0, 0, 50);
    this.scene.add(pointLight);

    // Setup resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    this.scene.clear();
  }
}
