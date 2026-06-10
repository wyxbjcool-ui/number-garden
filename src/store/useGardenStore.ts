import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import type { DailyTask } from '../types/dailyTask';
import type { MathGame } from '../types/mathGame';
import type { Plant } from '../types/plant';

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

type GardenState = {
  coins: number;
  fertilizers: number;
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
  answerMathQuestion: (question: MathGame, selectedOptionId: string) => void;
  refreshDailyTasksForToday: () => void;
  waterSelectedPlant: () => void;
  resetGarden: () => void;
};

const initialState = {
  coins: 0,
  fertilizers: 0,
  currentTitle: '成长小种子',
  currentTaskDate: '',
  selectedPlantId: 'succulent',
  plants: {
    succulent: {
      id: 'succulent',
      name: '多肉',
      level: 1,
      xp: 0,
      waterCount: 0,
    },
  },
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
              completedTodayTaskIds,
              collectedItemIds,
              unlockedBadgeIds: getNextUnlockedBadgeIds({
                ...state,
                completedTodayTaskIds,
              }),
            };
          }

          const totalXp = plant.xp + 10;
          const levelGain = Math.floor(totalXp / 100);
          const nextPlant = {
            ...plant,
            level: plant.level + levelGain,
            xp: totalXp % 100,
            waterCount: plant.waterCount + 1,
          };

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
      answerMathQuestion: (question, selectedOptionId) =>
        set((state) => {
          if (state.answeredMathQuestionIds.includes(question.id)) {
            return state;
          }

          const answeredMathQuestionIds = [
            ...state.answeredMathQuestionIds,
            question.id,
          ];
          const isCorrect = selectedOptionId === question.correctOptionId;

          if (!isCorrect) {
            return {
              answeredMathQuestionIds,
            };
          }

          const plant = state.plants[state.selectedPlantId];

          if (!plant) {
            return {
              coins: state.coins + 3,
              fertilizers: state.fertilizers + 1,
              answeredMathQuestionIds,
            };
          }

          const totalXp = plant.xp + 10;
          const levelGain = Math.floor(totalXp / 100);
          const nextPlant = {
            ...plant,
            level: plant.level + levelGain,
            xp: totalXp % 100,
            waterCount: plant.waterCount + 1,
          };
          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };

          return {
            coins: state.coins + 3,
            fertilizers: state.fertilizers + 1,
            answeredMathQuestionIds,
            plants,
            unlockedBadgeIds: getNextUnlockedBadgeIds({
              ...state,
              plants,
            }),
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

          const totalXp = plant.xp + 10;
          const levelGain = Math.floor(totalXp / 100);
          const nextPlant = {
            ...plant,
            level: plant.level + levelGain,
            xp: totalXp % 100,
            waterCount: plant.waterCount + 1,
          };

          const plants = {
            ...state.plants,
            [plant.id]: nextPlant,
          };

          return {
            plants,
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
