import React, { useState } from 'react';

const GameBoard = () => {
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameLog, setGameLog] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Create board with special cells
  const board = Array(50).fill(null).map((_, index) => ({
    id: index,
    type: 'normal'
  }));

  // Add special cells
  [5, 15].forEach(pos => {
    board[pos] = { ...board[pos], type: 'buff', effect: 'Healing Fountain', value: 3 };
  });
  
  [10, 20].forEach(pos => {
    board[pos] = { ...board[pos], type: 'debuff', effect: 'Poison Trap', value: -2 };
  });
  
  [7, 12, 18, 25, 32, 38, 45].forEach(pos => {
    board[pos] = { ...board[pos], type: 'goblin' };
  });

  const handleCellEffect = (position, isBot) => {
    const cell = board[position];
    const setHealth = isBot ? setBotHealth : setPlayerHealth;
    
    if (cell.type === 'goblin') {
      const damage = Math.floor(Math.random() * 3) + 1;
      setHealth(prev => Math.max(0, prev - damage));
      setGameLog(prev => [
        `👺 Goblin attacks ${isBot ? 'Bot' : 'Player'} for ${damage} damage!`, 
        ...prev.slice(0, 3)
      ]);
    } else if (cell.type === 'buff') {
      setHealth(prev => Math.min(30, prev + cell.value));
      setGameLog(prev => [
        `💖 ${cell.effect} heals for ${cell.value} HP!`,
        ...prev.slice(0, 3)
      ]);
    } else if (cell.type === 'debuff') {
      setHealth(prev => Math.max(0, prev - Math.abs(cell.value)));
      setGameLog(prev => [
        `☠️ ${cell.effect} deals ${Math.abs(cell.value)} damage!`,
        ...prev.slice(0, 3)
      ]);
    }

    checkHealth();
  };

  const checkHealth = () => {
    if (playerHealth <= 0) {
      setPlayerPosition(0);
      setPlayerHealth(10);
      setGameLog(prev => ['💀 Player died and respawned at start!', ...prev]);
    }
    if (botHealth <= 0) {
      setBotPosition(0);
      setBotHealth(10);
      setGameLog(prev => ['💀 Bot died and respawned at start!', ...prev]);
    }
  };

  const botTurn = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setGameLog(prev => [`🤖 Bot rolled ${roll}!`, ...prev.slice(0, 3)]);
    
    const newPosition = Math.min(49, botPosition + roll);
    setBotPosition(newPosition);
    
    if (newPosition >= 49) {
      setIsGameOver(true);
      setGameLog(prev => ['🏆 Bot wins the game!', ...prev]);
      return;
    }
    
    handleCellEffect(newPosition, true);
    setIsPlayerTurn(true);
  };

  const rollDice = () => {
    if (!isPlayerTurn || isGameOver) return;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setGameLog(prev => [`🎲 You rolled ${roll}!`, ...prev.slice(0, 3)]);
    
    const newPosition = Math.min(49, playerPosition + roll);
    setPlayerPosition(newPosition);
    
    if (newPosition >= 49) {
      setIsGameOver(true);
      setGameLog(prev => ['🏆 You win the game!', ...prev]);
      return;
    }
    
    handleCellEffect(newPosition, false);
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

  const getCellStyle = (cell) => {
    const baseStyle = "w-16 h-16 rounded-lg flex items-center justify-center relative transform transition-transform duration-200 border-2";
    
    switch (cell.type) {
      case 'buff':
        return `${baseStyle} bg-emerald-900 border-emerald-500 hover:bg-emerald-800`;
      case 'debuff':
        return `${baseStyle} bg-red-900 border-red-500 hover:bg-red-800`;
      case 'goblin':
        return `${baseStyle} bg-amber-900 border-amber-500 hover:bg-amber-800`;
      default:
        return `${baseStyle} bg-gray-900 border-gray-600 hover:bg-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* Game Info */}
      <div className="mb-8 bg-black bg-opacity-50 p-4 rounded-lg border-2 border-amber-900">
        <div className="text-2xl text-amber-500 mb-4">
          <div>Player HP: {playerHealth}</div>
          <div>Bot HP: {botHealth}</div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={rollDice}
            disabled={!isPlayerTurn || isGameOver}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition
              ${isPlayerTurn && !isGameOver
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            Roll Dice
          </button>
          {isGameOver && (
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-lg font-bold text-lg
                bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              New Game
            </button>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-10 gap-2 mb-8 max-w-5xl mx-auto">
        {board.map((cell, index) => (
          <div key={index} className={getCellStyle(cell)}>
            <span className="text-white text-lg">{index + 1}</span>
            {playerPosition === index && (
              <div className="absolute top-1 left-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            )}
            {botPosition === index && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            )}
            {cell.type !== 'normal' && (
              <div className="absolute bottom-1 text-lg">
                {cell.type === 'buff' && '💖'}
                {cell.type === 'debuff' && '☠️'}
                {cell.type === 'goblin' && '👺'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Game Log */}
      <div className="bg-black bg-opacity-50 p-4 rounded-lg border-2 border-amber-900">
        <h3 className="text-xl font-bold mb-2 text-amber-500">Game Log</h3>
        <div className="space-y-1">
          {gameLog.map((log, index) => (
            <div key={index} className="text-amber-100">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
