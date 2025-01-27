import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const Cell = ({ position, cellData, isPlayerHere, isBotHere }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const timeRef = useRef(0);

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

  // Cell materials based on type
  const materials = useMemo(() => {
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: getCellColor(),
      metalness: 0.3,
      roughness: 0.7,
      // Add stone texture effect
      bumpScale: 0.5,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#2d3748',
      metalness: 0.5,
      roughness: 0.8,
    });

    return [baseMaterial, edgeMaterial];
  }, [cellData.type]);

  // Cell color based on type
  function getCellColor() {
    switch (cellData.type) {
      case 'buff':
        return '#2d803d';
      case 'debuff':
        return '#8b2c2c';
      case 'goblin':
        return '#975a16';
      default:
        return '#4a5568';
    }
  }

  // Animation
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    
    if (glowRef.current) {
      if (cellData.type !== 'normal') {
        glowRef.current.position.y = Math.sin(timeRef.current * 2) * 0.1 + 0.5;
      }
    }
  });

  const effectHeight = 0.5;

  return (
    <group position={position}>
      {/* Base hexagonal cell */}
      <mesh
        ref={meshRef}
        receiveShadow
        castShadow
      >
        <extrudeGeometry
          args={[
            hexagonShape,
            {
              depth: 0.3,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 4
            }
          ]}
        />
        <meshStandardMaterial
          color={getCellColor()}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Special effects */}
      {cellData.type === 'buff' && (
        <group ref={glowRef} position={[0, effectHeight, 0]}>
          <pointLight color="#4ade80" intensity={1.5} distance={2} />
          <mesh>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {cellData.type === 'debuff' && (
        <group ref={glowRef} position={[0, effectHeight, 0]}>
          <pointLight color="#ef4444" intensity={1.5} distance={2} />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <tetrahedronGeometry args={[0.3]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {cellData.type === 'goblin' && (
        <group ref={glowRef} position={[0, effectHeight, 0]}>
          <pointLight color="#eab308" intensity={1.5} distance={2} />
          <mesh rotation={[0, timeRef.current, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.4, 6]} />
            <meshBasicMaterial color="#eab308" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Cell number */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {cellData.id.toString()}
      </Text>
    </group>
  );
};

export default Cell;
