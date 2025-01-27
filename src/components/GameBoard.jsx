import React, { useState, useEffect } from 'react';
import { generateBoard } from '../data/cells';

const GameBoard = () => {
  const [board, setBoard] = useState([]);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [diceRoll, setDiceRoll] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameLog, setGameLog] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    setBoard(generateBoard());
  }, []);

  const addToLog = (message) => {
    setGameLog(prev => [message, ...prev.slice(0, 4)]);
  };

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const handleGoblinAttack = () => {
    const damage = Math.floor(Math.random() * 3) + 1;
    if (isPlayerTurn) {
      setPlayerHealth(prev => prev - damage);
      addToLog(`🔪 Goblin attacks you for ${damage} damage!`);
    } else {
      setBotHealth(prev => prev - damage);
      addToLog(`🔪 Goblin attacks bot for ${damage} damage!`);
    }
  };

  const handleCellEffect = (cell) => {
    if (cell.type === 'goblin') {
      handleGoblinAttack();
    } else if (cell.type === 'buff' || cell.type === 'debuff') {
      const target = isPlayerTurn ? setPlayerHealth : setBotHealth;
      target(prev => prev + cell.value);
      addToLog(`${cell.effect}: ${cell.description}`);
    }
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

  const handlePlayerMove = () => {
    if (!isPlayerTurn || isGameOver) return;

    const roll = rollDice();
    setDiceRoll(roll);
    addToLog(`🎲 You rolled a ${roll}!`);

    const newPosition = Math.min(49, playerPosition + roll);
    setPlayerPosition(newPosition);

    if (newPosition === 49) {
      setIsGameOver(true);
      addToLog('🏆 You won the game!');
      return;
    }

    handleCellEffect(board[newPosition]);
    checkHealth();
    setIsPlayerTurn(false);
    setTimeout(botTurn, 1000);
  };

  const botTurn = () => {
    const roll = rollDice();
    addToLog(`🎲 Bot rolled a ${roll}!`);

    const newPosition = Math.min(49, botPosition + roll);
    setBotPosition(newPosition);

    if (newPosition === 49) {
      setIsGameOver(true);
      addToLog('🤖 Bot won the game!');
      return;
    }

    handleCellEffect(board[newPosition]);
    checkHealth();
    setIsPlayerTurn(true);
  };

  const resetGame = () => {
    setBoard(generateBoard());
    setPlayerPosition(0);
    setBotPosition(0);
    setPlayerHealth(10);
    setBotHealth(10);
    setDiceRoll(null);
    setIsPlayerTurn(true);
    setIsGameOver(false);
    setGameLog([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 text-white">
      {/* Game Status */}
      <div className="mb-8 flex justify-between items-center">
        <div className="text-xl">
          <div>Player: HP {playerHealth} | Position {playerPosition}</div>
          <div>Bot: HP {botHealth} | Position {botPosition}</div>
        </div>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Reset Game
        </button>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-10 gap-1 mb-8">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`h-16 rounded flex items-center justify-center p-1 text-center text-sm
              ${cell.type === 'buff' ? 'bg-green-700' : 
                cell.type === 'debuff' ? 'bg-red-700' : 
                cell.type === 'goblin' ? 'bg-yellow-700' :
                'bg-gray-700'} 
              ${playerPosition === index ? 'ring-2 ring-blue-500' : ''}
              ${botPosition === index ? 'ring-2 ring-red-500' : ''}`}
          >
            <div>
              {index + 1}
              {cell.type !== 'normal' && (
                <div className="text-xs">
                  {cell.type === 'goblin' ? '👺' : cell.effect}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handlePlayerMove}
          disabled={!isPlayerTurn || isGameOver}
          className={`px-6 py-3 rounded-lg text-white font-bold
            ${isPlayerTurn && !isGameOver
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-600 cursor-not-allowed'}`}
        >
          Roll Dice {diceRoll && `(Last: ${diceRoll})`}
        </button>
      </div>

      {/* Game Log */}
      <div className="bg-black bg-opacity-50 rounded p-4">
        <h3 className="text-lg font-bold mb-2">Game Log:</h3>
        {gameLog.map((log, index) => (
          <div key={index} className="text-sm mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
