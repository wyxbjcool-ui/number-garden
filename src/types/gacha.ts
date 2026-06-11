export type GachaRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GachaReward = {
  id: string;
  name: string;
  icon: string;
  rarity: GachaRarity;
};

export type GachaDrawResult = {
  success: boolean;
  reason?: 'not-enough-coins';
  reward?: GachaReward;
  isNew?: boolean;
  duplicateCoins?: number;
};
