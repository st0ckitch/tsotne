import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import Cell from './Cell';
import Player from './Player';
import { generateBoard } from '../data/cells';

const CELL_SPACING = 2.2; // Adjusted for hexagonal grid

const GameBoard3D = () => {
  const [board] = useState(generateBoard());
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameLog, setGameLog] = useState([]);

  const addToLog = (message) => {
    setGameLog(prev => [message, ...prev.slice(0, 4)]);
  };

  const rollDice = () => {
    if (!isPlayerTurn) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    addToLog(`🎲 You rolled a ${roll}!`);
    
    const newPosition = Math.min(49, playerPosition + roll);
    setPlayerPosition(newPosition);
    
    handleCellEffect(board[newPosition]);
    setIsPlayerTurn(false);
    setTimeout(botTurn, 1500);
  };

  // Calculate hexagonal grid position
  const getHexPosition = (index) => {
    const row = Math.floor(index / 10);
    const col = index % 10;
    // Offset every other row for hexagonal pattern
    const xOffset = row % 2 ? CELL_SPACING / 2 : 0;
    
    return [
      col * CELL_SPACING + xOffset,
      0,
      row * CELL_SPACING * 0.866 // Height of hexagon = side length * √3/2
    ];
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Game UI */}
      <div className="absolute top-0 left-0 p-4 z-10 text-white">
        <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-600">
          <div className="text-xl mb-2">Player HP: {playerHealth}</div>
          <div className="text-xl mb-4">Bot HP: {botHealth}</div>
          <button
            onClick={rollDice}
            disabled={!isPlayerTurn}
            className={`px-6 py-3 rounded-lg font-bold transition-colors
              ${isPlayerTurn 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          >
            Roll Dice
          </button>
        </div>
      </div>

      {/* Game Log */}
      <div className="absolute bottom-0 left-0 p-4 z-10">
        <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-600 text-white">
          <h3 className="text-lg font-bold mb-2">Game Log</h3>
          {gameLog.map((log, i) => (
            <div key={i} className="text-sm mb-1">{log}</div>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas shadows>
        {/* Fixed isometric camera */}
        <PerspectiveCamera
          makeDefault
          position={[20, 20, 20]}
          fov={50}
          rotation={[-Math.PI / 4, Math.PI / 4, 0]}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Medieval atmosphere */}
        <fog attach="fog" args={['#2d3748', 30, 50]} />
        <Stars radius={100} depth={50} count={5000} factor={4} />
        
        {/* Dungeon floor */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1a202c" roughness={1} metalness={0} />
        </mesh>

        {/* Game board */}
        <group position={[-10, 0, -10]}>
          {board.map((cell, index) => {
            const [x, y, z] = getHexPosition(index);
            return (
              <Cell
                key={index}
                position={[x, y, z]}
                cellData={cell}
                isPlayerHere={playerPosition === index}
                isBotHere={botPosition === index}
              />
            );
          })}

          {/* Players */}
          <Player
            position={[
              ...getHexPosition(playerPosition)
            ]}
            color="blue"
          />
          
          <Player
            position={[
              ...getHexPosition(botPosition)
            ]}
            color="red"
          />
        </group>
      </Canvas>
    </div>
  );
};

export default GameBoard3D;
