import React, { useState, useEffect } from 'react';
import Card from './Card';
import { cards } from '../data/cards';

const GameBoard = () => {
  const [playerDeck, setPlayerDeck] = useState([]);
  const [enemyDeck, setEnemyDeck] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [enemyMana, setEnemyMana] = useState(1);
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
    const shuffledPlayerDeck = [...cards].sort(() => Math.random() - 0.5);
    const shuffledEnemyDeck = [...cards].sort(() => Math.random() - 0.5);
    
    setPlayerDeck(shuffledPlayerDeck.slice(4));
    setEnemyDeck(shuffledEnemyDeck.slice(4));
    
    // Draw initial hands
    setPlayerHand(shuffledPlayerDeck.slice(0, 4));
    setEnemyHand(shuffledEnemyDeck.slice(0, 4));
  }, []);

  const drawCard = (isEnemy = false) => {
    if (isEnemy) {
      if (enemyDeck.length === 0) {
        setEnemyHealth(prev => prev - Math.ceil(turn / 2));
        return;
      }
      
      if (enemyHand.length >= 10) {
        setEnemyDeck(prev => prev.slice(1));
        return;
      }
      
      const [newCard, ...remainingDeck] = enemyDeck;
      setEnemyHand(prev => [...prev, newCard]);
      setEnemyDeck(remainingDeck);
    } else {
      if (playerDeck.length === 0) {
        setPlayerHealth(prev => prev - Math.ceil(turn / 2));
        return;
      }
      
      if (playerHand.length >= 10) {
        setPlayerDeck(prev => prev.slice(1));
        return;
      }
      
      const [newCard, ...remainingDeck] = playerDeck;
      setPlayerHand(prev => [...prev, newCard]);
      setPlayerDeck(remainingDeck);
    }
  };

  const playCard = (card, isEnemy = false) => {
    if (isEnemy) {
      if (card.mana > enemyMana) return false;
      setEnemyMana(prev => prev - card.mana);
      setEnemyHand(prev => prev.filter(c => c.id !== card.id));
    } else {
      if (!isPlayerTurn || card.mana > playerMana) return false;
      setPlayerMana(prev => prev - card.mana);
      setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    }
    
    if (card.type === 'minion') {
      const field = isEnemy ? enemyField : playerField;
      const setField = isEnemy ? setEnemyField : setPlayerField;
      
      if (field.length < 7) {
        const playedCard = {
          ...card,
          currentHealth: card.health,
          canAttack: false,
          id: card.id + Date.now()
        };
        setField(prev => [...prev, playedCard]);
        return true;
      }
    } else if (card.type === 'spell') {
      handleSpellEffects(card, isEnemy);
      return true;
    }
    return false;
  };

  const handleSpellEffects = (card, isEnemy) => {
    switch (card.name) {
      case 'Fireball':
        if (isEnemy) {
          setPlayerHealth(prev => prev - 6);
        } else {
          setEnemyHealth(prev => prev - 6);
        }
        break;
      case 'Healing Rain':
        if (isEnemy) {
          setEnemyHealth(prev => Math.min(30, prev + 8));
        } else {
          setPlayerHealth(prev => Math.min(30, prev + 8));
        }
        break;
      // ... other spell effects ...
    }
  };

  const enemyTurn = () => {
    // AI Logic
    const playAICard = () => {
      // Sort cards by mana cost
      const playableCards = enemyHand
        .filter(card => card.mana <= enemyMana)
        .sort((a, b) => b.mana - a.mana); // Try to play highest mana cards first

      for (const card of playableCards) {
        if (card.type === 'spell') {
          // Prioritize removal spells when player has minions
          if (playerField.length > 0 && ['Fireball', 'Assassinate', 'Flame Strike'].includes(card.name)) {
            if (playCard(card, true)) continue;
          }
          // Use healing when low on health
          if (enemyHealth <= 15 && card.name === 'Healing Rain') {
            if (playCard(card, true)) continue;
          }
        } else {
          // Play minions prioritizing higher mana cost
          if (playCard(card, true)) continue;
        }
      }
    };

    const attackWithMinions = () => {
      // For each minion that can attack
      enemyField.forEach(minion => {
        if (minion.canAttack && !minion.frozen) {
          // If there are taunts, must attack them first
          const taunts = playerField.filter(m => m.effect?.includes('Taunt'));
          
          if (taunts.length > 0) {
            // Attack random taunt
            const target = taunts[Math.floor(Math.random() * taunts.length)];
            attackMinion(minion, target, true);
          } else if (playerField.length > 0) {
            // 70% chance to attack minions if they exist
            if (Math.random() < 0.7) {
              const target = playerField[Math.floor(Math.random() * playerField.length)];
              attackMinion(minion, target, true);
            } else {
              // Attack hero
              attackHero(minion, true);
            }
          } else {
            // Always attack hero if no minions
            attackHero(minion, true);
          }
        }
      });
    };

    // Execute AI turn
    drawCard(true);
    setEnemyMana(maxMana);
    
    // Slight delay for each action to make it feel more natural
    setTimeout(() => {
      playAICard();
      setTimeout(() => {
        attackWithMinions();
        setTimeout(() => {
          setIsPlayerTurn(true);
          setPlayerMana(maxMana);
        }, 500);
      }, 500);
    }, 500);
  };

  const attackMinion = (attacker, defender, isEnemy = false) => {
    // Update health
    defender.currentHealth -= attacker.attack;
    attacker.currentHealth -= defender.attack;
    
    // Update boards
    const updateField = (field) => 
      field.map(card => 
        card.id === attacker.id || card.id === defender.id
          ? card
          : { ...card }
      ).filter(card => card.currentHealth > 0);

    setPlayerField(prev => updateField(prev));
    setEnemyField(prev => updateField(prev));
    
    attacker.canAttack = false;
  };

  const attackHero = (attacker, isEnemy = false) => {
    if (isEnemy) {
      setPlayerHealth(prev => prev - attacker.attack);
    } else {
      setEnemyHealth(prev => prev - attacker.attack);
    }
    attacker.canAttack = false;
  };

  const endTurn = () => {
    if (!isPlayerTurn) return;

    // Clear dead minions
    setPlayerField(prev => prev.filter(minion => minion.currentHealth > 0));
    setEnemyField(prev => prev.filter(minion => minion.currentHealth > 0));

    // Reset minion states and increase max mana
    setPlayerField(prev => prev.map(minion => ({
      ...minion,
      canAttack: true,
      frozen: false
    })));

    setIsPlayerTurn(false);
    setTurn(prev => prev + 1);
    
    const newMaxMana = Math.min(10, maxMana + 1);
    setMaxMana(newMaxMana);
    setPlayerMana(0);
    setEnemyMana(newMaxMana);
    
    drawCard();
    setTimeout(enemyTurn, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 p-4">
      {/* Enemy Information */}
      <div className="flex justify-between items-center mb-4 bg-black bg-opacity-30 rounded-lg p-4">
        <div className="text-white text-xl font-bold">
          Enemy Health: {enemyHealth}
        </div>
        <div className="text-amber-400 text-lg">
          Cards in hand: {enemyHand.length}
        </div>
      </div>

      {/* Enemy Field */}
      <div className="flex gap-2 min-h-48 bg-black bg-opacity-20 p-4 rounded-lg mb-4 border border-purple-400">
        {enemyField.map(card => (
          <Card 
            key={card.id} 
            card={{...card, health: card.currentHealth}} 
            isPlayable={false}
            isInField={true}
          />
        ))}
      </div>

      {/* Player Field */}
      <div className="flex gap-2 min-h-48 bg-black bg-opacity-20 p-4 rounded-lg mb-4 border border-purple-400">
        {playerField.map(card => (
          <Card 
            key={card.id} 
            card={{...card, health: card.currentHealth}} 
            isPlayable={false}
            isInField={true}
          />
        ))}
      </div>

      {/* Player Information and Controls */}
      <div className="flex justify-between items-center mb-4 bg-black bg-opacity-30 rounded-lg p-4">
        <div className="text-white">
          <p className="text-xl font-bold">Health: {playerHealth}</p>
          <p className="text-lg text-blue-300">Mana: {playerMana}/{maxMana}</p>
          <p className="text-sm text-amber-400">Cards in deck: {playerDeck.length}</p>
        </div>
        <button 
          className={`px-6 py-3 rounded-lg text-white font-bold
            ${isPlayerTurn 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer shadow-lg' 
              : 'bg-gray-600 cursor-not-allowed'}`}
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
