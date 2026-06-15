import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import { defaultDailyTasks, getRandomDailyTasks } from '../data/dailyTasks';
import {
  gachaCost,
  gachaDuplicateCoins,
  getRandomGachaReward,
} from '../data/gachaRewards';
import { plants as initialPlants } from '../data/plants';
import type { DailyTask } from '../types/dailyTask';
import type { GachaDrawResult } from '../types/gacha';
import type { MathGame } from '../types/mathGame';
import type { Plant } from '../types/plant';
import type { AvatarMode } from '../types/avatarMode';

const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

type BadgeCheckState = {
  poopRecordDate: string;
  growthLevel: number;
  ownedPlantIds: string[];
  plants: Record<string, Plant>;
  unlockedBadgeIds: string[];
  gachaRewardIds: string[];
};

const getBadgeUpdate = (state: BadgeCheckState) => {
  const validBadgeIds = new Set(badges.map((badge) => badge.id));
  const currentUnlockedBadgeIds = state.unlockedBadgeIds.filter((badgeId) =>
    validBadgeIds.has(badgeId),
  );
  const nextUnlockedBadgeIds = new Set(currentUnlockedBadgeIds);
  const ownedPlantList = state.ownedPlantIds
    .map((plantId) => state.plants[plantId])
    .filter((plant): plant is Plant => Boolean(plant));
  const hasMaturePlant = ownedPlantList.some((plant) => plant.level >= 5);

  badges.forEach((badge) => {
    if (badge.id === 'badge_first_poop' && state.poopRecordDate) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'badge_first_gacha' && state.gachaRewardIds.length >= 1) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (
      badge.id === 'badge_first_collection' &&
      state.gachaRewardIds.length >= 1
    ) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'badge_level_2' && state.growthLevel >= 2) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'badge_two_plants' && state.ownedPlantIds.length >= 2) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'badge_first_mature_plant' && hasMaturePlant) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'badge_collection_5' && state.gachaRewardIds.length >= 5) {
      nextUnlockedBadgeIds.add(badge.id);
    }
  });

  const unlockedBadgeIds = Array.from(nextUnlockedBadgeIds);
  const latestUnlockedBadgeId = unlockedBadgeIds.find(
    (badgeId) => !currentUnlockedBadgeIds.includes(badgeId),
  );

  return {
    unlockedBadgeIds,
    ...(latestUnlockedBadgeId ? { latestUnlockedBadgeId } : {}),
  };
};

const getNextCollectedItemIds = (collectedItemIds: string[]) => {
  const nextItem = collectionItems.find(
    (item) => !collectedItemIds.includes(item.id),
  );

  if (!nextItem) {
    return collectedItemIds;
  }

  return [...collectedItemIds, nextItem.id];
};

type GrowPlantOptions = {
  countAsWater?: boolean;
};

type MaturePlantReward = {
  plantId: string;
  coins: number;
  fertilizers: number;
};

type FeedPlantResult = {
  success: boolean;
  matureReward?: MaturePlantReward;
};

const growPlantByXp = (
  plant: Plant,
  xpAmount: number,
  options?: GrowPlantOptions,
) => {
  const totalXp = plant.xp + xpAmount;
  const levelGain = Math.floor(totalXp / 100);

  return {
    ...plant,
    level: plant.level + levelGain,
    xp: totalXp % 100,
    waterCount: plant.waterCount + (options?.countAsWater ? 1 : 0),
  };
};

const matureRewardCoins = 20;
const matureRewardFertilizers = 5;

const getMaturePlantReward = (
  previousPlant: Plant,
  nextPlant: Plant,
  matureRewardClaimedPlantIds: string[],
): MaturePlantReward | null => {
  const wasMature = previousPlant.level >= 5;
  const isMature = nextPlant.level >= 5;
  const hasClaimed = matureRewardClaimedPlantIds.includes(previousPlant.id);

  if (wasMature || !isMature || hasClaimed) {
    return null;
  }

  return {
    plantId: previousPlant.id,
    coins: matureRewardCoins,
    fertilizers: matureRewardFertilizers,
  };
};

const growGlobalByXp = (
  growthLevel: number,
  growthXp: number,
  xpAmount: number,
) => {
  const totalXp = growthXp + xpAmount;
  const levelGain = Math.floor(totalXp / 100);
  const level = growthLevel + levelGain;
  const xp = totalXp % 100;

  return {
    level,
    xp,
    leveledUp: levelGain > 0,
    levelGain,
  };
};

const levelUpRewardCoins = 20;
const levelUpRewardFertilizers = 10;

type LevelUpRewards = {
  fromLevel: number;
  toLevel: number;
  coins: number;
  fertilizers: number;
  levelGain: number;
};

const getLevelUpRewards = (
  previousLevel: number,
  growthResult: ReturnType<typeof growGlobalByXp>,
) => {
  if (!growthResult.leveledUp) {
    return null;
  }

  return {
    fromLevel: previousLevel,
    toLevel: growthResult.level,
    coins: levelUpRewardCoins * growthResult.levelGain,
    fertilizers: levelUpRewardFertilizers * growthResult.levelGain,
    levelGain: growthResult.levelGain,
  };
};

type GardenState = {
  coins: number;
  fertilizers: number;
  growthXp: number;
  growthLevel: number;
  levelUpRewards: LevelUpRewards | null;
  avatarMode: AvatarMode;
  currentTitle: string;
  currentTaskDate: string;
  lastTaskRefreshDate: string;
  todayTasks: DailyTask[];
  poopRecordDate: string;
  lastWaterDate: string;
  selectedPlantId: string;
  plants: Record<string, Plant>;
  ownedPlantIds: string[];
  matureRewardClaimedPlantIds: string[];
  completedTodayTaskIds: string[];
  unlockedBadgeIds: string[];
  latestUnlockedBadgeId: string | null;
  collectedItemIds: string[];
  gachaRewardIds: string[];
  answeredMathQuestionIds: string[];
  completeDailyTask: (task: DailyTask) => void;
  addGrowthXp: (amount: number) => void;
  dismissBadgeNotice: () => void;
  dismissLevelUpRewards: () => void;
  drawGacha: () => GachaDrawResult;
  recordPoopToday: () => boolean;
  setAvatarMode: (mode: AvatarMode) => void;
  answerMathQuestion: (question: MathGame, selectedOptionId: string) => void;
  feedPlantWithFertilizer: (plantId: string) => FeedPlantResult;
  selectPlant: (plantId: string) => void;
  unlockPlant: (plantId: string) => void;
  refreshDailyTasksForToday: () => void;
  waterSelectedPlant: () => void;
  resetGarden: () => void;
};

const initialState = {
  coins: 0,
  fertilizers: 0,
  growthXp: 0,
  growthLevel: 1,
  levelUpRewards: null,
  avatarMode: 'garden' as AvatarMode,
  currentTitle: '成长小种子',
  currentTaskDate: '',
  lastTaskRefreshDate: '',
  todayTasks: defaultDailyTasks,
  poopRecordDate: '',
  lastWaterDate: '',
  selectedPlantId: 'succulent',
  plants: initialPlants,
  ownedPlantIds: ['succulent'],
  matureRewardClaimedPlantIds: [],
  completedTodayTaskIds: [],
  unlockedBadgeIds: [],
  latestUnlockedBadgeId: null,
  collectedItemIds: [],
  gachaRewardIds: [],
  answeredMathQuestionIds: [],
};

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
      ...initialState,
      completeDailyTask: (task) =>
        set((state) => {
          if (state.completedTodayTaskIds.includes(task.id)) {
            return state;
          }

          const plant = state.plants[state.selectedPlantId];
          const growthProgress = growGlobalByXp(
            state.growthLevel,
            state.growthXp,
            10,
          );
          const levelUpRewards = getLevelUpRewards(
            state.growthLevel,
            growthProgress,
          );

          if (!plant) {
            const completedTodayTaskIds = [
              ...state.completedTodayTaskIds,
              task.id,
            ];
            const collectedItemIds = getNextCollectedItemIds(
              state.collectedItemIds,
            );

            return {
              coins:
                state.coins + task.rewardCoins + (levelUpRewards?.coins ?? 0),
              fertilizers:
                state.fertilizers +
                task.rewardFertilizers +
                (levelUpRewards?.fertilizers ?? 0),
              growthLevel: growthProgress.level,
              growthXp: growthProgress.xp,
              ...(levelUpRewards ? { levelUpRewards } : {}),
              completedTodayTaskIds,
              collectedItemIds,
              ...getBadgeUpdate({
                ...state,
                growthLevel: growthProgress.level,
              }),
            };
          }

          const nextPlant = growPlantByXp(plant, 10, { countAsWater: true });
          const matureReward = getMaturePlantReward(
            plant,
            nextPlant,
            state.matureRewardClaimedPlantIds,
          );

          const completedTodayTaskIds = [
            ...state.completedTodayTaskIds,
            task.id,
          ];
          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };
          const collectedItemIds = getNextCollectedItemIds(
            state.collectedItemIds,
          );

          return {
            coins:
              state.coins +
              task.rewardCoins +
              (levelUpRewards?.coins ?? 0) +
              (matureReward?.coins ?? 0),
            fertilizers:
              state.fertilizers +
              task.rewardFertilizers +
              (levelUpRewards?.fertilizers ?? 0) +
              (matureReward?.fertilizers ?? 0),
            growthLevel: growthProgress.level,
            growthXp: growthProgress.xp,
            ...(levelUpRewards ? { levelUpRewards } : {}),
            matureRewardClaimedPlantIds: matureReward
              ? [...state.matureRewardClaimedPlantIds, matureReward.plantId]
              : state.matureRewardClaimedPlantIds,
            completedTodayTaskIds,
            collectedItemIds,
            plants,
            ...getBadgeUpdate({
              ...state,
              growthLevel: growthProgress.level,
              plants,
            }),
          };
        }),
      addGrowthXp: (amount) =>
        set((state) => {
          const growthProgress = growGlobalByXp(
            state.growthLevel,
            state.growthXp,
            amount,
          );
          const levelUpRewards = getLevelUpRewards(
            state.growthLevel,
            growthProgress,
          );

          return {
            coins: state.coins + (levelUpRewards?.coins ?? 0),
            fertilizers:
              state.fertilizers + (levelUpRewards?.fertilizers ?? 0),
            growthLevel: growthProgress.level,
            growthXp: growthProgress.xp,
            ...(levelUpRewards ? { levelUpRewards } : {}),
            ...getBadgeUpdate({
              ...state,
              growthLevel: growthProgress.level,
            }),
          };
        }),
      dismissBadgeNotice: () =>
        set({
          latestUnlockedBadgeId: null,
        }),
      dismissLevelUpRewards: () =>
        set({
          levelUpRewards: null,
        }),
      drawGacha: () => {
        const state = get();

        if (state.coins < gachaCost) {
          return {
            success: false,
            reason: 'not-enough-coins',
          };
        }

        const reward = getRandomGachaReward();
        const isNew = !state.gachaRewardIds.includes(reward.id);
        const duplicateCoins = isNew ? 0 : gachaDuplicateCoins[reward.rarity];
        const gachaRewardIds = isNew
          ? [...state.gachaRewardIds, reward.id]
          : state.gachaRewardIds;

        set({
          coins: state.coins - gachaCost + duplicateCoins,
          gachaRewardIds,
          ...getBadgeUpdate({
            ...state,
            gachaRewardIds,
          }),
        });

        return {
          success: true,
          reward,
          isNew,
          duplicateCoins,
        };
      },
      recordPoopToday: () => {
        const state = get();
        const today = getLocalDateString();

        if (state.poopRecordDate === today) {
          return false;
        }

        const growthProgress = growGlobalByXp(
          state.growthLevel,
          state.growthXp,
          10,
        );
        const levelUpRewards = getLevelUpRewards(
          state.growthLevel,
          growthProgress,
        );

        set({
          coins: state.coins + 10 + (levelUpRewards?.coins ?? 0),
          fertilizers:
            state.fertilizers + 5 + (levelUpRewards?.fertilizers ?? 0),
          growthLevel: growthProgress.level,
          growthXp: growthProgress.xp,
          ...(levelUpRewards ? { levelUpRewards } : {}),
          poopRecordDate: today,
          ...getBadgeUpdate({
            ...state,
            growthLevel: growthProgress.level,
            poopRecordDate: today,
          }),
        });

        return true;
      },
      setAvatarMode: (mode) =>
        set({
          avatarMode: mode,
        }),
      answerMathQuestion: (question, selectedOptionId) =>
        set((state) => {
          if (state.answeredMathQuestionIds.includes(question.id)) {
            return state;
          }

          const isCorrect = selectedOptionId === question.correctOptionId;

          if (!isCorrect) {
            return state;
          }

          const answeredMathQuestionIds = [
            ...state.answeredMathQuestionIds,
            question.id,
          ];
          const plant = state.plants[state.selectedPlantId];
          const growthProgress = growGlobalByXp(
            state.growthLevel,
            state.growthXp,
            10,
          );
          const levelUpRewards = getLevelUpRewards(
            state.growthLevel,
            growthProgress,
          );

          if (!plant) {
            return {
              coins: state.coins + 3 + (levelUpRewards?.coins ?? 0),
              fertilizers:
                state.fertilizers + 1 + (levelUpRewards?.fertilizers ?? 0),
              growthLevel: growthProgress.level,
              growthXp: growthProgress.xp,
              ...(levelUpRewards ? { levelUpRewards } : {}),
              answeredMathQuestionIds,
              ...getBadgeUpdate({
                ...state,
                growthLevel: growthProgress.level,
              }),
            };
          }

          const nextPlant = growPlantByXp(plant, 10, { countAsWater: false });
          const matureReward = getMaturePlantReward(
            plant,
            nextPlant,
            state.matureRewardClaimedPlantIds,
          );
          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };

          return {
            coins:
              state.coins +
              3 +
              (levelUpRewards?.coins ?? 0) +
              (matureReward?.coins ?? 0),
            fertilizers:
              state.fertilizers +
              1 +
              (levelUpRewards?.fertilizers ?? 0) +
              (matureReward?.fertilizers ?? 0),
            growthLevel: growthProgress.level,
            growthXp: growthProgress.xp,
            ...(levelUpRewards ? { levelUpRewards } : {}),
            matureRewardClaimedPlantIds: matureReward
              ? [...state.matureRewardClaimedPlantIds, matureReward.plantId]
              : state.matureRewardClaimedPlantIds,
            answeredMathQuestionIds,
            plants,
            ...getBadgeUpdate({
              ...state,
              growthLevel: growthProgress.level,
              plants,
            }),
          };
        }),
      feedPlantWithFertilizer: (plantId) => {
        const state = get();

        if (state.fertilizers < 1 || !state.ownedPlantIds.includes(plantId)) {
          return { success: false };
        }

        const plant = state.plants[plantId];

        if (!plant) {
          return { success: false };
        }

        const nextPlant = growPlantByXp(plant, 10, { countAsWater: false });
        const matureReward = getMaturePlantReward(
          plant,
          nextPlant,
          state.matureRewardClaimedPlantIds,
        );
        const plants = {
          ...state.plants,
          [plant.id]: nextPlant,
        };

        set({
          fertilizers:
            state.fertilizers - 1 + (matureReward?.fertilizers ?? 0),
          coins: state.coins + (matureReward?.coins ?? 0),
          matureRewardClaimedPlantIds: matureReward
            ? [...state.matureRewardClaimedPlantIds, matureReward.plantId]
            : state.matureRewardClaimedPlantIds,
          plants,
          ...getBadgeUpdate({
            ...state,
            plants,
          }),
        });

        return {
          success: true,
          ...(matureReward ? { matureReward } : {}),
        };
      },
      selectPlant: (plantId) =>
        set((state) => {
          if (!state.ownedPlantIds.includes(plantId)) {
            return state;
          }

          return {
            selectedPlantId: plantId,
          };
        }),
      unlockPlant: (plantId) =>
        set((state) => {
          if (state.ownedPlantIds.includes(plantId)) {
            return state;
          }

          const plant = state.plants[plantId];

          if (!plant || state.coins < plant.unlockCost) {
            return state;
          }

          const ownedPlantIds = [...state.ownedPlantIds, plantId];

          return {
            coins: state.coins - plant.unlockCost,
            ownedPlantIds,
            selectedPlantId: plantId,
            ...getBadgeUpdate({
              ...state,
              ownedPlantIds,
            }),
          };
        }),
      refreshDailyTasksForToday: () =>
        set((state) => {
          const today = getLocalDateString();
          const lastTaskRefreshDate =
            state.lastTaskRefreshDate || state.currentTaskDate;

          if (lastTaskRefreshDate === today) {
            return state;
          }

          return {
            currentTaskDate: today,
            lastTaskRefreshDate: today,
            todayTasks: getRandomDailyTasks(),
            completedTodayTaskIds: [],
            answeredMathQuestionIds: [],
            poopRecordDate: '',
          };
        }),
      waterSelectedPlant: () =>
        set((state) => {
          const today = getLocalDateString();

          if (state.lastWaterDate === today) {
            return state;
          }

          const plant = state.plants[state.selectedPlantId];

          if (!plant) {
            return state;
          }

          const nextPlant = growPlantByXp(plant, 10, { countAsWater: true });
          const matureReward = getMaturePlantReward(
            plant,
            nextPlant,
            state.matureRewardClaimedPlantIds,
          );
          const growthProgress = growGlobalByXp(
            state.growthLevel,
            state.growthXp,
            10,
          );
          const levelUpRewards = getLevelUpRewards(
            state.growthLevel,
            growthProgress,
          );

          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };

          return {
            plants,
            coins:
              state.coins +
              (levelUpRewards?.coins ?? 0) +
              (matureReward?.coins ?? 0),
            fertilizers:
              state.fertilizers +
              (levelUpRewards?.fertilizers ?? 0) +
              (matureReward?.fertilizers ?? 0),
            growthLevel: growthProgress.level,
            growthXp: growthProgress.xp,
            ...(levelUpRewards ? { levelUpRewards } : {}),
            lastWaterDate: today,
            matureRewardClaimedPlantIds: matureReward
              ? [...state.matureRewardClaimedPlantIds, matureReward.plantId]
              : state.matureRewardClaimedPlantIds,
            ...getBadgeUpdate({
              ...state,
              growthLevel: growthProgress.level,
              plants,
            }),
          };
        }),
      resetGarden: () => set(initialState),
    }),
    {
      name: 'number-garden-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GardenState> | undefined;
        const ownedPlantIds =
          persisted?.ownedPlantIds && persisted.ownedPlantIds.length > 0
            ? Array.from(new Set(['succulent', ...persisted.ownedPlantIds]))
            : currentState.ownedPlantIds;
        const selectedPlantId =
          persisted?.selectedPlantId &&
          ownedPlantIds.includes(persisted.selectedPlantId)
            ? persisted.selectedPlantId
            : currentState.selectedPlantId;
        const lastTaskRefreshDate =
          persisted?.lastTaskRefreshDate ??
          persisted?.currentTaskDate ??
          currentState.lastTaskRefreshDate;
        const todayTasks =
          persisted?.todayTasks && persisted.todayTasks.length > 0
            ? persisted.todayTasks
            : currentState.todayTasks;

        return {
          ...currentState,
          ...persisted,
          lastTaskRefreshDate,
          todayTasks,
          ownedPlantIds,
          selectedPlantId,
          plants: {
            ...currentState.plants,
            ...Object.fromEntries(
              Object.entries(persisted?.plants ?? {}).map(([plantId, plant]) => [
                plantId,
                {
                  ...currentState.plants[plantId],
                  ...plant,
                  matureIcon:
                    currentState.plants[plantId]?.matureIcon ??
                    plant.matureIcon,
                  unlockCost:
                    currentState.plants[plantId]?.unlockCost ??
                    plant.unlockCost,
                },
              ]),
            ),
          },
        };
      },
      onRehydrateStorage: () => {
        if (__DEV__) {
          console.log('Number Garden storage hydration started.');
        }

        return (state, error) => {
          if (error && __DEV__) {
            console.log('Number Garden storage hydration failed.', error);
            return;
          }

          if (__DEV__) {
            console.log('Number Garden storage hydration finished.', state);
          }

          state?.refreshDailyTasksForToday();
        };
      },
    },
  ),
);
