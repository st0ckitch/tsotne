import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sparkles } from '@react-three/drei';
import Cell from './Cell';
import Player from './Player';
import { generateBoard } from '../data/cells';

const CELL_SPACING = 3;
const CELLS_PER_ROW = 10;

const GameBoard3D = () => {
  const [board] = useState(generateBoard());
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameLog, setGameLog] = useState([]);
  const controlsRef = useRef();

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

  const botTurn = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    addToLog(`🤖 Bot rolled a ${roll}!`);
    
    const newPosition = Math.min(49, botPosition + roll);
    setBotPosition(newPosition);
    
    handleCellEffect(board[newPosition], true);
    setIsPlayerTurn(true);
  };

  const handleCellEffect = (cell, isBot = false) => {
    const target = isBot ? setBotHealth : setPlayerHealth;
    
    if (cell.type === 'goblin') {
      const damage = Math.floor(Math.random() * 3) + 1;
      target(prev => Math.max(0, prev - damage));
      addToLog(`👺 Goblin attacks for ${damage} damage!`);
    } else if (cell.type === 'buff' || cell.type === 'debuff') {
      target(prev => Math.max(0, prev + cell.value));
      addToLog(`${cell.effect}: ${cell.description}`);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Game UI */}
      <div className="absolute top-0 left-0 p-4 z-10 text-white">
        <div className="bg-black bg-opacity-50 p-4 rounded">
          <div>Player HP: {playerHealth}</div>
          <div>Bot HP: {botHealth}</div>
          <button
            onClick={rollDice}
            disabled={!isPlayerTurn}
            className={`mt-4 px-4 py-2 rounded ${
              isPlayerTurn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500'
            }`}
          >
            Roll Dice
          </button>
        </div>
      </div>

      {/* Game Log */}
      <div className="absolute bottom-0 left-0 p-4 z-10">
        <div className="bg-black bg-opacity-50 p-4 rounded text-white">
          {gameLog.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 20, 20]} />
        <OrbitControls
          ref={controlsRef}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={50}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <Sparkles count={100} scale={50} size={2} speed={0.5} />
        
        {/* Dungeon Path */}
        <group position={[-CELLS_PER_ROW * CELL_SPACING / 2, 0, 0]}>
          {board.map((cell, index) => {
            const row = Math.floor(index / CELLS_PER_ROW);
            const col = index % CELLS_PER_ROW;
            const x = col * CELL_SPACING;
            const z = row * CELL_SPACING;
            
            return (
              <Cell
                key={index}
                position={[x, 0, z]}
                cellData={cell}
                isPlayerHere={playerPosition === index}
                isBotHere={botPosition === index}
              />
            );
          })}

          {/* Players */}
          <Player
            position={[
              (playerPosition % CELLS_PER_ROW) * CELL_SPACING,
              1,
              Math.floor(playerPosition / CELLS_PER_ROW) * CELL_SPACING
            ]}
            color="blue"
          />
          
          <Player
            position={[
              (botPosition % CELLS_PER_ROW) * CELL_SPACING,
              1,
              Math.floor(botPosition / CELLS_PER_ROW) * CELL_SPACING
            ]}
            color="red"
          />
        </group>

        {/* Ground */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default GameBoard3D;
