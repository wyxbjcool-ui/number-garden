import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import { plants as initialPlants } from '../data/plants';
import type { DailyTask } from '../types/dailyTask';
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
  completedTodayTaskIds: string[];
  plants: Record<string, Plant>;
  unlockedBadgeIds: string[];
};

const getNextUnlockedBadgeIds = (state: BadgeCheckState) => {
  const nextUnlockedBadgeIds = new Set(state.unlockedBadgeIds);
  const plantList = Object.values(state.plants);
  const hasCompletedTask = state.completedTodayTaskIds.length > 0;
  const hasLevelTwoPlant = plantList.some((plant) => plant.level >= 2);
  const totalWaterCount = plantList.reduce(
    (sum, plant) => sum + plant.waterCount,
    0,
  );

  badges.forEach((badge) => {
    if (badge.id === 'first-task' && hasCompletedTask) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'level-2-plant' && hasLevelTwoPlant) {
      nextUnlockedBadgeIds.add(badge.id);
    }

    if (badge.id === 'three-waters' && totalWaterCount >= 3) {
      nextUnlockedBadgeIds.add(badge.id);
    }
  });

  return Array.from(nextUnlockedBadgeIds);
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

const growGlobalByXp = (
  growthLevel: number,
  growthXp: number,
  xpAmount: number,
) => {
  const totalXp = growthXp + xpAmount;
  const levelGain = Math.floor(totalXp / 100);

  return {
    growthLevel: growthLevel + levelGain,
    growthXp: totalXp % 100,
  };
};

type GardenState = {
  coins: number;
  fertilizers: number;
  growthXp: number;
  growthLevel: number;
  avatarMode: AvatarMode;
  currentTitle: string;
  currentTaskDate: string;
  selectedPlantId: string;
  plants: Record<string, Plant>;
  ownedPlantIds: string[];
  completedTodayTaskIds: string[];
  unlockedBadgeIds: string[];
  collectedItemIds: string[];
  answeredMathQuestionIds: string[];
  completeDailyTask: (task: DailyTask) => void;
  addGrowthXp: (amount: number) => void;
  setAvatarMode: (mode: AvatarMode) => void;
  answerMathQuestion: (question: MathGame, selectedOptionId: string) => void;
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
  avatarMode: 'garden' as AvatarMode,
  currentTitle: '成长小种子',
  currentTaskDate: '',
  selectedPlantId: 'succulent',
  plants: initialPlants,
  ownedPlantIds: ['succulent'],
  completedTodayTaskIds: [],
  unlockedBadgeIds: [],
  collectedItemIds: [],
  answeredMathQuestionIds: [],
};

export const useGardenStore = create<GardenState>()(
  persist(
    (set) => ({
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

          if (!plant) {
            const completedTodayTaskIds = [
              ...state.completedTodayTaskIds,
              task.id,
            ];
            const collectedItemIds = getNextCollectedItemIds(
              state.collectedItemIds,
            );

            return {
              coins: state.coins + task.rewardCoins,
              fertilizers: state.fertilizers + task.rewardFertilizers,
              ...growthProgress,
              completedTodayTaskIds,
              collectedItemIds,
              unlockedBadgeIds: getNextUnlockedBadgeIds({
                ...state,
                completedTodayTaskIds,
              }),
            };
          }

          const nextPlant = growPlantByXp(plant, 10, { countAsWater: true });

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
            coins: state.coins + task.rewardCoins,
            fertilizers: state.fertilizers + task.rewardFertilizers,
            ...growthProgress,
            completedTodayTaskIds,
            collectedItemIds,
            plants,
            unlockedBadgeIds: getNextUnlockedBadgeIds({
              ...state,
              completedTodayTaskIds,
              plants,
            }),
          };
        }),
      addGrowthXp: (amount) =>
        set((state) =>
          growGlobalByXp(state.growthLevel, state.growthXp, amount),
        ),
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

          if (!plant) {
            return {
              coins: state.coins + 3,
              fertilizers: state.fertilizers + 1,
              ...growthProgress,
              answeredMathQuestionIds,
            };
          }

          const nextPlant = growPlantByXp(plant, 10, { countAsWater: false });
          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };

          return {
            coins: state.coins + 3,
            fertilizers: state.fertilizers + 1,
            ...growthProgress,
            answeredMathQuestionIds,
            plants,
            unlockedBadgeIds: getNextUnlockedBadgeIds({
              ...state,
              plants,
            }),
          };
        }),
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

          return {
            coins: state.coins - plant.unlockCost,
            ownedPlantIds: [...state.ownedPlantIds, plantId],
            selectedPlantId: plantId,
          };
        }),
      refreshDailyTasksForToday: () =>
        set((state) => {
          const today = getLocalDateString();

          if (state.currentTaskDate === today) {
            return state;
          }

          return {
            currentTaskDate: today,
            completedTodayTaskIds: [],
          };
        }),
      waterSelectedPlant: () =>
        set((state) => {
          const plant = state.plants[state.selectedPlantId];

          if (!plant) {
            return state;
          }

          const nextPlant = growPlantByXp(plant, 10, { countAsWater: true });
          const growthProgress = growGlobalByXp(
            state.growthLevel,
            state.growthXp,
            10,
          );

          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };

          return {
            plants,
            ...growthProgress,
            unlockedBadgeIds: getNextUnlockedBadgeIds({
              ...state,
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

        return {
          ...currentState,
          ...persisted,
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
        };
      },
    },
  ),
);
