import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type GardenState = {
  coins: number;
  fertilizers: number;
  currentTitle: string;
  selectedPlantId: string;
  ownedPlantIds: string[];
  completedTodayTaskIds: string[];
  unlockedBadgeIds: string[];
  collectedItemIds: string[];
  resetGarden: () => void;
};

const initialState = {
  coins: 0,
  fertilizers: 0,
  currentTitle: '成长小种子',
  selectedPlantId: 'succulent',
  ownedPlantIds: ['succulent'],
  completedTodayTaskIds: [],
  unlockedBadgeIds: [],
  collectedItemIds: [],
};

export const useGardenStore = create<GardenState>()(
  persist(
    (set) => ({
      ...initialState,
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
