# Preview Guide

## Start The Project

1. Open a terminal in the project folder:

```sh
cd /Users/fine/Documents/宝宝花园/number-garden
```

2. Install dependencies if this is the first run:

```sh
npm install
```

3. Start Expo:

```sh
npx expo start
```

The terminal will show a QR code and preview options.

## Preview With Expo Go

1. Install Expo Go on the iPad or phone.
2. Make sure the device and computer are on the same Wi-Fi network.
3. Run:

```sh
npx expo start
```

4. Scan the QR code:
   - iOS: use the Camera app.
   - Android: use the Expo Go scanner.
5. Wait for the app bundle to load.

If the device cannot connect, restart with localhost or tunnel mode:

```sh
npx expo start --tunnel
```

## Open In iOS Simulator

1. Make sure Xcode and iOS Simulator are installed.
2. Start Expo:

```sh
npx expo start
```

3. Press `i` in the Expo terminal.

You can also run:

```sh
npx expo start --ios
```

## Open In Android Emulator

1. Make sure Android Studio and an Android Emulator are installed.
2. Start the Android Emulator.
3. Start Expo:

```sh
npx expo start
```

4. Press `a` in the Expo terminal.

You can also run:

```sh
npx expo start --android
```

## Troubleshooting

- If dependencies are missing, run `npm install`.
- If Expo cannot start, try clearing the cache with `npx expo start --clear`.
- If Expo Go cannot scan or connect, confirm the device and computer are on the same Wi-Fi.
- If Wi-Fi preview fails, try `npx expo start --tunnel`.
- If the iOS Simulator does not open, confirm Xcode is installed and the simulator can launch by itself.
- If the Android Emulator does not open, confirm Android Studio is installed and an emulator is already running.
- If the app shows stale data, close and reopen Expo Go. The app intentionally persists local progress with AsyncStorage.
