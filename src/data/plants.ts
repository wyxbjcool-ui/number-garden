import type { Plant } from '../types/plant';

export const plants: Record<string, Plant> = {
  succulent: {
    id: 'succulent',
    name: '多肉',
    level: 1,
    xp: 0,
    waterCount: 0,
  },
  caladium: {
    id: 'caladium',
    name: '彩叶芋',
    level: 1,
    xp: 0,
    waterCount: 0,
  },
  'touch-me-not': {
    id: 'touch-me-not',
    name: '碰碰草',
    level: 1,
    xp: 0,
    waterCount: 0,
  },
  orchid: {
    id: 'orchid',
    name: '蝴蝶兰',
    level: 1,
    xp: 0,
    waterCount: 0,
  },
};

export const plantIds = Object.keys(plants);
