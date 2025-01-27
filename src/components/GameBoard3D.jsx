import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Cell from './Cell';
import Player from './Player';
import { generateBoard } from '../data/cells';

const CELL_SPACING = 2.2;

const GameBoard3D = () => {
  const [board] = useState(generateBoard());
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameLog, setGameLog] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const addToLog = (message) => {
    setGameLog(prev => [message, ...prev.slice(0, 4)]);
  };

  const handleCellEffect = (cell, isBot = false) => {
    const target = isBot ? setBotHealth : setPlayerHealth;
    
    if (cell.type === 'goblin') {
      const damage = Math.floor(Math.random() * 3) + 1;
      target(prev => Math.max(0, prev - damage));
      addToLog(`👺 Goblin attacks for ${damage} damage!`);
    } else if (cell.type === 'buff') {
      target(prev => Math.min(30, prev + cell.value));
      addToLog(`${cell.effect}: ${cell.description}`);
    } else if (cell.type === 'debuff') {
      target(prev => Math.max(0, prev + cell.value));
      addToLog(`${cell.effect}: ${cell.description}`);
    }

    checkHealth();
  };

  const checkHealth = () => {
    if (playerHealth <= 0) {
      setPlayerPosition(0);
      setPlayerHealth(10);
      addToLog('💀 Player died and respawned at start!');
    }
    if (botHealth <= 0) {
      setBotPosition(0);
      setBotHealth(10);
      addToLog('💀 Bot died and respawned at start!');
    }
  };

  const botTurn = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    addToLog(`🤖 Bot rolled a ${roll}!`);
    
    const newPosition = Math.min(49, botPosition + roll);
    setBotPosition(newPosition);
    
    if (newPosition >= 49) {
      setIsGameOver(true);
      addToLog('🤖 Bot wins the game!');
      return;
    }
    
    handleCellEffect(board[newPosition], true);
    setIsPlayerTurn(true);
  };

  const rollDice = () => {
    if (!isPlayerTurn || isGameOver) return;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    addToLog(`🎲 You rolled a ${roll}!`);
    
    const newPosition = Math.min(49, playerPosition + roll);
    setPlayerPosition(newPosition);
    
    if (newPosition >= 49) {
      setIsGameOver(true);
      addToLog('🏆 You win the game!');
      return;
    }
    
    handleCellEffect(board[newPosition]);
    setIsPlayerTurn(false);
    setTimeout(botTurn, 1500);
  };

  const resetGame = () => {
    setPlayerPosition(0);
    setBotPosition(0);
    setPlayerHealth(10);
    setBotHealth(10);
    setIsPlayerTurn(true);
    setIsGameOver(false);
    setGameLog([]);
  };

  // Calculate grid position for proper isometric layout
  const getHexPosition = (index) => {
    const row = Math.floor(index / 10);
    const col = index % 10;
    const xOffset = row % 2 ? CELL_SPACING / 2 : 0;
    
    return [
      col * CELL_SPACING + xOffset,
      0,
      row * CELL_SPACING * 0.866
    ];
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black">
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-stone-800 p-4 rounded-lg border-2 border-amber-900">
          <div className="text-xl mb-2 text-amber-200">Player HP: {playerHealth}</div>
          <div className="text-xl mb-4 text-amber-200">Bot HP: {botHealth}</div>
          <button
            onClick={rollDice}
            disabled={!isPlayerTurn || isGameOver}
            className={`px-6 py-3 rounded-lg font-bold border-2 mb-2 w-full
              ${isPlayerTurn && !isGameOver
                ? 'bg-amber-700 hover:bg-amber-600 text-amber-200 border-amber-600' 
                : 'bg-stone-700 text-stone-500 border-stone-600 cursor-not-allowed'}`}
          >
            Roll Dice
          </button>
          {isGameOver && (
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-lg font-bold border-2 w-full
                bg-emerald-700 hover:bg-emerald-600 text-emerald-200 border-emerald-600"
            >
              New Game
            </button>
          )}
        </div>
      </div>

      {/* Game Log */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-stone-800 p-4 rounded-lg border-2 border-amber-900">
          <h3 className="text-lg font-bold mb-2 text-amber-200">Game Log</h3>
          {gameLog.map((log, i) => (
            <div key={i} className="text-sm mb-1 text-amber-100">{log}</div>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas shadows>
        {/* Fixed top-down isometric camera */}
        <PerspectiveCamera
          makeDefault
          position={[15, 25, 15]}
          fov={50}
          rotation={[-Math.PI / 3, Math.PI / 4, 0]}
        />
        
        {/* Dungeon lighting */}
        <ambientLight intensity={0.3} />
        <pointLight
          position={[0, 10, 0]}
          intensity={0.5}
          distance={30}
          color="#ff994f"
        />
        <pointLight
          position={[20, 10, 20]}
          intensity={0.5}
          distance={30}
          color="#ff994f"
        />

        {/* Dungeon walls */}
        <mesh position={[0, 5, -2]} receiveShadow castShadow>
          <boxGeometry args={[50, 10, 1]} />
          <meshStandardMaterial color="#2c1810" roughness={1} />
        </mesh>
        <mesh position={[-2, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[50, 10, 1]} />
          <meshStandardMaterial color="#2c1810" roughness={1} />
        </mesh>

        {/* Dungeon floor */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a1209" roughness={1} metalness={0} />
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
            position={[...getHexPosition(playerPosition)]}
            color="#4f9cff"
          />
          
          <Player
            position={[...getHexPosition(botPosition)]}
            color="#ff4f4f"
          />
        </group>
      </Canvas>
    </div>
  );
};

export default GameBoard3D;
