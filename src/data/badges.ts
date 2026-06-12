import type { Badge } from '../types/badge';

export const badges: Badge[] = [
  {
    id: 'first-task',
    title: '第一步',
    description: '完成第一个每日任务',
    iconName: 'checkmark-circle',
  },
  {
    id: 'level-2-plant',
    title: '小苗长高',
    description: '植物达到 Level 2',
    iconName: 'leaf',
  },
  {
    id: 'three-waters',
    title: '浇水小能手',
    description: '累计浇水 3 次',
    iconName: 'water',
  },
  {
    id: 'first-mature-plant',
    title: '第一株成熟植物',
    description: '让任意植物成长到成熟阶段',
    iconName: 'flower',
  },
];
