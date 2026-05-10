'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Subtle Three.js particle field that sits behind the hero headline.
 * 1500 points arranged in a wide horizontal slab, slowly drifting and
 * subtly tracking the cursor on the XY plane. Designed to feel like
 * an EKG-meets-stardust backdrop — present but never noisy.
 *
 * Loaded behind a `dynamic(() => ..., { ssr: false })` boundary on the
 * home page so SSR isn't taxed by Three.js init.
 */

function PointField() {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport, pointer } = useThree();

  // Generate positions ONCE — useMemo so they survive re-renders.
  const positions = useMemo(() => {
    const N = 1500;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // Wide slab biased to the upper half of the viewport
      arr[i * 3 + 0] = (Math.random() - 0.5) * 16;        // x
      arr[i * 3 + 1] = (Math.random() - 0.4) * 8;         // y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;         // z
    }
    return arr;
  }, []);

  useFrame((state) => {
    const p = pointsRef.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    // Slow autonomous drift + tiny cursor parallax
    p.rotation.y = t * 0.04 + pointer.x * 0.15;
    p.rotation.x = pointer.y * -0.1;
    // Pulse opacity slightly for life
    const mat = p.material as THREE.PointsMaterial;
    mat.opacity = 0.55 + Math.sin(t * 0.6) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color={new THREE.Color('#4F46E5')}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Constellation() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.6]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <PointField />
    </Canvas>
  );
}
