export const generateBoard = () => {
  // Create 50 basic cells
  const cells = Array(50).fill(null).map((_, index) => ({
    id: index + 1,
    type: 'normal',
    effect: null,
    value: 0,
    description: ''
  }));

  // Add buffs
  const buffs = [
    { type: 'buff', effect: 'Healing Fountain', value: 3, description: 'Heal 3 HP' },
    { type: 'buff', effect: 'Divine Shield', value: 5, description: 'Gain 5 HP' }
  ];

  // Add debuffs
  const debuffs = [
    { type: 'debuff', effect: 'Poison Trap', value: -2, description: 'Take 2 damage' },
    { type: 'debuff', effect: 'Dark Ritual', value: -4, description: 'Take 4 damage' }
  ];

  // Add special cells randomly (avoiding start and end)
  [...buffs, ...debuffs].forEach(special => {
    let position;
    do {
      position = Math.floor(Math.random() * 48) + 1; // Avoid first and last cells
    } while (cells[position].type !== 'normal');
    
    cells[position] = { ...cells[position], ...special };
  });

  // Add 7 goblin cells
  let goblinsPlaced = 0;
  while (goblinsPlaced < 7) {
    const position = Math.floor(Math.random() * 48) + 1;
    if (cells[position].type === 'normal') {
      cells[position] = {
        ...cells[position],
        type: 'goblin',
        effect: 'Angry Goblin',
        description: 'A goblin appears! Take 1-3 damage'
      };
      goblinsPlaced++;
    }
  }

  return cells;
};
