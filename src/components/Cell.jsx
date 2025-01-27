import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const Cell = ({ position, cellData, isPlayerHere, isBotHere }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const timeRef = useRef(0);

  // Create pentagon shape
  const pentagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 5;
    const radius = 1;

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
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
        return '#4ade80';
      case 'debuff':
        return '#ef4444';
      case 'goblin':
        return '#eab308';
      default:
        return '#4b5563';
    }
  };

  // Animation
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    
    if (meshRef.current) {
      if (cellData.type !== 'normal') {
        meshRef.current.rotation.y += 0.01;
      }
      
      if (glowRef.current) {
        glowRef.current.scale.setScalar(
          1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        );
      }
    }
  });

  return (
    <group position={position}>
      {/* Base cell */}
      <mesh
        ref={meshRef}
        receiveShadow
        castShadow
      >
        <extrudeGeometry
          args={[
            pentagonShape,
            {
              depth: 0.2,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 3
            }
          ]}
        />
        <meshStandardMaterial
          color={getCellColor()}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Special effects for different cell types */}
      {cellData.type === 'buff' && (
        <group ref={glowRef}>
          <pointLight color="#4ade80" intensity={2} distance={2} />
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        </group>
      )}

      {cellData.type === 'debuff' && (
        <group ref={glowRef}>
          <pointLight color="#ef4444" intensity={2} distance={2} />
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {cellData.type === 'goblin' && (
        <group ref={glowRef}>
          <pointLight color="#eab308" intensity={2} distance={2} />
          <mesh 
            position={[0, 1, 0]} 
            rotation={[0, timeRef.current, 0]}
          >
            <tetrahedronGeometry args={[0.2]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </group>
      )}

      {/* Cell number */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.5}
        color="white"
      >
        {cellData.id.toString()}
      </Text>
    </group>
  );
};

export default Cell;
