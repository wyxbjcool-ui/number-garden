import type { Plant } from '../types/plant';

export const plants: Record<string, Plant> = {
  succulent: {
    id: 'succulent',
    name: '多肉',
    matureIcon: '🌵',
    level: 1,
    xp: 0,
    waterCount: 0,
    unlockCost: 0,
  },
  'touch-me-not': {
    id: 'touch-me-not',
    name: '碰碰香',
    matureIcon: '🌿',
    level: 1,
    xp: 0,
    waterCount: 0,
    unlockCost: 20,
  },
  caladium: {
    id: 'caladium',
    name: '彩叶芋',
    matureIcon: '🌺',
    level: 1,
    xp: 0,
    waterCount: 0,
    unlockCost: 30,
  },
  orchid: {
    id: 'orchid',
    name: '蝴蝶兰',
    matureIcon: '🌺',
    level: 1,
    xp: 0,
    waterCount: 0,
    unlockCost: 50,
  },
  sunflower: {
    id: 'sunflower',
    name: '向日葵',
    matureIcon: '🌻',
    level: 1,
    xp: 0,
    waterCount: 0,
    unlockCost: 80,
  },
};

export const plantIds = Object.keys(plants);
