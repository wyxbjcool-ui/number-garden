import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useGardenStore } from './src/store/useGardenStore';

function StartupDailyRefresh() {
  useEffect(() => {
    const refreshDailyTasksForToday = () => {
      useGardenStore.getState().refreshDailyTasksForToday();
    };

    if (useGardenStore.persist.hasHydrated()) {
      refreshDailyTasksForToday();
    }

    return useGardenStore.persist.onFinishHydration(refreshDailyTasksForToday);
  }, []);

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StartupDailyRefresh />
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
