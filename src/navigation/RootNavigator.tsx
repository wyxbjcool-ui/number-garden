import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
      }}
    >
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: '数字花园' }}
      />
    </Stack.Navigator>
  );
}
