import { useRef } from 'react';
import * as THREE from 'three';
import { useThreeSetup } from './useThreeSetup';

// Light dusting of drifting points, no connecting lines. Used on secondary
// surfaces (auth pages) where a calmer backdrop is more appropriate than the
// denser constellation network in HeroScene.
export default function ParticleBackground({ density = 500, className = '' }) {
  const containerRef = useRef(null);
  const pointsRef = useRef(null);

  useThreeSetup(containerRef, {
    cameraZ: 5,
    setup: ({ scene }) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(density * 3);
      for (let i = 0; i < density; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        size: 0.032,
        color: new THREE.Color('#D3A24C'),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      pointsRef.current = points;
      scene.add(points);
    },
    onFrame: ({ elapsed, mouse }) => {
      const points = pointsRef.current;
      if (!points) return;
      points.rotation.y = elapsed * 0.02 + mouse.x * 0.08;
      points.rotation.x = mouse.y * 0.05;
    },
  });

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      aria-hidden="true"
    />
  );
}
