import React from 'react';

const Cell = ({ position, cell, isPlayerHere, isBotHere }) => {
  const getCellColor = () => {
    switch (cell.type) {
      case 'buff':
        return '#68D391';  // green
      case 'debuff':
        return '#F56565';  // red
      case 'goblin':
        return '#F6AD55';  // orange
      default:
        return '#4A5568';  // gray
    }
  };

  return (
    <group position={position}>
      {/* Base cell */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.8, 0.2, 1.8]} />
        <meshStandardMaterial color={getCellColor()} />
      </mesh>

      {/* Player marker */}
      {isPlayerHere && (
        <mesh position={[0.5, 0.3, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#4299E1" />
        </mesh>
      )}

      {/* Bot marker */}
      {isBotHere && (
        <mesh position={[-0.5, 0.3, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#F56565" />
        </mesh>
      )}

      {/* Cell number */}
      <mesh position={[0, 0, 0]}>
        <textGeometry args={[cell.id.toString(), { size: 0.5, height: 0.1 }]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Effect indicator for special cells */}
      {cell.type !== 'normal' && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={getCellColor()} emissive={getCellColor()} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default Cell;
