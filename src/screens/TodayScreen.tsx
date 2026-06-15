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

import { playSound } from '../audio/AudioManager';
import { avatarModes } from '../data/avatarModes';
import { badges } from '../data/badges';
import { collectionItems } from '../data/collectionItems';
import { mathGames } from '../data/mathGames';
import { plantIds, plants as plantCatalog } from '../data/plants';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import type { Plant } from '../types/plant';

type SectionKey = 'plants' | 'tasks' | 'math' | 'badges' | 'collection';

type FeatureOrb = {
  id: string;
  title: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
};

const featureOrbIdleDelays = [0, 150, 300, 450, 600, 750] as const;

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
  const catBreathLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const homeEntryCatAnim = useRef(new Animated.Value(0)).current;
  const homeEntryCatSequenceRef = useRef<Animated.CompositeAnimation | null>(
    null,
  );
  const homeEntryResourceAnim = useRef(new Animated.Value(0)).current;
  const homeEntryGrowthAnim = useRef(new Animated.Value(0)).current;
  const homeEntryFeatureAnimsRef = useRef(
    featureOrbIdleDelays.map(() => new Animated.Value(0)),
  );
  const homeEntryFeatureSequenceRef =
    useRef<Animated.CompositeAnimation | null>(null);
  const featureOrbFloatAnimsRef = useRef(
    featureOrbIdleDelays.map(() => new Animated.Value(0)),
  );
  const featureOrbFloatLoopsRef = useRef<
    Array<Animated.CompositeAnimation | null>
  >(featureOrbIdleDelays.map(() => null));
  const giftPulseAnim = useRef(new Animated.Value(0)).current;
  const levelRewardGiftAnim = useRef(new Animated.Value(0)).current;
  const coinBarPulseAnim = useRef(new Animated.Value(0)).current;
  const fertilizerBarPulseAnim = useRef(new Animated.Value(0)).current;
  const badgeNoticeSlideAnim = useRef(new Animated.Value(0)).current;
  const badgeNoticeIconAnim = useRef(new Animated.Value(0)).current;
  const badgeNoticeSparkleAnim = useRef(new Animated.Value(0)).current;
  const badgeNoticeSparkleLoopRef =
    useRef<Animated.CompositeAnimation | null>(null);
  const previousCoinsRef = useRef<number | null>(null);
  const previousFertilizersRef = useRef<number | null>(null);
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
  const todayTasks = useGardenStore((state) => state.todayTasks);
  const completedTodayTaskIds = useGardenStore(
    (state) => state.completedTodayTaskIds,
  );
  const unlockedBadgeIds = useGardenStore((state) => state.unlockedBadgeIds);
  const latestUnlockedBadgeId = useGardenStore(
    (state) => state.latestUnlockedBadgeId,
  );
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
  const dismissBadgeNotice = useGardenStore(
    (state) => state.dismissBadgeNotice,
  );
  const dismissLevelUpRewards = useGardenStore(
    (state) => state.dismissLevelUpRewards,
  );
  const currentPlant = plant ?? plantCatalog.succulent;
  const currentMathQuestion = mathGames.find(
    (question) => !answeredMathQuestionIds.includes(question.id),
  );
  const avatarModeConfig = avatarModes[avatarMode];
  const currentPlantStage = getPlantStage(currentPlant.level);
  const currentPlantStageLabel = getPlantStageLabel(currentPlantStage);
  const currentPlantIcon = getPlantIcon(currentPlant, currentPlantStage);
  const unlockedBadgeCount = badges.filter((badge) =>
    unlockedBadgeIds.includes(badge.id),
  ).length;
  const badgeCompletionPercent = Math.round(
    (unlockedBadgeCount / badges.length) * 100,
  );
  const latestUnlockedBadge = badges.find(
    (badge) => badge.id === latestUnlockedBadgeId,
  );
  const recentUnlockedBadges = badges
    .filter((badge) => unlockedBadgeIds.includes(badge.id))
    .slice(-3)
    .reverse();
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

  const playButtonTap = () => {
    void playSound('buttonTap');
  };

  const handleTaskComplete = async (task: (typeof todayTasks)[number]) => {
    if (completedTodayTaskIds.includes(task.id)) {
      return;
    }

    completeDailyTask(task);
    await playSound('taskComplete');
    await playSound('coinGain');
  };

  const handleMathAnswer = async (
    selectedQuestion: (typeof mathGames)[number],
    selectedOptionId: string,
  ) => {
    const isCorrect = selectedOptionId === selectedQuestion.correctOptionId;

    answerMathQuestion(selectedQuestion, selectedOptionId);
    setLastMathResult(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      await playSound('coinGain');
    }
  };

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
          outputRange: [0, -4],
        }),
      },
      {
        scale: catBreathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.025],
        }),
      },
    ],
  };

  const catEntryAnimatedStyle = {
    opacity: homeEntryCatAnim,
    transform: [
      {
        translateY: homeEntryCatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
      {
        scale: homeEntryCatAnim.interpolate({
          inputRange: [0, 0.72, 1],
          outputRange: [0.92, 1.04, 1],
        }),
      },
    ],
  };

  const resourceEntryAnimatedStyle = {
    opacity: homeEntryResourceAnim,
    transform: [
      {
        translateY: homeEntryResourceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 0],
        }),
      },
    ],
  };

  const growthEntryAnimatedStyle = {
    opacity: homeEntryGrowthAnim,
    transform: [
      {
        translateY: homeEntryGrowthAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
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
      onPress: () => navigation.navigate('Badge'),
    },
  ];

  const leftFeatureOrbs = featureOrbs.slice(0, 3);
  const rightFeatureOrbs = featureOrbs.slice(3);

  const featureOrbAnimatedStyles = featureOrbFloatAnimsRef.current.map(
    (featureOrbAnim) => ({
      transform: [
        {
          translateY: featureOrbAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -3],
          }),
        },
        {
          scale: featureOrbAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.015],
          }),
        },
      ],
    }),
  );

  const featureOrbEntryAnimatedStyles = homeEntryFeatureAnimsRef.current.map(
    (featureOrbAnim) => ({
      opacity: featureOrbAnim,
      transform: [
        {
          translateY: featureOrbAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [12, 0],
          }),
        },
      ],
    }),
  );

  useEffect(() => {
    refreshDailyTasksForToday();
  }, [refreshDailyTasksForToday]);

  useEffect(() => {
    setLastMathResult(null);
  }, [currentMathQuestion?.id]);

  useEffect(() => {
    homeEntryCatSequenceRef.current?.stop();
    homeEntryFeatureSequenceRef.current?.stop();

    homeEntryResourceAnim.setValue(0);
    homeEntryCatAnim.setValue(0);
    homeEntryGrowthAnim.setValue(0);
    homeEntryFeatureAnimsRef.current.forEach((featureAnim) => {
      featureAnim.setValue(0);
    });

    homeEntryCatSequenceRef.current = Animated.sequence([
      Animated.delay(80),
      Animated.timing(homeEntryCatAnim, {
        toValue: 0.72,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(homeEntryCatAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);

    homeEntryFeatureSequenceRef.current = Animated.stagger(
      100,
      homeEntryFeatureAnimsRef.current.map((featureAnim) =>
        Animated.timing(featureAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ),
    );

    Animated.parallel([
      Animated.timing(homeEntryResourceAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      homeEntryCatSequenceRef.current,
      Animated.sequence([
        Animated.delay(140),
        homeEntryFeatureSequenceRef.current,
      ]),
      Animated.sequence([
        Animated.delay(360),
        Animated.timing(homeEntryGrowthAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    return () => {
      homeEntryCatSequenceRef.current?.stop();
      homeEntryCatSequenceRef.current = null;
      homeEntryFeatureSequenceRef.current?.stop();
      homeEntryFeatureSequenceRef.current = null;
      homeEntryCatAnim.stopAnimation();
      homeEntryResourceAnim.stopAnimation();
      homeEntryGrowthAnim.stopAnimation();
      homeEntryFeatureAnimsRef.current.forEach((featureAnim) => {
        featureAnim.stopAnimation();
      });
    };
  }, [homeEntryCatAnim, homeEntryGrowthAnim, homeEntryResourceAnim]);

  useEffect(() => {
    catBreathLoopRef.current?.stop();
    catBreathAnim.setValue(0);
    catBreathLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(catBreathAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(catBreathAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    catBreathLoopRef.current.start();

    return () => {
      catBreathLoopRef.current?.stop();
      catBreathLoopRef.current = null;
      catBreathAnim.stopAnimation();
    };
  }, [catBreathAnim]);

  useEffect(() => {
    featureOrbFloatLoopsRef.current.forEach((featureOrbLoop, index) => {
      featureOrbLoop?.stop();
      featureOrbFloatAnimsRef.current[index]?.setValue(0);

      const idleLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(featureOrbIdleDelays[index]),
          Animated.timing(featureOrbFloatAnimsRef.current[index], {
            toValue: 1,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(featureOrbFloatAnimsRef.current[index], {
            toValue: 0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ]),
      );

      featureOrbFloatLoopsRef.current[index] = idleLoop;
      idleLoop.start();
    });

    return () => {
      featureOrbFloatLoopsRef.current.forEach((featureOrbLoop, index) => {
        featureOrbLoop?.stop();
        featureOrbFloatLoopsRef.current[index] = null;
        featureOrbFloatAnimsRef.current[index]?.stopAnimation();
      });
    };
  }, []);

  useEffect(() => {
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

    giftLoop.start();

    return () => {
      giftLoop.stop();

      if (featurePressTimeoutRef.current) {
        clearTimeout(featurePressTimeoutRef.current);
      }
    };
  }, [catBreathAnim, giftPulseAnim]);

  useEffect(() => {
    if (previousCoinsRef.current === null) {
      previousCoinsRef.current = coins;
      return;
    }

    if (previousCoinsRef.current === coins) {
      return;
    }

    previousCoinsRef.current = coins;
    coinBarPulseAnim.setValue(0);

    Animated.sequence([
      Animated.timing(coinBarPulseAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(coinBarPulseAnim, {
        toValue: 0,
        friction: 5,
        tension: 165,
        useNativeDriver: true,
      }),
    ]).start();
  }, [coinBarPulseAnim, coins]);

  useEffect(() => {
    if (previousFertilizersRef.current === null) {
      previousFertilizersRef.current = fertilizers;
      return;
    }

    if (previousFertilizersRef.current === fertilizers) {
      return;
    }

    previousFertilizersRef.current = fertilizers;
    fertilizerBarPulseAnim.setValue(0);

    Animated.sequence([
      Animated.timing(fertilizerBarPulseAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(fertilizerBarPulseAnim, {
        toValue: 0,
        friction: 5,
        tension: 165,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fertilizerBarPulseAnim, fertilizers]);

  useEffect(() => {
    if (!levelUpRewards) {
      levelRewardGiftAnim.setValue(0);
      return;
    }

    void playSound('levelUp');

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

  useEffect(() => {
    if (!latestUnlockedBadge) {
      badgeNoticeSlideAnim.setValue(0);
      badgeNoticeIconAnim.setValue(0);
      badgeNoticeSparkleAnim.setValue(0);
      return;
    }

    void playSound('badgeUnlock');

    badgeNoticeSlideAnim.setValue(0);
    badgeNoticeIconAnim.setValue(0);
    badgeNoticeSparkleAnim.setValue(0);

    badgeNoticeSparkleLoopRef.current?.stop();
    badgeNoticeSparkleLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeNoticeSparkleAnim, {
          toValue: 1,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(badgeNoticeSparkleAnim, {
          toValue: 0,
          duration: 950,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel([
      Animated.sequence([
        Animated.timing(badgeNoticeSlideAnim, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.spring(badgeNoticeSlideAnim, {
          toValue: 1.08,
          friction: 5,
          tension: 160,
          useNativeDriver: true,
        }),
        Animated.spring(badgeNoticeSlideAnim, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(badgeNoticeIconAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(badgeNoticeIconAnim, {
          toValue: 2,
          duration: 240,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    badgeNoticeSparkleLoopRef.current.start();

    const badgeNoticeTimer = setTimeout(() => {
      dismissBadgeNotice();
    }, 2000);

    return () => {
      clearTimeout(badgeNoticeTimer);
      badgeNoticeSparkleLoopRef.current?.stop();
      badgeNoticeSparkleLoopRef.current = null;
    };
  }, [dismissBadgeNotice, latestUnlockedBadge]);

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

  const badgeNoticeAnimatedStyle = {
    opacity: badgeNoticeSlideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: badgeNoticeSlideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-28, 0],
        }),
      },
      {
        scale: badgeNoticeSlideAnim.interpolate({
          inputRange: [0, 1, 1.08],
          outputRange: [0.94, 1, 1.03],
        }),
      },
    ],
  };

  const badgeIconAnimatedStyle = {
    transform: [
      {
        scale: badgeNoticeIconAnim.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0.6, 1.15, 1],
        }),
      },
    ],
  };

  const badgeSparkleOneStyle = {
    opacity: badgeNoticeSparkleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.22, 1],
    }),
    transform: [
      {
        translateY: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [4, -10],
        }),
      },
      {
        translateX: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
      {
        scale: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.84, 1.12],
        }),
      },
    ],
  };

  const badgeSparkleTwoStyle = {
    opacity: badgeNoticeSparkleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.9],
    }),
    transform: [
      {
        translateY: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, -8],
        }),
      },
      {
        translateX: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }),
      },
      {
        scale: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.78, 1.06],
        }),
      },
    ],
  };

  const badgeSparkleThreeStyle = {
    opacity: badgeNoticeSparkleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.14, 0.82],
    }),
    transform: [
      {
        translateY: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, -12],
        }),
      },
      {
        translateX: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 4],
        }),
      },
      {
        scale: badgeNoticeSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.74, 1],
        }),
      },
    ],
  };

  const coinBarAnimatedStyle = {
    transform: [
      {
        scale: coinBarPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ],
  };

  const coinTextAnimatedStyle = {
    color: coinBarPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#4B3521', '#FFF8D7'],
    }),
    textShadowColor: coinBarPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', 'rgba(255, 246, 190, 0.95)'],
    }),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: coinBarPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    }),
  };

  const fertilizerBarAnimatedStyle = {
    transform: [
      {
        scale: fertilizerBarPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ],
  };

  const fertilizerTextAnimatedStyle = {
    color: fertilizerBarPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#4B3521', '#F7FFF2'],
    }),
    textShadowColor: fertilizerBarPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', 'rgba(213, 255, 201, 0.95)'],
    }),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: fertilizerBarPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    }),
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
          <Animated.View
            style={[styles.resourceCluster, resourceEntryAnimatedStyle]}
          >
            <Animated.View style={[styles.resourceBar, coinBarAnimatedStyle]}>
              <Image
                source={gameAssets.resourceCoin}
                resizeMode="contain"
                style={styles.resourceBarImage}
              />
              <Animated.Text
                style={[styles.resourceBarText, coinTextAnimatedStyle]}
              >
                {coins}
              </Animated.Text>
            </Animated.View>
            <Animated.View
              style={[styles.resourceBar, fertilizerBarAnimatedStyle]}
            >
              <Image
                source={gameAssets.resourceFertilizer}
                resizeMode="contain"
                style={styles.resourceBarImage}
              />
              <Animated.Text
                style={[styles.resourceBarText, fertilizerTextAnimatedStyle]}
              >
                {fertilizers}
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.homePlayfield}>
          <View style={[styles.orbColumn, styles.leftOrbColumn]}>
            {leftFeatureOrbs.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={featureOrbEntryAnimatedStyles[index]}
              >
                <Animated.View
                  style={featureOrbAnimatedStyles[index]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.featureOrb,
                      (pressed || pressedFeatureId === feature.id) &&
                        styles.featureOrbPressed,
                    ]}
                    onPressIn={() => holdFeaturePressFeedback(feature.id)}
                    onPressOut={() => setPressedFeatureId(null)}
                    onPress={() => {
                      playButtonTap();
                      feature.onPress();
                    }}
                  >
                    <Image
                      source={feature.imageSource}
                      style={styles.featureOrbImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.featureOrbText}>{feature.title}</Text>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            ))}
          </View>

          <View style={styles.avatarArtworkFrame}>
            <View style={styles.avatarArtworkPlaceholder}>
              <Animated.View style={catEntryAnimatedStyle}>
                <Animated.Image
                  source={gameAssets.catHappy}
                  style={[styles.avatarArtwork, catAnimatedStyle]}
                  resizeMode="contain"
                />
              </Animated.View>
              <Pressable
                style={({ pressed }) => [
                  styles.currentPlantBadge,
                  pressed && styles.currentPlantBadgePressed,
                ]}
                onPress={() => {
                  playButtonTap();
                  navigation.navigate('Plant');
                }}
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
            {rightFeatureOrbs.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={featureOrbEntryAnimatedStyles[index + leftFeatureOrbs.length]}
              >
                <Animated.View
                  style={featureOrbAnimatedStyles[index + leftFeatureOrbs.length]}
                >
                  <Pressable
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
                </Animated.View>
              </Animated.View>
            ))}
          </View>
        </View>

        <Animated.View style={growthEntryAnimatedStyle}>
          <Pressable
            style={({ pressed }) => [
              styles.homeGrowthBar,
              pressed && styles.homeGrowthBarPressed,
            ]}
            onPress={() => {
              playButtonTap();
              navigation.navigate('Plant');
            }}
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
            </View>
            <View style={styles.rewardGiftFrame}>
              <View style={styles.rewardGiftGlow} />
              <Animated.Image
                source={gameAssets.rewardGift}
                resizeMode="contain"
                style={[styles.rewardGift, giftAnimatedStyle]}
              />
            </View>
          </Pressable>
        </Animated.View>

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
            {completedTodayTaskIds.length}/{todayTasks.length}
          </Text>
        </View>
        {todayTasks.map((task) => {
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
                onPress={() => {
                  void handleTaskComplete(task);
                }}
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
                    void handleMathAnswer(currentMathQuestion, option.id);
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
      <Pressable
        style={({ pressed }) => [
          styles.section,
          styles.badgeSummarySection,
          pressed && styles.badgeSummaryPressed,
        ]}
        onLayout={handleSectionLayout('badges')}
        onPress={() => {
          playButtonTap();
          navigation.navigate('Badge');
        }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>徽章</Text>
          <Text style={styles.sectionCount}>
            已获得 {unlockedBadgeCount}/{badges.length}
          </Text>
        </View>
        <Text style={styles.badgeProgressText}>
          完成度 {badgeCompletionPercent}%
        </Text>
        <View style={styles.recentBadgePanel}>
          <Text style={styles.recentBadgeLabel}>最近获得徽章</Text>
          {recentUnlockedBadges.length > 0 ? (
            <View style={styles.recentBadgeList}>
              {recentUnlockedBadges.map((badge) => (
                <View key={badge.id} style={styles.recentBadgeChip}>
                  <Ionicons
                    name={badge.iconName}
                    size={20}
                    color={Colors.headerText}
                  />
                  <Text style={styles.recentBadgeName}>{badge.title}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.recentBadgeEmpty}>
              <Ionicons name="lock-closed" size={20} color={Colors.bodyText} />
              <Text style={styles.recentBadgeEmptyText}>还没有徽章</Text>
            </View>
          )}
        </View>
      </Pressable>
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
      {latestUnlockedBadge ? (
        <Animated.View style={[styles.badgeNotice, badgeNoticeAnimatedStyle]}>
          <Animated.Text
            style={[styles.badgeNoticeSparkle, styles.badgeSparkleOne, badgeSparkleOneStyle]}
          >
            ✨
          </Animated.Text>
          <Animated.Text
            style={[styles.badgeNoticeSparkle, styles.badgeSparkleTwo, badgeSparkleTwoStyle]}
          >
            ⭐
          </Animated.Text>
          <Animated.Text
            style={[
              styles.badgeNoticeSparkle,
              styles.badgeSparkleThree,
              badgeSparkleThreeStyle,
            ]}
          >
            ✨
          </Animated.Text>
          <Animated.Text
            style={[styles.badgeNoticeIcon, badgeIconAnimatedStyle]}
          >
            🏅
          </Animated.Text>
          <View style={styles.badgeNoticeCopy}>
            <Text style={styles.badgeNoticeTitle}>获得新徽章</Text>
            <Text style={styles.badgeNoticeName}>
              {latestUnlockedBadge.title}
            </Text>
          </View>
        </Animated.View>
      ) : null}
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
  badgeNotice: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 248, 231, 0.96)',
    borderColor: '#FFF0BA',
    borderRadius: 26,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    position: 'absolute',
    overflow: 'visible',
    top: 54,
    zIndex: 20,
  },
  badgeNoticeIcon: {
    fontSize: 28,
  },
  badgeNoticeSparkle: {
    position: 'absolute',
  },
  badgeSparkleOne: {
    left: 8,
    top: -8,
  },
  badgeSparkleTwo: {
    right: 18,
    top: -12,
  },
  badgeSparkleThree: {
    bottom: -6,
    left: 44,
  },
  badgeNoticeCopy: {
    gap: 2,
  },
  badgeNoticeTitle: {
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: '800',
  },
  badgeNoticeName: {
    color: '#5B341B',
    fontSize: 15,
    fontWeight: '800',
  },
  badgeProgressText: {
    color: Colors.bodyText,
    fontSize: 16,
    fontWeight: '800',
  },
  badgeSummarySection: {
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 3,
  },
  badgeSummaryPressed: {
    transform: [{ scale: 0.99 }],
  },
  recentBadgePanel: {
    gap: 10,
  },
  recentBadgeLabel: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '800',
  },
  recentBadgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentBadgeChip: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  recentBadgeName: {
    color: Colors.headerText,
    fontSize: 15,
    fontWeight: '800',
  },
  recentBadgeEmpty: {
    alignItems: 'center',
    backgroundColor: '#E4E9E8',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  recentBadgeEmptyText: {
    color: Colors.bodyText,
    fontSize: 15,
    fontWeight: '800',
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
