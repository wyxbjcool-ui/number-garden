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

## Boundaries

- No backend in MVP V1.
- No authentication in MVP V1.
- No cloud sync in MVP V1.
- No payment or ads in MVP V1.
- No server-time validation.
- No badge reward payouts yet.
- No random collection drop logic yet.
- No complex animation layer.
