import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { DailyTask } from '../types/dailyTask';

const dailyTasks: DailyTask[] = [
  {
    id: 'pack-school-bag',
    title: '整理书包',
    description: '把明天要用的东西放好',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
  {
    id: 'read-10-minutes',
    title: '阅读 10 分钟',
    description: '安静读一本喜欢的书',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
  {
    id: 'early-bedtime',
    title: '早睡打卡',
    description: '睡前准备完成啦',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
];

export function TodayScreen() {
  const title = useGardenStore((state) => state.currentTitle);
  const coins = useGardenStore((state) => state.coins);
  const fertilizers = useGardenStore((state) => state.fertilizers);
  const selectedPlantId = useGardenStore((state) => state.selectedPlantId);
  const plant = useGardenStore((state) => state.plants[state.selectedPlantId]);
  const completedTodayTaskIds = useGardenStore(
    (state) => state.completedTodayTaskIds,
  );
  const unlockedBadgeIds = useGardenStore((state) => state.unlockedBadgeIds);
  const collectedItemIds = useGardenStore((state) => state.collectedItemIds);
  const completeDailyTask = useGardenStore((state) => state.completeDailyTask);
  const refreshDailyTasksForToday = useGardenStore(
    (state) => state.refreshDailyTasksForToday,
  );
  const waterSelectedPlant = useGardenStore((state) => state.waterSelectedPlant);
  const xpPercent = plant ? plant.xp / 100 : 0;

  useEffect(() => {
    refreshDailyTasksForToday();
  }, [refreshDailyTasksForToday]);

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
      <View style={styles.resourceRow}>
        <Text style={styles.resourceText}>金币 {coins}</Text>
        <Text style={styles.resourceText}>肥料 {fertilizers}</Text>
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
      <View style={styles.taskSection}>
        <Text style={styles.sectionTitle}>今日任务</Text>
        {dailyTasks.map((task) => {
          const isCompleted = completedTodayTaskIds.includes(task.id);

          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <Text style={styles.taskReward}>
                  +{task.rewardCoins} 金币 · +{task.rewardFertilizers} 肥料
                </Text>
              </View>
              <Pressable
                style={[
                  styles.taskButton,
                  isCompleted && styles.taskButtonCompleted,
                ]}
                disabled={isCompleted}
                onPress={() => completeDailyTask(task)}
              >
                <Text
                  style={[
                    styles.taskButtonText,
                    isCompleted && styles.taskButtonTextCompleted,
                  ]}
                >
                  {isCompleted ? '已完成' : '完成'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={styles.badgeSection}>
        <Text style={styles.sectionTitle}>
          徽章 {unlockedBadgeIds.length}/{badges.length}
        </Text>
        <View style={styles.badgeList}>
          {badges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <View
                key={badge.id}
                style={[styles.badgeCard, !isUnlocked && styles.badgeLocked]}
              >
                <View style={styles.badgeIcon}>
                  <Ionicons
                    name={badge.iconName as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={isUnlocked ? Colors.headerText : Colors.bodyText}
                  />
                </View>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.collectionSection}>
        <Text style={styles.sectionTitle}>
          收集册 {collectedItemIds.length}/{collectionItems.length}
        </Text>
        <View style={styles.collectionList}>
          {collectionItems.map((item) => {
            const isCollected = collectedItemIds.includes(item.id);

            return (
              <View
                key={item.id}
                style={[
                  styles.collectionCard,
                  !isCollected && styles.collectionLocked,
                ]}
              >
                <View style={styles.collectionIcon}>
                  <Ionicons
                    name={item.iconName}
                    size={24}
                    color={isCollected ? Colors.headerText : Colors.bodyText}
                  />
                </View>
                <Text style={styles.collectionName}>
                  {isCollected ? item.name : '？？？'}
                </Text>
                <Text style={styles.collectionMeta}>
                  {isCollected ? item.rarity : '未获得'}
                </Text>
              </View>
            );
          })}
        </View>
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
  resourceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resourceText: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.lightBlue,
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingVertical: 10,
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
  taskSection: {
    gap: 12,
    marginTop: 18,
  },
  sectionTitle: {
    color: Colors.headerText,
    fontSize: 24,
    fontWeight: '800',
  },
  taskCard: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    backgroundColor: Colors.lightYellow,
    padding: 16,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    color: Colors.headerText,
    fontSize: 20,
    fontWeight: '800',
  },
  taskDescription: {
    color: Colors.bodyText,
    fontSize: 15,
    fontWeight: '700',
  },
  taskReward: {
    color: Colors.leaf,
    fontSize: 15,
    fontWeight: '800',
  },
  taskButton: {
    alignItems: 'center',
    borderRadius: 22,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 92,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 16,
  },
  taskButtonCompleted: {
    backgroundColor: Colors.lightGreen,
  },
  taskButtonText: {
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: '800',
  },
  taskButtonTextCompleted: {
    color: Colors.bodyText,
  },
  badgeSection: {
    gap: 12,
    marginTop: 18,
  },
  badgeList: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderRadius: 20,
    flex: 1,
    gap: 6,
    padding: 12,
  },
  badgeLocked: {
    opacity: 0.45,
  },
  badgeIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  badgeTitle: {
    color: Colors.headerText,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  badgeDescription: {
    color: Colors.bodyText,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  collectionSection: {
    gap: 12,
    marginTop: 18,
  },
  collectionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  collectionCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: 20,
    gap: 6,
    minWidth: 96,
    padding: 12,
  },
  collectionLocked: {
    opacity: 0.45,
  },
  collectionIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  collectionName: {
    color: Colors.headerText,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  collectionMeta: {
    color: Colors.bodyText,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
