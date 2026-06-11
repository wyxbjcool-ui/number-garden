import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { avatarModeIds, avatarModes } from '../data/avatarModes';
import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import { mathGames } from '../data/mathGames';
import { plantIds, plants as plantCatalog } from '../data/plants';
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
  const [lastMathResult, setLastMathResult] = useState<
    'correct' | 'incorrect' | null
  >(null);
  const title = useGardenStore((state) => state.currentTitle);
  const coins = useGardenStore((state) => state.coins);
  const fertilizers = useGardenStore((state) => state.fertilizers);
  const growthLevel = useGardenStore((state) => state.growthLevel);
  const growthXp = useGardenStore((state) => state.growthXp);
  const avatarMode = useGardenStore((state) => state.avatarMode);
  const selectedPlantId = useGardenStore((state) => state.selectedPlantId);
  const plant = useGardenStore((state) => state.plants[state.selectedPlantId]);
  const plants = useGardenStore((state) => state.plants);
  const ownedPlantIds = useGardenStore((state) => state.ownedPlantIds);
  const completedTodayTaskIds = useGardenStore(
    (state) => state.completedTodayTaskIds,
  );
  const unlockedBadgeIds = useGardenStore((state) => state.unlockedBadgeIds);
  const collectedItemIds = useGardenStore((state) => state.collectedItemIds);
  const answeredMathQuestionIds = useGardenStore(
    (state) => state.answeredMathQuestionIds,
  );
  const completeDailyTask = useGardenStore((state) => state.completeDailyTask);
  const answerMathQuestion = useGardenStore((state) => state.answerMathQuestion);
  const selectPlant = useGardenStore((state) => state.selectPlant);
  const setAvatarMode = useGardenStore((state) => state.setAvatarMode);
  const unlockPlant = useGardenStore((state) => state.unlockPlant);
  const refreshDailyTasksForToday = useGardenStore(
    (state) => state.refreshDailyTasksForToday,
  );
  const waterSelectedPlant = useGardenStore((state) => state.waterSelectedPlant);
  const xpPercent = plant ? plant.xp / 100 : 0;
  const currentMathQuestion = mathGames.find(
    (question) => !answeredMathQuestionIds.includes(question.id),
  );
  const avatarModeConfig = avatarModes[avatarMode];
  const avatarActionText =
    avatarMode === 'garden'
      ? `${avatarModeConfig.actionLabel}，让它长大`
      : avatarMode === 'pet'
        ? `${avatarModeConfig.actionLabel}，让它开心`
        : `${avatarModeConfig.actionLabel}，让魔法变亮`;
  const formatRarity = (rarity: 'common' | 'rare') =>
    rarity === 'rare' ? '稀有' : '普通';

  useEffect(() => {
    refreshDailyTasksForToday();
  }, [refreshDailyTasksForToday]);

  useEffect(() => {
    setLastMathResult(null);
  }, [currentMathQuestion?.id]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.resourceRow}>
        <View style={styles.resourcePill}>
          <Ionicons name="logo-bitcoin" size={22} color={Colors.headerText} />
          <Text style={styles.resourceText}>金币 {coins}</Text>
        </View>
        <View style={styles.resourcePill}>
          <Ionicons name="flower" size={22} color={Colors.headerText} />
          <Text style={styles.resourceText}>肥料 {fertilizers}</Text>
        </View>
      </View>
      <View style={styles.modeSwitcher}>
        {avatarModeIds.map((mode) => {
          const isSelected = avatarMode === mode;

          return (
            <Pressable
              key={mode}
              style={[
                styles.modeButton,
                isSelected && styles.modeButtonSelected,
              ]}
              onPress={() => setAvatarMode(mode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  isSelected && styles.modeButtonTextSelected,
                ]}
              >
                {avatarModes[mode].name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.hero}>
        <View style={styles.iconBubble}>
          <Ionicons name="leaf" size={56} color={Colors.leaf} />
        </View>
        <Text style={styles.title}>数字花园 Number Garden</Text>
        <Text style={styles.subtitle}>帮助孩子养成好习惯的成长游戏</Text>
        <View style={styles.growthPanel}>
          <Text style={styles.growthText}>成长等级 第 {growthLevel} 级</Text>
          <Text style={styles.growthText}>成长值 {growthXp}/100</Text>
        </View>
        <Text style={styles.badge}>{title}</Text>
      </View>
      {plant ? (
        <View style={styles.plantPanel}>
          <View style={styles.plantHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>{avatarModeConfig.name}</Text>
              <Text style={styles.plantName}>{avatarModeConfig.title}</Text>
              <Text style={styles.plantMeta}>{avatarModeConfig.subtitle}</Text>
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
            {avatarModeConfig.growthLabel} {growthXp}/100 · 成长第{' '}
            {growthLevel} 级
          </Text>
          <Text style={styles.plantMeta}>
            {plant.name} · 植物第 {plant.level} 级 · 浇水 {plant.waterCount} 次
          </Text>
          <Pressable style={styles.waterButton} onPress={waterSelectedPlant}>
            <Ionicons name="water" size={24} color={Colors.headerText} />
            <Text style={styles.waterButtonText}>{avatarActionText}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.plantMeta}>未找到植物：{selectedPlantId}</Text>
      )}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>植物图鉴</Text>
          <Text style={styles.sectionCount}>
            {ownedPlantIds.length}/{plantIds.length}
          </Text>
        </View>
        <View style={styles.plantList}>
          {plantIds.map((plantId) => {
            const catalogPlant = plantCatalog[plantId];
            const gardenPlant = plants[plantId] ?? catalogPlant;
            const isOwned = ownedPlantIds.includes(plantId);
            const isSelected = selectedPlantId === plantId;
            const canUnlock = !isOwned && coins >= catalogPlant.unlockCost;
            const plantActionLabel = isOwned
              ? isSelected
                ? '使用中'
                : '切换'
              : canUnlock
                ? '解锁'
                : '金币不足';

            return (
              <Pressable
                key={plantId}
                style={[
                  styles.plantListCard,
                  isSelected && styles.plantListCardSelected,
                  !isOwned && styles.plantListCardLocked,
                ]}
                disabled={!isOwned && !canUnlock}
                onPress={() => {
                  if (isOwned) {
                    selectPlant(plantId);
                    return;
                  }

                  unlockPlant(plantId);
                }}
              >
                <View style={styles.plantListIcon}>
                  <Ionicons
                    name={isOwned ? 'leaf' : canUnlock ? 'key' : 'lock-closed'}
                    size={22}
                    color={isOwned ? Colors.headerText : Colors.bodyText}
                  />
                </View>
                <Text style={styles.plantListName}>{catalogPlant.name}</Text>
                <Text style={styles.plantListMeta}>
                  {isOwned
                    ? `第 ${gardenPlant.level} 级`
                    : `${catalogPlant.unlockCost} 金币`}
                </Text>
                <Text style={styles.plantListAction}>{plantActionLabel}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日任务</Text>
          <Text style={styles.sectionCount}>
            {completedTodayTaskIds.length}/{dailyTasks.length}
          </Text>
        </View>
        {dailyTasks.map((task) => {
          const isCompleted = completedTodayTaskIds.includes(task.id);

          return (
            <View
              key={task.id}
              style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
            >
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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>数字小游戏</Text>
          <Text style={styles.sectionCount}>
            {answeredMathQuestionIds.length}/{mathGames.length}
          </Text>
        </View>
        {currentMathQuestion ? (
          <View style={styles.mathCard}>
            <Text style={styles.mathQuestion}>
              {currentMathQuestion.question}
            </Text>
            <View style={styles.mathOptionList}>
              {currentMathQuestion.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.mathOptionButton}
                  onPress={() => {
                    const isCorrect =
                      option.id === currentMathQuestion.correctOptionId;

                    answerMathQuestion(currentMathQuestion, option.id);
                    setLastMathResult(isCorrect ? 'correct' : 'incorrect');
                  }}
                >
                  <Text style={styles.mathOptionText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            {lastMathResult ? (
              <Text style={styles.mathFeedback}>
                {lastMathResult === 'correct' ? '答对了' : '再试试'}
              </Text>
            ) : (
              <Text style={styles.mathReward}>答对 +3 金币 · +1 肥料</Text>
            )}
          </View>
        ) : (
          <View style={styles.mathCard}>
            <Text style={styles.mathQuestion}>今天的题目都完成啦</Text>
            <Text style={styles.mathReward}>小脑袋亮晶晶</Text>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>徽章</Text>
          <Text style={styles.sectionCount}>
            {unlockedBadgeIds.length}/{badges.length}
          </Text>
        </View>
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
                    name={badge.iconName}
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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>收集册</Text>
          <Text style={styles.sectionCount}>
            {collectedItemIds.length}/{collectionItems.length}
          </Text>
        </View>
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
                  {isCollected ? formatRarity(item.rarity) : '未获得'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    gap: 18,
    padding: 24,
    paddingBottom: 36,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
  growthPanel: {
    alignItems: 'center',
    borderRadius: 24,
    gap: 6,
    backgroundColor: Colors.lightYellow,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  growthText: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '800',
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
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  resourcePill: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minWidth: 128,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  resourceText: {
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: '800',
  },
  modeSwitcher: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.lightYellow,
    minHeight: 48,
    minWidth: 88,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modeButtonSelected: {
    backgroundColor: Colors.lightBlue,
    borderColor: Colors.leaf,
    borderWidth: 2,
  },
  modeButtonText: {
    color: Colors.bodyText,
    fontSize: 17,
    fontWeight: '800',
  },
  modeButtonTextSelected: {
    color: Colors.headerText,
  },
  plantPanel: {
    gap: 16,
    borderRadius: 24,
    backgroundColor: Colors.lightGreen,
    borderWidth: 3,
    borderColor: Colors.lightYellow,
    padding: 20,
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
  sectionEyebrow: {
    color: Colors.leaf,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
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
  plantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  plantListCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: 20,
    gap: 6,
    minWidth: 118,
    padding: 12,
  },
  plantListCardSelected: {
    borderColor: Colors.leaf,
    borderWidth: 3,
  },
  plantListCardLocked: {
    opacity: 0.45,
  },
  plantListIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  plantListName: {
    color: Colors.headerText,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  plantListMeta: {
    color: Colors.bodyText,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  plantListAction: {
    color: Colors.leaf,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
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
  section: {
    gap: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.headerText,
    fontSize: 24,
    fontWeight: '800',
  },
  sectionCount: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.lightBlue,
    color: Colors.headerText,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  taskCardCompleted: {
    opacity: 0.58,
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
    minHeight: 56,
    minWidth: 98,
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
  mathCard: {
    gap: 14,
    borderRadius: 22,
    backgroundColor: Colors.lightYellow,
    padding: 16,
  },
  mathQuestion: {
    color: Colors.headerText,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  mathOptionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  mathOptionButton: {
    alignItems: 'center',
    borderRadius: 22,
    justifyContent: 'center',
    minHeight: 54,
    minWidth: 86,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 18,
  },
  mathOptionText: {
    color: Colors.headerText,
    fontSize: 20,
    fontWeight: '800',
  },
  mathFeedback: {
    color: Colors.leaf,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  mathReward: {
    color: Colors.bodyText,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeList: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 12,
  },
  badgeCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderRadius: 20,
    flex: 1,
    gap: 6,
    minWidth: 118,
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
    flexGrow: 1,
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
