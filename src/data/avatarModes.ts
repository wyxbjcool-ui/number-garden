import type { AvatarMode } from '../types/avatarMode';

type AvatarModeConfig = {
  name: string;
  title: string;
  subtitle: string;
  growthLabel: string;
  actionLabel: string;
};

export const avatarModes: Record<AvatarMode, AvatarModeConfig> = {
  garden: {
    name: '花园',
    title: '我的小花园',
    subtitle: '今天也让它长大一点吧',
    growthLabel: '养分',
    actionLabel: '浇水',
  },
  pet: {
    name: '宠物',
    title: '我的成长伙伴',
    subtitle: '它在等你一起完成任务',
    growthLabel: '亲密度',
    actionLabel: '抚摸',
  },
  sprite: {
    name: '精灵',
    title: '数字小精灵',
    subtitle: '答题会让魔法变亮',
    growthLabel: '魔法值',
    actionLabel: '施法',
  },
};

export const avatarModeIds: AvatarMode[] = ['garden', 'pet', 'sprite'];
