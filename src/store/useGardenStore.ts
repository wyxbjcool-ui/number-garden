import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DailyTask } from '../types/dailyTask';
import type { Plant } from '../types/plant';

const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
  completeDailyTask: (task: DailyTask) => void;
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
            return {
              coins: state.coins + task.rewardCoins,
              fertilizers: state.fertilizers + task.rewardFertilizers,
              completedTodayTaskIds: [...state.completedTodayTaskIds, task.id],
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

          return {
            coins: state.coins + task.rewardCoins,
            fertilizers: state.fertilizers + task.rewardFertilizers,
            completedTodayTaskIds: [...state.completedTodayTaskIds, task.id],
            plants: {
              ...state.plants,
              [plant.id]: nextPlant,
            },
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

          return {
            plants: {
              ...state.plants,
              [plant.id]: nextPlant,
            },
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
