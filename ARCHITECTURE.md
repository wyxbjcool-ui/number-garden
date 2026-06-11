# Architecture

## Stack

- Expo
- React Native
- TypeScript
- Zustand
- AsyncStorage
- React Navigation
- Expo Vector Icons

## App Shape

The app is local-first. All MVP data is stored on the device through Zustand persistence backed by AsyncStorage.

## Current Folders

- `src/navigation`: App navigation.
- `src/screens`: Screen components.
- `src/store`: Zustand state and actions.
- `src/types`: Shared TypeScript types.
- `src/theme.ts`: Shared visual constants.

## State Direction

The global store owns lightweight MVP state such as coins, fertilizers, title, selected plant, owned plants, badges, collected items, and today's completed task IDs.

Plant growth in Step 2 starts as a single-plant model stored inside the global Zustand store. The selected plant has a level, XP, and water count. Future steps can expand the model into multi-plant collections without introducing a backend.

Daily tasks in Step 3 are defined as local static data on the Today screen. Completing a task updates the global store atomically: coins, fertilizers, completed task IDs, and selected plant growth are persisted together.

The active task date is stored as a local `YYYY-MM-DD` value. When TodayScreen mounts, the store compares `currentTaskDate` with the device's current local date and clears only `completedTodayTaskIds` if the date changed.

Badges in Step 4 are defined as local static data. The Zustand store checks badge conditions after task completion and plant watering, then persists unlocked badge IDs.

Collection items in Step 5 are defined as local static data. Completing a daily task grants the next uncollected item in list order and persists collected item IDs in the global store.

Step 6 is a presentation-only Today screen polish. It keeps the existing store and business rules intact while making the home screen scrollable and visually clearer.

Math games in Step 9 are defined as local static data. The Zustand store persists answered question IDs and applies correct-answer rewards atomically with plant growth.

Plants in Step 10 are defined as local static data. Zustand stores per-plant growth state, owned plant IDs, and the selected plant ID. Persisted state is merged with the current built-in plant catalog so existing succulent progress is retained while new built-in plants are added.

Plant unlocks in Step 11 use local coin costs on the Plant model. The store validates ownership, coin balance, and plant existence before subtracting coins, appending to ownedPlantIds, and selecting the unlocked plant.

Step 17 adds a unified growth layer to prepare for later garden, pet, or sprite main-character modes. `growthXp` and `growthLevel` live in the same persisted Zustand store. Watering, daily tasks, and correct math answers add global growth while existing per-plant level and XP data remains in place for compatibility.

## Boundaries

- No backend in MVP V1.
- No authentication in MVP V1.
- No cloud sync in MVP V1.
- No payment or ads in MVP V1.
- No server-time validation.
- No badge reward payouts yet.
- No random collection drop logic yet.
- No complex animation layer.
- No generated math question engine yet.
- No advanced plant shop or unlock conditions yet.
- No global growth badges yet.
- No garden, pet, or sprite mode switching yet.
