import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const Cell = ({ position, cellData, isPlayerHere, isBotHere }) => {
  const meshRef = useRef();
  const glowRef = useRef();

  // Create hexagon shape
  const hexagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 1;

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    return shape;
  }, []);

  // Cell color based on type
  const getCellColor = () => {
    switch (cellData.type) {
      case 'buff':
        return '#2d503d';  // Dark green
      case 'debuff':
        return '#502d2d';  // Dark red
      case 'goblin':
        return '#504d2d';  // Dark yellow
      default:
        return '#2d2d2d';  // Dark gray
    }
  };

  // Animation
  useFrame((state) => {
    if (glowRef.current && cellData.type !== 'normal') {
      glowRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Base hexagonal tile */}
      <mesh
        ref={meshRef}
        receiveShadow
        castShadow
      >
        <extrudeGeometry
          args={[
            hexagonShape,
            {
              depth: 0.1,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 4
            }
          ]}
        />
        <meshStandardMaterial
          color={getCellColor()}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Cell effects */}
      {cellData.type !== 'normal' && (
        <group ref={glowRef}>
          <pointLight
            color={getCellColor()}
            intensity={0.5}
            distance={2}
            position={[0, 0.3, 0]}
          />
          {cellData.type === 'buff' && (
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 6]} />
              <meshStandardMaterial color="#4ade80" transparent opacity={0.6} />
            </mesh>
          )}
          {cellData.type === 'debuff' && (
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 3]} />
              <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
            </mesh>
          )}
          {cellData.type === 'goblin' && (
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 4]} />
              <meshStandardMaterial color="#eab308" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      )}

      {/* Cell number */}
      <Text
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {cellData.id.toString()}
      </Text>
    </group>
  );
};

export default Cell;
