import * as THREE from 'three';
import { Particle, TextPoint } from './types';
import {
  PARTICLE_COUNT,
  PARTICLE_SIZE,
  PARTICLE_IDLE_RADIUS,
  PARTICLE_DRIFT_SPEED,
  PARTICLE_MORPH_SPEED,
  PARTICLE_JITTER_AMOUNT,
} from '../utils/constants';

export class ParticleSystem {
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private isIdle: boolean = true;
  private isExploding: boolean = false;
  private explosionTime: number = 0;
  private readonly EXPLOSION_DURATION = 0.5; // seconds
  private isDispersing: boolean = false;
  private dispersionTime: number = 0;
  private readonly DISPERSION_DURATION = 0.3; // seconds - quick dispersion
  private isOrbiting: boolean = false;
  private orbitBounds: THREE.Box3 | null = null;
  private orbitTime: number = 0;

  constructor(particleCount: number = PARTICLE_COUNT) {
    // Initialize particles
    this.initializeParticles(particleCount);

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = this.particles[i].current.x;
      positions[i * 3 + 1] = this.particles[i].current.y;
      positions[i * 3 + 2] = this.particles[i].current.z;

      colors[i * 3] = this.particles[i].color.r;
      colors[i * 3 + 1] = this.particles[i].color.g;
      colors[i * 3 + 2] = this.particles[i].color.b;

      // Add size variation (0.8-1.2 scale)
      sizes[i] = 0.8 + Math.random() * 0.4;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create circular gradient texture for glow effect
    const texture = this.createGlowTexture();

    // Create material with additive blending for glow effect
    this.material = new THREE.PointsMaterial({
      size: PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create points mesh
    this.points = new THREE.Points(this.geometry, this.material);
  }

  /**
   * Creates a circular gradient texture for glowing particles
   * White center fading to transparent edges
   */
  private createGlowTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    // Create radial gradient (white center to transparent)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private initializeParticles(count: number): void {
    for (let i = 0; i < count; i++) {
      // Random position within a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = Math.random() * PARTICLE_IDLE_RADIUS;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      // Create completely random colors with cyberpunk palette
      // Mix of cyan, blue, purple, pink, and green tones
      const colorChoice = Math.random();
      let particleColor: THREE.Color;

      if (colorChoice < 0.3) {
        // Cyan variations (#00FFFF to #66FFFF)
        particleColor = new THREE.Color(
          Math.random() * 0.4,
          0.8 + Math.random() * 0.2,
          0.8 + Math.random() * 0.2
        );
      } else if (colorChoice < 0.5) {
        // Blue variations (#0080FF to #00BFFF)
        particleColor = new THREE.Color(
          Math.random() * 0.2,
          0.5 + Math.random() * 0.3,
          0.8 + Math.random() * 0.2
        );
      } else if (colorChoice < 0.7) {
        // Purple/Magenta variations (#FF00FF to #FF66FF)
        particleColor = new THREE.Color(
          0.6 + Math.random() * 0.4,
          Math.random() * 0.4,
          0.8 + Math.random() * 0.2
        );
      } else if (colorChoice < 0.85) {
        // Pink variations (#FF1493 to #FF69B4)
        particleColor = new THREE.Color(
          0.8 + Math.random() * 0.2,
          0.2 + Math.random() * 0.3,
          0.5 + Math.random() * 0.3
        );
      } else {
        // Green variations (#00FF80 to #00FFAA)
        particleColor = new THREE.Color(
          Math.random() * 0.3,
          0.8 + Math.random() * 0.2,
          0.5 + Math.random() * 0.3
        );
      }

      // Random speed multiplier (0.5 to 1.5)
      const speed = 0.5 + Math.random() * 1.0;

      // Random rotation axis for orbital motion (avoid purely vertical)
      const orbitAxis = new THREE.Vector3(
        Math.random() * 2 - 1,
        (Math.random() * 0.6 - 0.3), // Reduced Y component to avoid vertical lines
        Math.random() * 2 - 1
      ).normalize();

      const particle: Particle = {
        current: new THREE.Vector3(x, y, z),
        target: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        idleOffset: new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize(),
        color: particleColor,
        speed: speed,
        orbitAxis: orbitAxis,
      };

      this.particles.push(particle);
    }
  }

  public setTarget(points: TextPoint[]): void {
    this.isIdle = false;

    const targetCount = points.length;

    // Create shuffled indices for more even distribution
    const shuffledIndices: number[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      shuffledIndices.push(i);
    }

    // Fisher-Yates shuffle for random but even distribution
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    // Assign particles to points with even distribution
    for (let i = 0; i < this.particles.length; i++) {
      const particleIndex = shuffledIndices[i];
      const targetIndex = i % targetCount;
      const point = points[targetIndex];

      // Calculate which "layer" this particle is in (for stacking)
      const layer = Math.floor(i / targetCount);

      // Very small jitter based on layer - keeps particles tight
      const jitter = layer * 0.05;

      this.particles[particleIndex].target.set(
        point.x + (Math.random() - 0.5) * jitter,
        point.y + (Math.random() - 0.5) * jitter,
        point.z + (Math.random() - 0.5) * jitter
      );
    }
  }

  public setIdleState(): void {
    this.isIdle = true;
    this.isExploding = false;
    this.isDispersing = false;
    this.isOrbiting = false;
    this.orbitBounds = null;
    // Reset targets to random positions
    for (const particle of this.particles) {
      particle.target.copy(particle.current);
    }
  }

  /**
   * Triggers a quick dispersion animation
   * Particles spread out in random directions before returning to idle
   */
  public disperse(): void {
    this.isDispersing = true;
    this.isIdle = false;
    this.isExploding = false;
    this.dispersionTime = 0;

    // Give each particle a random outward velocity for quick dispersion
    for (const particle of this.particles) {
      // Random direction
      const randomDirection = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();

      // Apply dispersing velocity with particle-specific speed (faster than idle, slower than explosion)
      particle.velocity.copy(randomDirection.multiplyScalar(3.0 * particle.speed));
    }

    console.log('✨ Particles dispersing...');
  }

  /**
   * Triggers an explosion animation
   * Particles are pushed outward from center before morphing to target
   */
  public explode(): void {
    this.isExploding = true;
    this.isIdle = false;
    this.explosionTime = 0;

    // Set explosion velocities for all particles with particle-specific speed
    for (const particle of this.particles) {
      // Direction from center (origin) to particle
      const direction = particle.current.clone().normalize();

      // Apply outward velocity with particle-specific speed
      particle.velocity.copy(direction.multiplyScalar(5.0 * particle.speed));
    }

    console.log('💥 Particle explosion triggered!');
  }

  /**
   * Makes particles orbit around a bounding box
   * Creates swirling/flowing particle effects around 3D text
   */
  public orbitAroundBounds(bounds: THREE.Box3): void {
    this.isOrbiting = true;
    this.isIdle = false;
    this.isExploding = false;
    this.isDispersing = false;
    this.orbitBounds = bounds.clone();
    this.orbitTime = 0;

    // Expand bounds for particle orbit radius
    this.orbitBounds.expandByScalar(15);

    // Position particles around the expanded bounds
    const center = new THREE.Vector3();
    bounds.getCenter(center);

    // Use multiple distribution strategies to avoid any visible patterns
    const strategyCount = 3;
    const particlesPerStrategy = Math.floor(this.particles.length / strategyCount);

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const strategy = Math.floor(i / particlesPerStrategy) % strategyCount;

      let theta, phi, radius;

      if (strategy === 0) {
        // Fibonacci sphere distribution
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        theta = 2 * Math.PI * (i % particlesPerStrategy) / goldenRatio;
        phi = Math.acos(1 - 2 * ((i % particlesPerStrategy) + 0.5) / particlesPerStrategy);
      } else if (strategy === 1) {
        // Random uniform distribution
        theta = Math.random() * 2 * Math.PI;
        phi = Math.acos(2 * Math.random() - 1);
      } else {
        // Layered circular distribution
        const layer = (i % particlesPerStrategy) / particlesPerStrategy;
        theta = (Math.random() + i) * 2 * Math.PI * 0.618034; // Golden angle
        phi = Math.PI * layer;
      }

      // Add noise to all distributions
      theta += (Math.random() - 0.5) * 0.8;
      phi += (Math.random() - 0.5) * 0.8;

      // Vary the radius significantly for depth
      const baseRadius = 20;
      const radiusVariation = (Math.random() - 0.5) * 12;
      radius = baseRadius + radiusVariation;

      const x = center.x + radius * Math.sin(phi) * Math.cos(theta);
      const y = center.y + radius * Math.sin(phi) * Math.sin(theta);
      const z = center.z + radius * Math.cos(phi);

      particle.current.set(x, y, z);
      particle.target.set(x, y, z);

      // Set initial orbital velocity using particle's individual orbit axis
      const radialDir = particle.current.clone().sub(center).normalize();

      // Calculate tangent using particle's unique orbit axis
      let tangent = new THREE.Vector3()
        .crossVectors(radialDir, particle.orbitAxis)
        .normalize();

      // Fallback if cross product is degenerate
      if (tangent.length() < 0.01) {
        const altAxis = new THREE.Vector3(1, 0, 0);
        tangent = new THREE.Vector3()
          .crossVectors(radialDir, altAxis)
          .normalize();
      }

      // Add some randomness to initial velocity
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      tangent.add(randomOffset).normalize();

      particle.velocity.copy(tangent.multiplyScalar(0.6 * particle.speed));
    }

    console.log('🌀 Particles orbiting around text bounds');
  }

  public update(deltaTime: number): void {
    if (this.isExploding) {
      this.updateExplosion(deltaTime);
    } else if (this.isDispersing) {
      this.updateDispersion(deltaTime);
    } else if (this.isOrbiting) {
      this.updateOrbiting(deltaTime);
    } else if (this.isIdle) {
      this.updateIdleState(deltaTime);
    } else {
      this.interpolateToTarget(deltaTime);
    }

    // Update geometry
    const positions = this.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.particles.length; i++) {
      positions[i * 3] = this.particles[i].current.x;
      positions[i * 3 + 1] = this.particles[i].current.y;
      positions[i * 3 + 2] = this.particles[i].current.z;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  private updateIdleState(deltaTime: number): void {
    // deltaTime is available for future enhancements
    void deltaTime;

    for (const particle of this.particles) {
      // Apply drift based on idle offset with particle-specific speed
      const time = Date.now() * 0.001;
      const drift = particle.idleOffset.clone().multiplyScalar(
        Math.sin(time + particle.current.x) * PARTICLE_DRIFT_SPEED * particle.speed
      );
      particle.current.add(drift);

      // Keep particles within radius
      if (particle.current.length() > PARTICLE_IDLE_RADIUS) {
        particle.current.normalize().multiplyScalar(PARTICLE_IDLE_RADIUS);
      }
    }
  }

  private updateDispersion(deltaTime: number): void {
    this.dispersionTime += deltaTime;

    // Calculate decay factor (1.0 at start, 0.0 at end)
    const decayFactor = Math.max(0, 1 - this.dispersionTime / this.DISPERSION_DURATION);

    for (const particle of this.particles) {
      // Apply velocity with decay (particles slow down as they disperse)
      const velocityWithDecay = particle.velocity.clone().multiplyScalar(decayFactor * deltaTime * 60); // 60 for frame-rate independence
      particle.current.add(velocityWithDecay);
    }

    // End dispersion and transition to idle state
    if (this.dispersionTime >= this.DISPERSION_DURATION) {
      this.isDispersing = false;
      this.isIdle = true;
      console.log('Dispersion complete, returning to idle state');
    }
  }

  private updateOrbiting(deltaTime: number): void {
    if (!this.orbitBounds) return;

    this.orbitTime += deltaTime;

    const center = new THREE.Vector3();
    this.orbitBounds.getCenter(center);

    for (const particle of this.particles) {
      // Calculate direction to center
      const toCenter = center.clone().sub(particle.current);
      const distance = toCenter.length();

      // Use particle's individual orbit axis for varied motion
      const radialDir = particle.current.clone().sub(center);

      // Calculate tangent using particle's unique orbit axis
      let tangent = new THREE.Vector3()
        .crossVectors(radialDir, particle.orbitAxis)
        .normalize();

      // Fallback if cross product is degenerate (very rare now with varied axes)
      if (tangent.length() < 0.01) {
        // Use perpendicular to radial direction
        const altAxis = new THREE.Vector3(1, 0, 0);
        tangent = new THREE.Vector3()
          .crossVectors(radialDir, altAxis)
          .normalize();
      }

      // Add variation with sine wave based on time and particle position
      const wave = Math.sin(this.orbitTime * 2 + particle.current.x * 0.1 + particle.current.z * 0.1) * 0.3;

      // Combine orbital velocity with radial motion to maintain distance
      const orbitalSpeed = 2.0 * particle.speed;
      const targetDistance = 20;
      const radialSpeed = (distance > targetDistance ? -0.5 : 0.5) * particle.speed;

      // Set velocity
      particle.velocity.copy(tangent.multiplyScalar(orbitalSpeed));
      particle.velocity.add(toCenter.normalize().multiplyScalar(radialSpeed + wave));

      // Apply velocity
      particle.current.add(particle.velocity.clone().multiplyScalar(deltaTime * 60));

      // Add randomness to break any emerging patterns
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15
      );
      particle.current.add(jitter);
    }
  }

  private updateExplosion(deltaTime: number): void {
    this.explosionTime += deltaTime;

    // Calculate decay factor (1.0 at start, 0.0 at end)
    const decayFactor = Math.max(0, 1 - this.explosionTime / this.EXPLOSION_DURATION);

    for (const particle of this.particles) {
      // Apply velocity with decay
      const velocityWithDecay = particle.velocity.clone().multiplyScalar(decayFactor * deltaTime);
      particle.current.add(velocityWithDecay);
    }

    // End explosion after duration
    if (this.explosionTime >= this.EXPLOSION_DURATION) {
      this.isExploding = false;
      console.log('Explosion complete, now morphing to text...');
    }
  }

  private interpolateToTarget(deltaTime: number): void {
    // deltaTime is available for future enhancements
    void deltaTime;

    for (const particle of this.particles) {
      // Move toward target with particle-specific speed
      const direction = particle.target.clone().sub(particle.current);
      const distance = direction.length();

      if (distance > 0.1) {
        // Apply easing with particle-specific speed
        particle.current.add(direction.multiplyScalar(PARTICLE_MORPH_SPEED * particle.speed));
      } else {
        // Apply jitter when at target (also with speed variation)
        const jitter = new THREE.Vector3(
          (Math.random() - 0.5) * PARTICLE_JITTER_AMOUNT * particle.speed,
          (Math.random() - 0.5) * PARTICLE_JITTER_AMOUNT * particle.speed,
          (Math.random() - 0.5) * PARTICLE_JITTER_AMOUNT * particle.speed
        );
        particle.current.add(jitter);
      }
    }
  }

  public getPoints(): THREE.Points {
    return this.points;
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    if (this.material.map) {
      this.material.map.dispose();
    }
  }
}
