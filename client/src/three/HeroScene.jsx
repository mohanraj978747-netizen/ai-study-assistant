import { useRef } from 'react';
import * as THREE from 'three';
import { useThreeSetup } from './useThreeSetup';

// The signature visual: a network sphere of gold "star" nodes connected by
// fine indigo lines, like knowledge mapped onto a celestial chart. Every
// note, question and quiz becomes a point; the lines are the connections a
// tutor helps you build between them.
export default function HeroScene({ className = '' }) {
  const containerRef = useRef(null);
  const groupRef = useRef(null);

  useThreeSetup(containerRef, {
    cameraZ: 7.5,
    setup: ({ scene }) => {
      const group = new THREE.Group();

      const nodeCount = 70;
      const radius = 3;
      const nodePositions = [];
      const positions = new Float32Array(nodeCount * 3);

      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        nodePositions.push(new THREE.Vector3(x, y, z));
      }

      const nodeGeometry = new THREE.BufferGeometry();
      nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const nodeMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: new THREE.Color('#E8B95B'),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Points(nodeGeometry, nodeMaterial));

      const linePositions = [];
      const maxDist = 1.25;
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          if (nodePositions[i].distanceTo(nodePositions[j]) < maxDist) {
            linePositions.push(
              nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
              nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
            );
          }
        }
      }
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(linePositions), 3)
      );
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color('#6C63FF'),
        transparent: true,
        opacity: 0.22,
      });
      group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

      scene.add(group);
      groupRef.current = group;
    },
    onFrame: ({ elapsed, mouse }) => {
      const group = groupRef.current;
      if (!group) return;
      group.rotation.y = elapsed * 0.09 + mouse.x * 0.25;
      group.rotation.x = mouse.y * 0.12;
    },
  });

  return <div ref={containerRef} className={`h-full w-full ${className}`} aria-hidden="true" />;
}
