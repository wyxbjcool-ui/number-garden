# Number Garden

数字花园 Number Garden is a local-first habit and growth game for children ages 4-8.

The app is built with Expo, React Native, TypeScript, Zustand, AsyncStorage, React Navigation, and Expo Vector Icons. The MVP runs locally only. There is no login, backend, cloud sync, payment, or advertising.

## Current Features

- Game-style home screen with illustrated background, central character, feature buttons, and light animations.
- Coins and fertilizers.
- Daily tasks with local date reset.
- Plant growth with XP, levels, and watering count.
- Global growth level with level-up rewards.
- Plant almanac with five plants, selection, coin-based unlocking, fertilizer feeding, stages, and maturity rewards.
- Poop time once-per-day check-in with rewards.
- Gacha machine with rarity odds, coin cost, duplicate conversion, and collection rewards.
- Gacha collection screen grouped by rarity.
- Badge achievement system with dedicated badge screen and home unlock notice.
- Math mini-game with retryable incorrect answers.
- Local persistence through AsyncStorage.

## Start

Install dependencies:

```sh
npm install
```

Start Expo:

```sh
npx expo start
```

## Preview

- Expo Go: scan the QR code shown by `npx expo start`.
- iOS Simulator: press `i` in the Expo terminal, or run `npx expo start --ios`.
- Android Emulator: press `a` in the Expo terminal, or run `npx expo start --android`.

More details are in `PREVIEW_GUIDE.md`.

## Checks

Run TypeScript validation:

```sh
npx tsc --noEmit
```

Show Expo start options:

```sh
npx expo start --help
```
