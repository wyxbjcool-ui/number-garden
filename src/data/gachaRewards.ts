import type { GachaRarity, GachaReward } from '../types/gacha';

export const gachaCost = 10;

export const gachaDuplicateCoins: Record<GachaRarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 5,
  mythic: 8,
};

export const gachaRarityRates: Array<{
  rarity: GachaRarity;
  label: string;
  rate: number;
}> = [
  { rarity: 'common', label: '普通', rate: 60 },
  { rarity: 'rare', label: '蓝色', rate: 25 },
  { rarity: 'epic', label: '紫色', rate: 10 },
  { rarity: 'legendary', label: '橙色', rate: 4 },
  { rarity: 'mythic', label: '红色', rate: 1 },
];

export const gachaRarityLabels: Record<GachaRarity, string> = {
  common: '普通',
  rare: '蓝色',
  epic: '紫色',
  legendary: '橙色',
  mythic: '红色',
};

export const gachaRarityColors: Record<GachaRarity, string> = {
  common: '#75A86B',
  rare: '#4A98D8',
  epic: '#9C65D8',
  legendary: '#E8912D',
  mythic: '#D94D5C',
};

export const gachaRewards: GachaReward[] = [
  { id: 'little-red-flower', name: '小红花', icon: '🌸', rarity: 'common' },
  { id: 'little-sapling', name: '小树苗', icon: '🌱', rarity: 'common' },
  { id: 'small-cookie', name: '小饼干', icon: '🍪', rarity: 'common' },
  { id: 'building-block', name: '积木', icon: '🧱', rarity: 'common' },
  { id: 'lucky-clover', name: '幸运草', icon: '🍀', rarity: 'common' },
  { id: 'blue-butterfly', name: '蓝蝴蝶', icon: '🦋', rarity: 'rare' },
  { id: 'rainbow', name: '彩虹', icon: '🌈', rarity: 'rare' },
  { id: 'pinwheel', name: '小风车', icon: '🎐', rarity: 'rare' },
  { id: 'star-sticker-gacha', name: '星星贴纸', icon: '⭐', rarity: 'rare' },
  { id: 'moon-stone-gacha', name: '月亮石', icon: '🌙', rarity: 'epic' },
  { id: 'purple-gift', name: '紫礼盒', icon: '🎁', rarity: 'epic' },
  { id: 'magic-stardust', name: '魔法星尘', icon: '✨', rarity: 'epic' },
  { id: 'little-crown', name: '小皇冠', icon: '👑', rarity: 'legendary' },
  { id: 'golden-seed-gacha', name: '金色种子', icon: '🌻', rarity: 'legendary' },
  { id: 'legend-cat-paw', name: '传说猫爪徽章', icon: '🐾', rarity: 'mythic' },
];

export const getRandomGachaReward = () => {
  const roll = Math.random() * 100;
  let selectedRarity: GachaRarity = 'common';
  let cumulativeRate = 0;

  for (const rarityRate of gachaRarityRates) {
    cumulativeRate += rarityRate.rate;

    if (roll < cumulativeRate) {
      selectedRarity = rarityRate.rarity;
      break;
    }
  }

  const rewardsInRarity = gachaRewards.filter(
    (reward) => reward.rarity === selectedRarity,
  );
  const rewardIndex = Math.floor(Math.random() * rewardsInRarity.length);

  return rewardsInRarity[rewardIndex];
};
