import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
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

  const addToLog = (message) => {
    setGameLog(prev => [message, ...prev.slice(0, 4)]);
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

  const botTurn = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    addToLog(`🤖 Bot rolled a ${roll}!`);
    
    const newPosition = Math.min(49, botPosition + roll);
    setBotPosition(newPosition);
    
    handleCellEffect(board[newPosition], true);
    setIsPlayerTurn(true);
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

  const getHexPosition = (index) => {
    const row = Math.floor(index / 10);
    const col = index % 10;
    return [
      col * CELL_SPACING + (row % 2 ? CELL_SPACING / 2 : 0),
      0,
      row * CELL_SPACING * 0.866
    ];
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#2d2d2d' }}>
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-stone-900 bg-opacity-90 p-4 rounded-lg">
          <div className="text-amber-200 text-xl">Player HP: {playerHealth}</div>
          <div className="text-amber-200 text-xl mb-4">Bot HP: {botHealth}</div>
          <button
            onClick={rollDice}
            disabled={!isPlayerTurn}
            className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded"
          >
            Roll Dice
          </button>
        </div>
      </div>

      {/* Game Log */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-stone-900 bg-opacity-90 p-4 rounded-lg">
          <h3 className="text-amber-200 text-lg font-bold mb-2">Game Log</h3>
          {gameLog.map((log, i) => (
            <div key={i} className="text-amber-100">{log}</div>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas style={{ background: '#2d2d2d' }}>
        <OrthographicCamera
          makeDefault
          position={[20, 20, 20]}
          zoom={40}
        />
        
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

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

          <Player
            position={[...getHexPosition(playerPosition)]}
            color="blue"
          />
          
          <Player
            position={[...getHexPosition(botPosition)]}
            color="red"
          />
        </group>
      </Canvas>
    </div>
  );
};

export default GameBoard3D;
