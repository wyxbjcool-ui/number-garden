import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType, LayoutChangeEvent } from 'react-native';

import { avatarModeIds, avatarModes } from '../data/avatarModes';
import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import { mathGames } from '../data/mathGames';
import { plantIds, plants as plantCatalog } from '../data/plants';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { DailyTask } from '../types/dailyTask';
import type { RootStackParamList } from '../types/navigation';
import type { Plant } from '../types/plant';

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

type SectionKey = 'plants' | 'tasks' | 'math' | 'badges' | 'collection';

type FeatureOrb = {
  id: string;
  title: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
};

const gameAssets = {
  background: require('../../assets/garden_bg.png'),
  catHappy: require('../../assets/cat_happy.png'),
  resourceCoin: require('../../assets/resource_coin.png'),
  resourceFertilizer: require('../../assets/resource_fertilizer.png'),
  taskButton: require('../../assets/btn_task.png'),
  mathButton: require('../../assets/btn_math.png'),
  poopButton: require('../../assets/btn_poop.png'),
  gachaButton: require('../../assets/btn_gacha.png'),
  collectionButton: require('../../assets/btn_collection.png'),
  badgeButton: require('../../assets/btn_badge.png'),
  growthPanelBackground: require('../../assets/growth_panel_bg.png'),
  progressTrack: require('../../assets/progress_track.png'),
  progressFill: require('../../assets/progress_fill.png'),
  rewardGift: require('../../assets/reward_gift.png'),
};

type PlantStage = 'seed' | 'sprout' | 'mature';

const getPlantStage = (level: number): PlantStage => {
  if (level >= 5) {
    return 'mature';
  }

  if (level >= 3) {
    return 'sprout';
  }

  return 'seed';
};

const getPlantStageLabel = (stage: PlantStage) => {
  if (stage === 'mature') {
    return '成熟';
  }

  if (stage === 'sprout') {
    return '幼苗';
  }

  return '种子';
};

const getPlantIcon = (currentPlant: Plant, stage: PlantStage) => {
  if (stage === 'mature') {
    return currentPlant.matureIcon;
  }

  if (stage === 'sprout') {
    return '🌱';
  }

  return '🌰';
};

export function TodayScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const catBreathAnim = useRef(new Animated.Value(0)).current;
  const giftPulseAnim = useRef(new Animated.Value(0)).current;
  const levelRewardGiftAnim = useRef(new Animated.Value(0)).current;
  const featurePressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const sectionOffsetsRef = useRef<Record<SectionKey, number>>(
    {} as Record<SectionKey, number>,
  );
  const [lastMathResult, setLastMathResult] = useState<
    'correct' | 'incorrect' | null
  >(null);
  const [pressedFeatureId, setPressedFeatureId] = useState<string | null>(null);
  const coins = useGardenStore((state) => state.coins);
  const fertilizers = useGardenStore((state) => state.fertilizers);
  const growthLevel = useGardenStore((state) => state.growthLevel);
  const growthXp = useGardenStore((state) => state.growthXp);
  const levelUpRewards = useGardenStore((state) => state.levelUpRewards);
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
  const dismissLevelUpRewards = useGardenStore(
    (state) => state.dismissLevelUpRewards,
  );
  const currentPlant = plant ?? plantCatalog.succulent;
  const xpPercent = currentPlant.xp / 100;
  const currentMathQuestion = mathGames.find(
    (question) => !answeredMathQuestionIds.includes(question.id),
  );
  const avatarModeConfig = avatarModes[avatarMode];
  const currentPlantStage = getPlantStage(currentPlant.level);
  const currentPlantStageLabel = getPlantStageLabel(currentPlantStage);
  const currentPlantIcon = getPlantIcon(currentPlant, currentPlantStage);
  const avatarActionText =
    avatarMode === 'garden'
      ? `${avatarModeConfig.actionLabel}，让它长大`
      : avatarMode === 'pet'
        ? `${avatarModeConfig.actionLabel}，让它开心`
        : `${avatarModeConfig.actionLabel}，让魔法变亮`;
  const sceneStyle =
    avatarMode === 'garden'
      ? styles.gardenScene
      : avatarMode === 'pet'
        ? styles.petScene
        : styles.spriteScene;
  const formatRarity = (rarity: 'common' | 'rare') =>
    rarity === 'rare' ? '稀有' : '普通';

  const handleSectionLayout =
    (sectionKey: SectionKey) => (event: LayoutChangeEvent) => {
      sectionOffsetsRef.current[sectionKey] = event.nativeEvent.layout.y;
    };

  const scrollToSection = (sectionKey: SectionKey) => {
    scrollViewRef.current?.scrollTo({
      y: Math.max((sectionOffsetsRef.current[sectionKey] ?? 0) - 16, 0),
      animated: true,
    });
  };

  const holdFeaturePressFeedback = (featureId: string) => {
    setPressedFeatureId(featureId);

    if (featurePressTimeoutRef.current) {
      clearTimeout(featurePressTimeoutRef.current);
    }

    featurePressTimeoutRef.current = setTimeout(() => {
      setPressedFeatureId(null);
      featurePressTimeoutRef.current = null;
    }, 180);
  };

  const catAnimatedStyle = {
    transform: [
      {
        translateY: catBreathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        scale: catBreathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.035],
        }),
      },
    ],
  };

  const giftAnimatedStyle = {
    opacity: giftPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.82, 1],
    }),
    transform: [
      {
        scale: giftPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.18],
        }),
      },
    ],
  };

  const featureOrbs: FeatureOrb[] = [
    {
      id: 'tasks',
      title: '今日任务',
      imageSource: gameAssets.taskButton,
      onPress: () => scrollToSection('tasks'),
    },
    {
      id: 'math',
      title: '数字小游戏',
      imageSource: gameAssets.mathButton,
      onPress: () => scrollToSection('math'),
    },
    {
      id: 'poop',
      title: '粑粑时间',
      imageSource: gameAssets.poopButton,
      onPress: () => navigation.navigate('Poop'),
    },
    {
      id: 'lottery',
      title: '抽奖机',
      imageSource: gameAssets.gachaButton,
      onPress: () => navigation.navigate('Gacha'),
    },
    {
      id: 'collection',
      title: '收集册',
      imageSource: gameAssets.collectionButton,
      onPress: () => navigation.navigate('Collection'),
    },
    {
      id: 'badges',
      title: '徽章',
      imageSource: gameAssets.badgeButton,
      onPress: () => scrollToSection('badges'),
    },
  ];

  const leftFeatureOrbs = featureOrbs.slice(0, 3);
  const rightFeatureOrbs = featureOrbs.slice(3);

  useEffect(() => {
    refreshDailyTasksForToday();
  }, [refreshDailyTasksForToday]);

  useEffect(() => {
    setLastMathResult(null);
  }, [currentMathQuestion?.id]);

  useEffect(() => {
    const catLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(catBreathAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: false,
        }),
        Animated.timing(catBreathAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: false,
        }),
      ]),
    );
    const giftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(giftPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(giftPulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
    );

    catLoop.start();
    giftLoop.start();

    return () => {
      catLoop.stop();
      giftLoop.stop();

      if (featurePressTimeoutRef.current) {
        clearTimeout(featurePressTimeoutRef.current);
      }
    };
  }, [catBreathAnim, giftPulseAnim]);

  useEffect(() => {
    if (!levelUpRewards) {
      levelRewardGiftAnim.setValue(0);
      return;
    }

    const levelGiftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(levelRewardGiftAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(levelRewardGiftAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );

    levelGiftLoop.start();

    return () => {
      levelGiftLoop.stop();
    };
  }, [levelRewardGiftAnim, levelUpRewards]);

  const levelRewardGiftStyle = {
    transform: [
      {
        scale: levelRewardGiftAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.14],
        }),
      },
    ],
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.gameHeroScene, sceneStyle]}>
        <Image
          source={gameAssets.background}
          resizeMode="cover"
          style={styles.gameHeroBackground}
        />
        <View style={styles.sceneDecorationLayer}>
          <View style={[styles.sceneDecoration, styles.sceneDecorationOne]} />
          <View style={[styles.sceneDecoration, styles.sceneDecorationTwo]} />
          <View style={[styles.sceneDecoration, styles.sceneDecorationThree]} />
        </View>
        <View style={styles.sceneTopBar}>
          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeText}>欢迎回来</Text>
            <Text style={styles.gameTitle}>数字花园</Text>
          </View>
          <View style={styles.resourceCluster}>
            <View style={styles.resourceBar}>
              <Image
                source={gameAssets.resourceCoin}
                resizeMode="contain"
                style={styles.resourceBarImage}
              />
              <Text style={styles.resourceBarText}>{coins}</Text>
            </View>
            <View style={styles.resourceBar}>
              <Image
                source={gameAssets.resourceFertilizer}
                resizeMode="contain"
                style={styles.resourceBarImage}
              />
              <Text style={styles.resourceBarText}>{fertilizers}</Text>
            </View>
          </View>
        </View>

        <View style={styles.homePlayfield}>
          <View style={[styles.orbColumn, styles.leftOrbColumn]}>
            {leftFeatureOrbs.map((feature) => (
              <Pressable
                key={feature.id}
                style={({ pressed }) => [
                  styles.featureOrb,
                  (pressed || pressedFeatureId === feature.id) &&
                    styles.featureOrbPressed,
                ]}
                onPressIn={() => holdFeaturePressFeedback(feature.id)}
                onPressOut={() => setPressedFeatureId(null)}
                onPress={feature.onPress}
              >
                <Image
                  source={feature.imageSource}
                  style={styles.featureOrbImage}
                  resizeMode="contain"
                />
                <Text style={styles.featureOrbText}>{feature.title}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.avatarArtworkFrame}>
            <View style={styles.avatarArtworkPlaceholder}>
              <Animated.Image
                source={gameAssets.catHappy}
                style={[styles.avatarArtwork, catAnimatedStyle]}
                resizeMode="contain"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.currentPlantBadge,
                  pressed && styles.currentPlantBadgePressed,
                ]}
                onPress={() => navigation.navigate('Plant')}
              >
                <View style={styles.currentPlantPot}>
                  <Text style={styles.currentPlantIcon}>{currentPlantIcon}</Text>
                </View>
                <View style={styles.currentPlantCopy}>
                  <Text style={styles.currentPlantTitle}>
                    {currentPlant.name}
                  </Text>
                  <Text style={styles.currentPlantMeta}>
                    Lv.{currentPlant.level} · {currentPlantStageLabel}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.orbColumn, styles.rightOrbColumn]}>
            {rightFeatureOrbs.map((feature) => (
              <Pressable
                key={feature.id}
                style={({ pressed }) => [
                  styles.featureOrb,
                  (pressed || pressedFeatureId === feature.id) &&
                    styles.featureOrbPressed,
                ]}
                onPressIn={() => holdFeaturePressFeedback(feature.id)}
                onPressOut={() => setPressedFeatureId(null)}
                onPress={feature.onPress}
              >
                <Image
                  source={feature.imageSource}
                  style={styles.featureOrbImage}
                  resizeMode="contain"
                />
                <Text style={styles.featureOrbText}>{feature.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.homeGrowthBar,
            pressed && styles.homeGrowthBarPressed,
          ]}
          onPress={() => navigation.navigate('Plant')}
        >
          <Image
            source={gameAssets.growthPanelBackground}
            resizeMode="stretch"
            style={styles.growthPanelBackground}
          />
          <View style={styles.growthPanelContent}>
            <View style={styles.growthAvatarFrame}>
              <Image
                source={gameAssets.catHappy}
                resizeMode="contain"
                style={styles.growthAvatar}
              />
            </View>
            <View style={styles.growthCenter}>
              <View style={styles.growthHeaderRow}>
                <Text style={styles.growthText}>成长进度</Text>
                <Text style={styles.growthValue}>
                  第 {growthLevel} 级 · {growthXp}/100
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <Image
                  source={gameAssets.progressTrack}
                  resizeMode="stretch"
                  style={styles.progressTrackImage}
                />
                <View
                  style={[
                    styles.progressFillMask,
                    { width: `${Math.min(growthXp, 100)}%` },
                  ]}
                >
                  <Image
                    source={gameAssets.progressFill}
                    resizeMode="stretch"
                    style={styles.progressFillImage}
                  />
                </View>
              </View>
            </View>
            <View style={styles.rewardGiftFrame}>
              <View style={styles.rewardGiftGlow} />
              <Animated.Image
                source={gameAssets.rewardGift}
                resizeMode="contain"
                style={[styles.rewardGift, giftAnimatedStyle]}
              />
            </View>
          </View>
        </Pressable>

      </View>
      <View style={styles.section} onLayout={handleSectionLayout('plants')}>
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
      <View style={styles.section} onLayout={handleSectionLayout('tasks')}>
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
      <View style={styles.section} onLayout={handleSectionLayout('math')}>
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
      <View style={styles.section} onLayout={handleSectionLayout('badges')}>
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
      <View style={styles.section} onLayout={handleSectionLayout('collection')}>
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
      <Modal
        animationType="fade"
        transparent
        visible={Boolean(levelUpRewards)}
        onRequestClose={dismissLevelUpRewards}
      >
        <View style={styles.levelRewardOverlay}>
          <View style={styles.levelRewardModal}>
            <Text style={styles.levelRewardTitle}>🎉 升级啦！</Text>
            {levelUpRewards ? (
              <>
                <Animated.Image
                  source={gameAssets.rewardGift}
                  resizeMode="contain"
                  style={[styles.levelRewardGift, levelRewardGiftStyle]}
                />
                <Text style={styles.levelRewardLevel}>
                  等级：Lv.{levelUpRewards.fromLevel} → Lv.
                  {levelUpRewards.toLevel}
                </Text>
                <View style={styles.levelRewardPrizeBox}>
                  <Text style={styles.levelRewardPrizeTitle}>获得</Text>
                  <Text style={styles.levelRewardPrizeText}>
                    金币 +{levelUpRewards.coins}
                  </Text>
                  <Text style={styles.levelRewardPrizeText}>
                    肥料 +{levelUpRewards.fertilizers}
                  </Text>
                </View>
              </>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.levelRewardButton,
                pressed && styles.levelRewardButtonPressed,
              ]}
              onPress={dismissLevelUpRewards}
            >
              <Text style={styles.levelRewardButtonText}>太棒啦</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    gap: 18,
    padding: 12,
    paddingBottom: 36,
  },
  gameHeroScene: {
    borderRadius: 28,
    gap: 14,
    minHeight: 720,
    overflow: 'hidden',
    padding: 18,
    position: 'relative',
  },
  gameHeroBackground: {
    bottom: 0,
    height: '100%',
    left: 0,
    opacity: 0.98,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  gardenScene: {
    backgroundColor: '#BFEAC9',
  },
  petScene: {
    backgroundColor: '#FFE0AD',
  },
  spriteScene: {
    backgroundColor: '#C9E5FF',
  },
  sceneTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  welcomeBlock: {
    backgroundColor: '#B8793B',
    borderColor: '#FFF0BA',
    borderRadius: 24,
    borderWidth: 3,
    flexShrink: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  welcomeText: {
    color: '#FFF8D7',
    fontSize: 17,
    fontWeight: '800',
  },
  gameTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  resourceCluster: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: 8,
    justifyContent: 'flex-end',
    marginRight: 34,
  },
  sceneDecorationLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sceneDecoration: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  sceneDecorationOne: {
    borderRadius: 110,
    height: 190,
    right: -60,
    top: 84,
    width: 190,
  },
  sceneDecorationTwo: {
    borderRadius: 90,
    bottom: 172,
    height: 136,
    left: -42,
    width: 180,
  },
  sceneDecorationThree: {
    borderRadius: 42,
    bottom: 118,
    height: 22,
    left: 34,
    right: 34,
  },
  avatarStage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 470,
    zIndex: 2,
  },
  featureOrbRing: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  homePlayfield: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 0,
    justifyContent: 'space-between',
    minHeight: 510,
    paddingHorizontal: 48,
    zIndex: 2,
  },
  orbColumn: {
    gap: 12,
    justifyContent: 'center',
    width: 128,
  },
  leftOrbColumn: {
    alignItems: 'center',
    marginLeft: 8,
  },
  rightOrbColumn: {
    alignItems: 'center',
    marginRight: 18,
  },
  featureOrb: {
    alignItems: 'center',
    gap: 2,
    height: 126,
    justifyContent: 'center',
    width: 128,
  },
  featureOrbPressed: {
    transform: [{ scale: 0.94 }],
  },
  featureOrbImage: {
    height: 108,
    width: 108,
  },
  featureOrbText: {
    color: '#5B341B',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
  },
  avatarArtworkFrame: {
    alignItems: 'center',
    flexShrink: 1,
    gap: 8,
    maxWidth: 430,
    minWidth: 330,
    paddingVertical: 4,
  },
  avatarArtworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarArtwork: {
    height: 470,
    width: 392,
  },
  currentPlantBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 231, 0.94)',
    borderColor: '#FFF0BA',
    borderRadius: 24,
    borderWidth: 3,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    minWidth: 174,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: 'absolute',
    shadowColor: '#7B512D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  currentPlantBadgePressed: {
    transform: [{ scale: 0.96 }],
  },
  currentPlantPot: {
    alignItems: 'center',
    backgroundColor: '#DFF5DE',
    borderColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  currentPlantIcon: {
    fontSize: 25,
    lineHeight: 30,
  },
  currentPlantCopy: {
    gap: 1,
    justifyContent: 'center',
  },
  currentPlantTitle: {
    color: '#5B341B',
    fontSize: 18,
    fontWeight: '800',
  },
  currentPlantMeta: {
    color: Colors.bodyText,
    fontSize: 14,
    fontWeight: '800',
  },
  avatarTitle: {
    color: Colors.headerText,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  avatarSubtitle: {
    color: Colors.bodyText,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
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
    color: '#5A3A1F',
    fontSize: 22,
    fontWeight: '800',
  },
  growthValue: {
    color: '#31515F',
    fontSize: 18,
    fontWeight: '800',
  },
  homeGrowthBar: {
    minHeight: 142,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  homeGrowthBarPressed: {
    transform: [{ scale: 0.99 }],
  },
  growthPanelBackground: {
    height: 340,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -112,
    width: '100%',
  },
  growthPanelContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    minHeight: 142,
    paddingBottom: 22,
    paddingHorizontal: 88,
    paddingTop: 24,
    position: 'relative',
    zIndex: 3,
  },
  growthAvatarFrame: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 247, 211, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 34,
    borderWidth: 3,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  growthAvatar: {
    height: 78,
    width: 78,
  },
  growthCenter: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    minWidth: 220,
  },
  growthHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  rewardGiftFrame: {
    alignItems: 'center',
    height: 104,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 104,
    zIndex: 4,
  },
  rewardGiftGlow: {
    backgroundColor: 'rgba(255, 245, 139, 0.46)',
    borderRadius: 42,
    height: 84,
    position: 'absolute',
    width: 84,
  },
  rewardGift: {
    height: 214,
    left: -108,
    position: 'absolute',
    top: -56,
    width: 320,
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
    backgroundColor: 'rgba(255, 244, 184, 0.94)',
    borderColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minWidth: 104,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resourceText: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: '800',
  },
  resourceIcon: {
    height: 42,
    width: 42,
  },
  resourceBar: {
    height: 64,
    position: 'relative',
    width: 188,
  },
  resourceBarImage: {
    height: '100%',
    width: '100%',
  },
  resourceBarText: {
    color: '#4B3521',
    fontSize: 24,
    fontWeight: '800',
    left: 92,
    position: 'absolute',
    textAlign: 'center',
    top: 17,
    width: 52,
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
    height: 42,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    zIndex: 3,
  },
  progressTrackImage: {
    height: 150,
    position: 'absolute',
    top: -58,
    width: '100%',
    zIndex: 1,
  },
  progressFillMask: {
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 2,
  },
  progressFillImage: {
    height: 150,
    position: 'absolute',
    top: -58,
    width: '100%',
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
  levelRewardOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(49, 81, 95, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  levelRewardModal: {
    alignItems: 'center',
    backgroundColor: '#FFF8D7',
    borderColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 4,
    gap: 14,
    maxWidth: 420,
    paddingHorizontal: 28,
    paddingVertical: 24,
    width: '100%',
  },
  levelRewardTitle: {
    color: Colors.headerText,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  levelRewardGift: {
    height: 130,
    width: 130,
  },
  levelRewardLevel: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  levelRewardPrizeBox: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    gap: 4,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: '100%',
  },
  levelRewardPrizeTitle: {
    color: Colors.bodyText,
    fontSize: 18,
    fontWeight: '800',
  },
  levelRewardPrizeText: {
    color: Colors.headerText,
    fontSize: 21,
    fontWeight: '800',
  },
  levelRewardButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 180,
    paddingHorizontal: 24,
  },
  levelRewardButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  levelRewardButtonText: {
    color: Colors.headerText,
    fontSize: 21,
    fontWeight: '800',
  },
});
