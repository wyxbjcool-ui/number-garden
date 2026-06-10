import type { Ionicons } from '@expo/vector-icons';

export type CollectionItem = {
  id: string;
  name: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  rarity: 'common' | 'rare';
};
