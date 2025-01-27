import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Cell from './Cell';

const GameBoard3D = () => {
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [gameLog, setGameLog] = useState([]);

  // Create the board array of 50 cells
  const board = Array(50).fill(null).map((_, index) => ({
    id: index,
    type: 'normal'
  }));

  // Add special cells (this would normally be in cells.js)
  const addSpecialCells = () => {
    // Add 2 buff cells
    board[5] = { id: 5, type: 'buff', effect: 'Healing Potion', value: 3 };
    board[15] = { id: 15, type: 'buff', effect: 'Shield', value: 5 };

    // Add 2 debuff cells
    board[10] = { id: 10, type: 'debuff', effect: 'Poison', value: -2 };
    board[20] = { id: 20, type: 'debuff', effect: 'Trap', value: -4 };

    // Add 7 goblin cells
    [7, 12, 18, 25, 32, 38, 45].forEach(pos => {
      board[pos] = { id: pos, type: 'goblin' };
    });
  };

  addSpecialCells();

  const rollDice = () => {
    if (!isPlayerTurn) return;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    const newPosition = Math.min(49, playerPosition + roll);
    setPlayerPosition(newPosition);
    setGameLog(prev => [`You rolled a ${roll}!`, ...prev.slice(0, 3)]);

    // Handle cell effects
    const currentCell = board[newPosition];
    if (currentCell.type === 'goblin') {
      const damage = Math.floor(Math.random() * 3) + 1;
      setPlayerHealth(prev => Math.max(0, prev - damage));
      setGameLog(prev => [`Goblin deals ${damage} damage!`, ...prev]);
    }

    setIsPlayerTurn(false);
    setTimeout(botTurn, 1000);
  };

  const botTurn = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const newPosition = Math.min(49, botPosition + roll);
    setBotPosition(newPosition);
    setGameLog(prev => [`Bot rolled a ${roll}!`, ...prev.slice(0, 3)]);

    // Handle cell effects
    const currentCell = board[newPosition];
    if (currentCell.type === 'goblin') {
      const damage = Math.floor(Math.random() * 3) + 1;
      setBotHealth(prev => Math.max(0, prev - damage));
      setGameLog(prev => [`Goblin deals ${damage} damage to bot!`, ...prev]);
    }

    setIsPlayerTurn(true);
  };

  return (
    <div className="w-screen h-screen bg-slate-800">
      {/* 2D UI Elements */}
      <div className="absolute top-4 left-4 text-white p-4 bg-slate-900 rounded-lg">
        <div>Player HP: {playerHealth}</div>
        <div>Bot HP: {botHealth}</div>
        <button 
          onClick={rollDice}
          disabled={!isPlayerTurn}
          className={`mt-2 px-4 py-2 rounded ${
            isPlayerTurn 
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-gray-600'
          }`}
        >
          Roll Dice
        </button>
      </div>

      <div className="absolute bottom-4 left-4 text-white p-4 bg-slate-900 rounded-lg">
        <div className="font-bold mb-2">Game Log:</div>
        {gameLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {/* 3D Game Board */}
      <Canvas camera={{ position: [0, 15, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        {/* Board cells */}
        {board.map((cell, index) => {
          const row = Math.floor(index / 7);
          const col = index % 7;
          return (
            <Cell
              key={index}
              position={[col * 2, 0, row * 2]}
              cell={cell}
              isPlayerHere={playerPosition === index}
              isBotHere={botPosition === index}
            />
          );
        })}

        {/* Simple ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, -0.5, 7]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default GameBoard3D;
