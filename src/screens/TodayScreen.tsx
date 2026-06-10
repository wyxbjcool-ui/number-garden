import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';

export function TodayScreen() {
  const title = useGardenStore((state) => state.currentTitle);
  const selectedPlantId = useGardenStore((state) => state.selectedPlantId);
  const plant = useGardenStore((state) => state.plants[state.selectedPlantId]);
  const waterSelectedPlant = useGardenStore((state) => state.waterSelectedPlant);
  const xpPercent = plant ? plant.xp / 100 : 0;

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
      {plant ? (
        <View style={styles.plantPanel}>
          <View style={styles.plantHeader}>
            <View>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantMeta}>Level {plant.level}</Text>
            </View>
            <View style={styles.plantIcon}>
              <Ionicons name="water" size={30} color={Colors.lightBlueText} />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { flex: xpPercent }]} />
            <View style={{ flex: 1 - xpPercent }} />
          </View>
          <Text style={styles.plantMeta}>
            XP {plant.xp}/100 · 浇水 {plant.waterCount} 次
          </Text>
          <Pressable style={styles.waterButton} onPress={waterSelectedPlant}>
            <Ionicons name="water" size={24} color={Colors.headerText} />
            <Text style={styles.waterButtonText}>浇水 +10 XP</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.plantMeta}>未找到植物：{selectedPlantId}</Text>
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 36,
    paddingBottom: 28,
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
  plantPanel: {
    gap: 14,
    borderRadius: 28,
    backgroundColor: Colors.lightGreen,
    borderWidth: 4,
    borderColor: Colors.lightYellow,
    padding: 22,
  },
  plantHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  plantIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.lightBlue,
  },
  plantName: {
    color: Colors.headerText,
    fontSize: 26,
    fontWeight: '800',
  },
  plantMeta: {
    color: Colors.bodyText,
    fontSize: 17,
    fontWeight: '700',
  },
  progressTrack: {
    height: 18,
    borderRadius: 9,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  progressFill: {
    backgroundColor: Colors.leaf,
  },
  waterButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    minHeight: 58,
    backgroundColor: Colors.lightBlue,
  },
  waterButtonText: {
    color: Colors.headerText,
    fontSize: 19,
    fontWeight: '800',
  },
});
