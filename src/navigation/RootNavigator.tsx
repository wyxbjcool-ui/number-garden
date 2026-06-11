import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CollectionScreen } from '../screens/CollectionScreen';
import { GachaScreen } from '../screens/GachaScreen';
import { PoopScreen } from '../screens/PoopScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { Colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Today"
      screenOptions={{
        contentStyle: { backgroundColor: Colors.background },
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.headerText,
        title: '数字花园',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: '数字花园' }}
      />
      <Stack.Screen
        name="Poop"
        component={PoopScreen}
        options={{ title: '粑粑时间' }}
      />
      <Stack.Screen
        name="Gacha"
        component={GachaScreen}
        options={{ title: '抽奖机' }}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={{ title: '收集册' }}
      />
    </Stack.Navigator>
  );
}
