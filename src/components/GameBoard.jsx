import React, { useState } from 'react';

const GameBoard = () => {
  const [playerHealth, setPlayerHealth] = useState(10);
  const [botHealth, setBotHealth] = useState(10);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameLog, setGameLog] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Create board with path coordinates
  const pathCoordinates = [
    {x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, 
    {x: 4, y: 3}, {x: 4, y: 2}, 
    {x: 5, y: 2}, {x: 6, y: 2}, {x: 7, y: 2},
    {x: 7, y: 1}, {x: 7, y: 0},
    {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0},
    {x: 10, y: 1}, {x: 10, y: 2}, {x: 10, y: 3},
    {x: 9, y: 3}, {x: 8, y: 3},
    {x: 8, y: 4}, {x: 8, y: 5},
    {x: 9, y: 5}, {x: 10, y: 5}, {x: 11, y: 5},
    {x: 11, y: 4}, {x: 11, y: 3},
    {x: 12, y: 3}, {x: 13, y: 3},
    {x: 13, y: 4}, {x: 13, y: 5}, {x: 13, y: 6},
    {x: 12, y: 6}, {x: 11, y: 6},
    {x: 11, y: 7}, {x: 11, y: 8},
    {x: 12, y: 8}, {x: 13, y: 8}, {x: 14, y: 8},
    {x: 14, y: 7}, {x: 14, y: 6},
    {x: 15, y: 6}, {x: 16, y: 6}, {x: 17, y: 6},
    {x: 17, y: 7}, {x: 17, y: 8},
    {x: 16, y: 8}, {x: 15, y: 8},
    {x: 15, y: 9}, {x: 15, y: 10}
  ];

  // Create board with special cells
  const board = pathCoordinates.map((coord, index) => ({
    id: index,
    x: coord.x,
    y: coord.y,
    type: 'normal'
  }));

  // Add special cells
  [5, 15, 25].forEach(pos => {
    if (board[pos]) board[pos] = { ...board[pos], type: 'buff', effect: 'Healing Fountain', value: 3 };
  });
  
  [10, 20, 30].forEach(pos => {
    if (board[pos]) board[pos] = { ...board[pos], type: 'debuff', effect: 'Poison Trap', value: -2 };
  });
  
  [7, 12, 18, 25, 32, 38, 45].forEach(pos => {
    if (board[pos]) board[pos] = { ...board[pos], type: 'goblin' };
  });

  // Create decorative elements
  const decorations = [
    { x: 3, y: 3, type: 'tree' },
    { x: 5, y: 3, type: 'rock' },
    { x: 6, y: 1, type: 'torch' },
    { x: 9, y: 1, type: 'bones' },
    { x: 11, y: 2, type: 'torch' },
    { x: 12, y: 4, type: 'barrel' },
    { x: 14, y: 5, type: 'torch' },
    { x: 16, y: 7, type: 'skeleton' },
    { x: 2, y: 5, type: 'tree' },
    { x: 15, y: 5, type: 'rock' },
    { x: 13, y: 7, type: 'bones' }
  ];

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
    
    const newPosition = Math.min(board.length - 1, botPosition + roll);
    setBotPosition(newPosition);
    
    if (newPosition >= board.length - 1) {
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
    
    const newPosition = Math.min(board.length - 1, playerPosition + roll);
    setPlayerPosition(newPosition);
    
    if (newPosition >= board.length - 1) {
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

  const getDecorationIcon = (type) => {
    switch (type) {
      case 'tree': return '🌲';
      case 'rock': return '🪨';
      case 'torch': return '🔥';
      case 'bones': return '🦴';
      case 'barrel': return '🛢️';
      case 'skeleton': return '💀';
      default: return '';
    }
  };

  const gridSize = 18;

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
              className="px-6 py-3 rounded-lg font-bold text-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              New Game
            </button>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-5xl mx-auto overflow-auto p-4 bg-stone-900 rounded-lg border-2 border-amber-900">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(40px, 1fr))` }}>
          {Array(gridSize).fill(null).map((_, y) => (
            Array(gridSize).fill(null).map((_, x) => {
              const pathCell = board.find(cell => cell.x === x && cell.y === y);
              const decoration = decorations.find(d => d.x === x && d.y === y);
              
              if (pathCell) {
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-full h-12 rounded-lg flex items-center justify-center relative 
                      ${pathCell.type === 'buff' ? 'bg-emerald-900 border-emerald-500' :
                        pathCell.type === 'debuff' ? 'bg-red-900 border-red-500' :
                        pathCell.type === 'goblin' ? 'bg-amber-900 border-amber-500' :
                        'bg-gray-800 border-gray-600'} 
                      border-2 transform transition-transform hover:scale-105`}
                  >
                    <span className="text-white text-sm">{pathCell.id + 1}</span>
                    {playerPosition === pathCell.id && (
                      <div className="absolute top-1 left-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    {botPosition === pathCell.id && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                    {pathCell.type !== 'normal' && (
                      <div className="absolute bottom-1 text-lg">
                        {pathCell.type === 'buff' && '💖'}
                        {pathCell.type === 'debuff' && '☠️'}
                        {pathCell.type === 'goblin' && '👺'}
                      </div>
                    )}
                  </div>
                );
              } else if (decoration) {
                return (
                  <div key={`${x}-${y}`} 
                    className="w-full h-12 flex items-center justify-center text-2xl opacity-75">
                    {getDecorationIcon(decoration.type)}
                  </div>
                );
              }
              return <div key={`${x}-${y}`} className="w-full h-12" />;
            })
          ))}
        </div>
      </div>

      {/* Game Log */}
      <div className="mt-8 bg-black bg-opacity-50 p-4 rounded-lg border-2 border-amber-900">
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
