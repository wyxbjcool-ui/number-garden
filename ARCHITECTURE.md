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

Plant growth in Step 2 starts as a single-plant model. Future steps can expand the model into multi-plant collections without introducing a backend.

## Boundaries

- No backend in MVP V1.
- No authentication in MVP V1.
- No cloud sync in MVP V1.
- No payment or ads in MVP V1.

