import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Player = ({ position, color }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Player body */}
      <mesh
        ref={meshRef}
        castShadow
      >
        <capsuleGeometry args={[0.3, 0.5, 2, 8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Player glow */}
      <pointLight
        color={color}
        intensity={2}
        distance={3}
        position={[0, 1, 0]}
      />
    </group>
  );
};

export default Player;
