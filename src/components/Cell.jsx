import React from 'react';
import { Text } from '@react-three/drei';

const Cell = ({ position, cellData, isPlayerHere, isBotHere }) => {
  const getCellColor = () => {
    switch (cellData.type) {
      case 'buff':
        return '#4ade80';
      case 'debuff':
        return '#ef4444';
      case 'goblin':
        return '#eab308';
      default:
        return '#6b7280';
    }
  };

  return (
    <group position={position}>
      {/* Base hexagon */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.2, 6]} />
        <meshStandardMaterial color={getCellColor()} />
      </mesh>

      {/* Cell number */}
      <Text
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="white"
      >
        {cellData.id.toString()}
      </Text>

      {/* Effect indicator */}
      {cellData.type !== 'normal' && (
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color={getCellColor()} emissive={getCellColor()} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default Cell;
