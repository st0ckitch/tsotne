import React from 'react';

const Card = ({ card, isPlayable, onPlay, isInField = false }) => {
  const handleClick = () => {
    if (isPlayable && !isInField) {
      onPlay(card);
    }
  };

  const cardStyles = `
    relative w-32 h-48 rounded-lg shadow-lg 
    ${isPlayable && !isInField ? 'cursor-pointer hover:scale-105' : 'opacity-75'} 
    transition-all duration-200
    bg-gradient-to-b from-gray-200 to-gray-300
    border-2 ${card.type === 'spell' ? 'border-purple-500' : 'border-yellow-500'}
  `;

  const manaStyles = `
    absolute top-2 left-2 w-8 h-8 
    rounded-full bg-blue-500 
    flex items-center justify-center 
    text-white font-bold shadow-md
  `;

  const nameStyles = `
    font-bold text-sm text-center 
    px-2 py-1 bg-gray-100 
    rounded-t-lg border-b border-gray-300
  `;

  const effectStyles = `
    text-xs mt-2 px-2 text-center 
    h-16 overflow-y-auto
    text-gray-700
  `;

  const statsStyles = `
    absolute bottom-2 w-full 
    flex justify-between px-4
    text-lg font-bold
  `;

  return (
    <div className={cardStyles} onClick={handleClick}>
      <div className={manaStyles}>
        {card.mana}
      </div>
      
      <div className="mt-8">
        <div className={nameStyles}>
          {card.name}
        </div>
        
        <div className={effectStyles}>
          {card.effect}
        </div>
        
        {card.type === 'minion' && (
          <div className={statsStyles}>
            <span className="text-red-500">{card.attack}</span>
            <span className="text-green-500">{card.health}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
