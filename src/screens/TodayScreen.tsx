import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';

export function TodayScreen() {
  const title = useGardenStore((state) => state.currentTitle);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.iconBubble}>
          <Ionicons name="leaf" size={56} color={Colors.leaf} />
        </View>
        <Text style={styles.title}>数字花园 Number Garden</Text>
        <Text style={styles.subtitle}>帮助孩子养成好习惯的成长游戏</Text>
        <Text style={styles.badge}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGreen,
    borderWidth: 4,
    borderColor: Colors.lightYellow,
  },
  title: {
    color: Colors.headerText,
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.bodyText,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.lightBlue,
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '700',
  },
});
