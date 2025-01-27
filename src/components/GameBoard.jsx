import React, { useState, useEffect } from 'react';
import Card from './Card';
import { cards } from '../data/cards';

const GameBoard = () => {
  const [playerDeck, setPlayerDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerMana, setPlayerMana] = useState(1);
  const [maxMana, setMaxMana] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(30);
  const [enemyHealth, setEnemyHealth] = useState(30);
  const [turn, setTurn] = useState(1);
  const [playerField, setPlayerField] = useState([]);
  const [enemyField, setEnemyField] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  // Initialize game
  useEffect(() => {
    const shuffledDeck = [...cards].sort(() => Math.random() - 0.5);
    setPlayerDeck(shuffledDeck);
    // Draw initial hand
    const initialHand = shuffledDeck.slice(0, 4);
    setPlayerHand(initialHand);
    setPlayerDeck(shuffledDeck.slice(4));
  }, []);

  const drawCard = () => {
    if (playerDeck.length === 0) {
      // Handle fatigue damage
      setPlayerHealth(prev => prev - Math.ceil(turn / 2));
      return;
    }
    
    if (playerHand.length >= 10) {
      // Burn card if hand is full
      setPlayerDeck(prev => prev.slice(1));
      return;
    }
    
    const [newCard, ...remainingDeck] = playerDeck;
    setPlayerHand(prev => [...prev, newCard]);
    setPlayerDeck(remainingDeck);
  };

  const playCard = (card) => {
    if (!isPlayerTurn || card.mana > playerMana) return;
    
    setPlayerMana(prev => prev - card.mana);
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    if (card.type === 'minion') {
      if (playerField.length < 7) {
        setPlayerField(prev => [...prev, { ...card, currentHealth: card.health }]);
      }
    } else if (card.type === 'spell') {
      handleSpellEffects(card);
    }
  };

  const handleSpellEffects = (card) => {
    switch (card.name) {
      case 'Fireball':
        setEnemyHealth(prev => prev - 6);
        break;
      case 'Healing Rain':
        setPlayerHealth(prev => Math.min(30, prev + 8));
        break;
      case 'Holy Nova':
        setEnemyField(prev => prev.map(minion => ({
          ...minion,
          currentHealth: minion.currentHealth - 2
        })));
        setPlayerField(prev => prev.map(minion => ({
          ...minion,
          currentHealth: Math.min(minion.health, minion.currentHealth + 2)
        })));
        break;
      case 'Flame Strike':
        setEnemyField(prev => prev.map(minion => ({
          ...minion,
          currentHealth: minion.currentHealth - 4
        })));
        break;
      case 'Frost Nova':
        setEnemyField(prev => prev.map(minion => ({
          ...minion,
          frozen: true
        })));
        break;
      case 'Assassinate':
        // Implementation for targeting would be needed
        break;
      default:
        console.log('Spell effect not implemented:', card.name);
    }
  };

  const endTurn = () => {
    if (!isPlayerTurn) return;

    // Clear dead minions
    setPlayerField(prev => prev.filter(minion => minion.currentHealth > 0));
    setEnemyField(prev => prev.filter(minion => minion.currentHealth > 0));

    // Reset minion states
    setPlayerField(prev => prev.map(minion => ({
      ...minion,
      canAttack: false,
      frozen: false
    })));

    // Handle turn transition
    setIsPlayerTurn(false);
    setTurn(prev => prev + 1);
    setMaxMana(prev => Math.min(10, prev + 1));
    setPlayerMana(Math.min(10, turn + 1));
    
    // Draw a card for next turn
    drawCard();

    // Simulate enemy turn after a delay
    setTimeout(enemyTurn, 1000);
  };

  const enemyTurn = () => {
    // Simple AI: Play random cards and attack random targets
    const aiPlay = () => {
      // Implement basic AI logic here
      console.log('AI taking turn...');
    };

    aiPlay();

    // End enemy turn
    setIsPlayerTurn(true);
    setPlayerMana(maxMana);
  };

  const attackWithMinion = (attackingMinion, target) => {
    if (!isPlayerTurn || !attackingMinion.canAttack || attackingMinion.frozen) return;

    // Handle combat damage
    if (target) {
      // Minion combat
      target.currentHealth -= attackingMinion.attack;
      attackingMinion.currentHealth -= target.attack;
    } else {
      // Direct attack to enemy hero
      setEnemyHealth(prev => prev - attackingMinion.attack);
    }

    attackingMinion.canAttack = false;
    updateBoard();
  };

  const updateBoard = () => {
    // Update board state after combat
    setPlayerField(prev => prev.filter(minion => minion.currentHealth > 0));
    setEnemyField(prev => prev.filter(minion => minion.currentHealth > 0));
  };

  return (
    <div className="min-h-screen bg-green-900 p-4">
      {/* Enemy Information */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-white text-xl">
          Enemy Health: {enemyHealth}
        </div>
      </div>

      {/* Enemy Field */}
      <div className="flex gap-2 min-h-48 bg-green-800 p-2 rounded mb-4">
        {enemyField.map(card => (
          <Card 
            key={card.id} 
            card={card} 
            isPlayable={false}
            isInField={true}
          />
        ))}
      </div>

      {/* Player Field */}
      <div className="flex gap-2 min-h-48 bg-green-800 p-2 rounded mb-4">
        {playerField.map(card => (
          <Card 
            key={card.id} 
            card={card} 
            isPlayable={false}
            isInField={true}
          />
        ))}
      </div>

      {/* Player Information and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <p className="text-xl">Health: {playerHealth}</p>
          <p className="text-lg">Mana: {playerMana}/{maxMana}</p>
          <p className="text-sm">Cards in deck: {playerDeck.length}</p>
        </div>
        <button 
          className={`px-6 py-3 rounded-lg text-white font-bold
            ${isPlayerTurn 
              ? 'bg-yellow-500 hover:bg-yellow-600 cursor-pointer' 
              : 'bg-gray-500 cursor-not-allowed'}`}
          onClick={endTurn}
          disabled={!isPlayerTurn}
        >
          End Turn
        </button>
      </div>

      {/* Player Hand */}
      <div className="flex gap-2 justify-center mt-4 min-h-48">
        {playerHand.map(card => (
          <Card 
            key={card.id} 
            card={card} 
            isPlayable={isPlayerTurn && card.mana <= playerMana}
            onPlay={playCard}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
