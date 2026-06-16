import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { playSound } from '../audio/AudioManager';
import { plantIds, plants as plantCatalog } from '../data/plants';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { Plant } from '../types/plant';
import type { RootStackParamList } from '../types/navigation';

const backgroundImage = require('../../assets/garden_bg.png');

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

const getPlantIcon = (plant: Plant, stage: PlantStage) => {
  if (stage === 'mature') {
    return plant.matureIcon;
  }

  if (stage === 'sprout') {
    return '🌱';
  }

  return '🌰';
};

export function PlantScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [message, setMessage] = useState<string | null>(null);
  const [showMatureSparkles, setShowMatureSparkles] = useState(false);
  const [highlightedPlantId, setHighlightedPlantId] = useState<string | null>(
    null,
  );
  const selectedPlantAnim = useRef(new Animated.Value(0)).current;
  const unlockPlantAnim = useRef(new Animated.Value(0)).current;
  const matureSparkleAnim = useRef(new Animated.Value(0)).current;
  const matureSparkleLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const matureSparkleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const coins = useGardenStore((state) => state.coins);
  const fertilizers = useGardenStore((state) => state.fertilizers);
  const selectedPlantId = useGardenStore((state) => state.selectedPlantId);
  const plants = useGardenStore((state) => state.plants);
  const ownedPlantIds = useGardenStore((state) => state.ownedPlantIds);
  const selectPlant = useGardenStore((state) => state.selectPlant);
  const unlockPlant = useGardenStore((state) => state.unlockPlant);
  const feedPlantWithFertilizer = useGardenStore(
    (state) => state.feedPlantWithFertilizer,
  );
  const selectedPlant = plants[selectedPlantId] ?? plantCatalog.succulent;
  const selectedStage = getPlantStage(selectedPlant.level);
  const selectedIcon = getPlantIcon(selectedPlant, selectedStage);
  const selectedStageLabel = getPlantStageLabel(selectedStage);
  const ownedCount = ownedPlantIds.length;
  const totalCount = plantIds.length;
  const xpPercent = Math.min(selectedPlant.xp, 100);

  useEffect(() => {
    return () => {
      if (matureSparkleTimeoutRef.current) {
        clearTimeout(matureSparkleTimeoutRef.current);
      }

      matureSparkleLoopRef.current?.stop();
      selectedPlantAnim.stopAnimation();
      unlockPlantAnim.stopAnimation();
      matureSparkleAnim.stopAnimation();
    };
  }, [matureSparkleAnim, selectedPlantAnim, unlockPlantAnim]);

  const sortedPlantIds = useMemo(
    () =>
      [...plantIds].sort((firstPlantId, secondPlantId) => {
        const firstOwned = ownedPlantIds.includes(firstPlantId);
        const secondOwned = ownedPlantIds.includes(secondPlantId);

        if (firstOwned === secondOwned) {
          return plantIds.indexOf(firstPlantId) - plantIds.indexOf(secondPlantId);
        }

        return firstOwned ? -1 : 1;
      }),
    [ownedPlantIds],
  );

  const handleFeedPlant = () => {
    void playSound('buttonTap');

    const feedResult = feedPlantWithFertilizer(selectedPlant.id);

    if (!feedResult.success) {
      setMessage('肥料不够啦');
      return;
    }

    selectedPlantAnim.stopAnimation();
    selectedPlantAnim.setValue(0);
    Animated.sequence([
      Animated.timing(selectedPlantAnim, {
        toValue: feedResult.matureReward ? 1 : 0.75,
        duration: feedResult.matureReward ? 210 : 180,
        useNativeDriver: true,
      }),
      Animated.spring(selectedPlantAnim, {
        toValue: 0,
        friction: 5,
        tension: feedResult.matureReward ? 170 : 150,
        useNativeDriver: true,
      }),
    ]).start();

    void playSound('taskComplete');

    if (feedResult.matureReward) {
      void playSound('levelUp');
      setShowMatureSparkles(true);
      matureSparkleAnim.setValue(0);
      matureSparkleLoopRef.current?.stop();
      matureSparkleLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(matureSparkleAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(matureSparkleAnim, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 },
      );
      matureSparkleLoopRef.current.start(() => {
        matureSparkleLoopRef.current = null;
      });

      if (matureSparkleTimeoutRef.current) {
        clearTimeout(matureSparkleTimeoutRef.current);
      }

      matureSparkleTimeoutRef.current = setTimeout(() => {
        setShowMatureSparkles(false);
        matureSparkleTimeoutRef.current = null;
        matureSparkleLoopRef.current?.stop();
        matureSparkleLoopRef.current = null;
      }, 1200);
    }

    setMessage(
      feedResult.matureReward
        ? '植物成熟啦！\n获得：金币 +20 · 肥料 +5'
        : '植物长大了一点点',
    );
  };

  const handlePlantPress = (plantId: string) => {
    void playSound('buttonTap');

    const isOwned = ownedPlantIds.includes(plantId);
    const catalogPlant = plantCatalog[plantId];

    if (isOwned) {
      selectPlant(plantId);
      setMessage('现在开始照顾这株植物啦');
      return;
    }

    if (coins < catalogPlant.unlockCost) {
      setMessage('金币不足');
      return;
    }

    unlockPlant(plantId);
    void playSound('taskComplete');
    setHighlightedPlantId(plantId);
    unlockPlantAnim.stopAnimation();
    unlockPlantAnim.setValue(0);
    Animated.sequence([
      Animated.timing(unlockPlantAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(unlockPlantAnim, {
        toValue: 0,
        friction: 5,
        tension: 165,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setHighlightedPlantId(null);
    });
    setMessage('新植物住进花园啦');
  };

  const selectedPlantAnimatedStyle = {
    transform: [
      {
        translateY: selectedPlantAnim.interpolate({
          inputRange: [0, 0.75, 1],
          outputRange: [0, -8, -12],
        }),
      },
      {
        scale: selectedPlantAnim.interpolate({
          inputRange: [0, 0.75, 1],
          outputRange: [1, 1.18, 1.3],
        }),
      },
    ],
  };

  const matureSparkleOneStyle = {
    opacity: matureSparkleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
    }),
    transform: [
      {
        translateY: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, -10],
        }),
      },
      {
        scale: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.85, 1.15],
        }),
      },
    ],
  };

  const matureSparkleTwoStyle = {
    opacity: matureSparkleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.95],
    }),
    transform: [
      {
        translateY: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [8, -12],
        }),
      },
      {
        translateX: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 4],
        }),
      },
      {
        scale: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.12],
        }),
      },
    ],
  };

  const matureSparkleThreeStyle = {
    opacity: matureSparkleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.9],
    }),
    transform: [
      {
        translateY: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, -8],
        }),
      },
      {
        translateX: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
      {
        scale: matureSparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.82, 1.08],
        }),
      },
    ],
  };

  const unlockedPlantCardAnimatedStyle = {
    transform: [
      {
        scale: unlockPlantAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
    ],
  };

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => {
              void playSound('buttonTap');
              navigation.goBack();
            }}
          >
            <Ionicons name="chevron-back" size={26} color="#FFF8D7" />
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
          <View style={styles.titleSign}>
            <Text style={styles.title}>植物图鉴</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.resourceRow}>
          <View style={styles.resourcePill}>
            <Ionicons name="paw" size={22} color={Colors.headerText} />
            <Text style={styles.resourceText}>金币 {coins}</Text>
          </View>
          <View style={styles.resourcePill}>
            <Ionicons name="leaf" size={22} color={Colors.leaf} />
            <Text style={styles.resourceText}>肥料 {fertilizers}</Text>
          </View>
          <View style={styles.resourcePill}>
            <Ionicons name="leaf" size={22} color={Colors.leaf} />
            <Text style={styles.resourceText}>
              已拥有 {ownedCount}/{totalCount}
            </Text>
          </View>
        </View>

        <View style={styles.selectedPlantCard}>
          <View style={styles.selectedPlantTop}>
            <View style={styles.plantIconFrame}>
              {showMatureSparkles ? (
                <>
                  <Animated.Text
                    style={[
                      styles.matureSparkle,
                      styles.matureSparkleOne,
                      matureSparkleOneStyle,
                    ]}
                  >
                    ✨
                  </Animated.Text>
                  <Animated.Text
                    style={[
                      styles.matureSparkle,
                      styles.matureSparkleTwo,
                      matureSparkleTwoStyle,
                    ]}
                  >
                    🌟
                  </Animated.Text>
                  <Animated.Text
                    style={[
                      styles.matureSparkle,
                      styles.matureSparkleThree,
                      matureSparkleThreeStyle,
                    ]}
                  >
                    ✨
                  </Animated.Text>
                </>
              ) : null}
              <Animated.View
                style={[styles.plantIconBubble, selectedPlantAnimatedStyle]}
              >
                <Text style={styles.selectedPlantIcon}>{selectedIcon}</Text>
              </Animated.View>
            </View>
            <View style={styles.selectedPlantInfo}>
              <Text style={styles.selectedPlantName}>{selectedPlant.name}</Text>
              <Text style={styles.selectedPlantMeta}>
                第 {selectedPlant.level} 级 · {selectedStageLabel}
              </Text>
              <Text style={styles.selectedPlantXp}>
                植物成长 {selectedPlant.xp}/100
              </Text>
            </View>
          </View>

          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.feedButton,
              fertilizers < 1 && styles.feedButtonDisabled,
              pressed && fertilizers > 0 && styles.pressedButton,
            ]}
            onPress={handleFeedPlant}
          >
            <Ionicons name="nutrition" size={24} color="#FFFFFF" />
            <Text style={styles.feedButtonText}>给植物施肥 +10 成长</Text>
          </Pressable>
        </View>

        {message ? (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>我的植物</Text>
          <View style={styles.plantGrid}>
            {sortedPlantIds.map((plantId) => {
              const catalogPlant = plantCatalog[plantId];
              const gardenPlant = plants[plantId] ?? catalogPlant;
              const isOwned = ownedPlantIds.includes(plantId);
              const isSelected = selectedPlantId === plantId;
              const stage = getPlantStage(gardenPlant.level);
              const icon = getPlantIcon(gardenPlant, stage);

              return (
                <Animated.View
                  key={plantId}
                  style={
                    highlightedPlantId === plantId
                      ? unlockedPlantCardAnimatedStyle
                      : undefined
                  }
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.plantCard,
                      isSelected && styles.plantCardSelected,
                      !isOwned && styles.plantCardLocked,
                      pressed && styles.pressedButton,
                    ]}
                    onPress={() => handlePlantPress(plantId)}
                  >
                    <Text style={styles.plantCardIcon}>
                      {isOwned ? icon : '🔒'}
                    </Text>
                    <Text style={styles.plantCardName}>{catalogPlant.name}</Text>
                    <Text style={styles.plantCardMeta}>
                      {isOwned
                        ? `第 ${gardenPlant.level} 级`
                        : `${catalogPlant.unlockCost} 金币`}
                    </Text>
                    <Text
                      style={[
                        styles.plantCardAction,
                        !isOwned && coins < catalogPlant.unlockCost
                          ? styles.plantCardActionMuted
                          : null,
                      ]}
                    >
                      {isOwned
                        ? isSelected
                          ? '照顾中'
                          : '切换'
                        : coins >= catalogPlant.unlockCost
                          ? '解锁'
                          : '金币不足'}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    gap: 16,
    padding: 22,
    paddingBottom: 34,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#B8793B',
    borderColor: '#FFF0BA',
    borderRadius: 24,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 4,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#FFF8D7',
    fontSize: 18,
    fontWeight: '800',
  },
  pressedButton: {
    transform: [{ scale: 0.94 }],
  },
  titleSign: {
    alignItems: 'center',
    backgroundColor: '#B8793B',
    borderColor: '#FFF0BA',
    borderRadius: 28,
    borderWidth: 4,
    justifyContent: 'center',
    minHeight: 62,
    minWidth: 190,
    paddingHorizontal: 26,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 92,
  },
  resourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  resourcePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderColor: '#FFF0BA',
    borderRadius: 24,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  resourceText: {
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: '800',
  },
  selectedPlantCard: {
    backgroundColor: 'rgba(255, 248, 231, 0.9)',
    borderColor: '#FFF0BA',
    borderRadius: 34,
    borderWidth: 4,
    gap: 18,
    padding: 20,
  },
  selectedPlantTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  plantIconFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 120,
    height: 120,
  },
  plantIconBubble: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderColor: '#FFFFFF',
    borderRadius: 54,
    borderWidth: 4,
    height: 108,
    justifyContent: 'center',
    width: 108,
  },
  selectedPlantIcon: {
    fontSize: 58,
  },
  matureSparkle: {
    position: 'absolute',
    fontSize: 24,
    zIndex: 2,
  },
  matureSparkleOne: {
    left: 6,
    top: 8,
  },
  matureSparkleTwo: {
    right: 4,
    top: 2,
  },
  matureSparkleThree: {
    bottom: 8,
    left: 10,
  },
  selectedPlantInfo: {
    flex: 1,
    gap: 5,
  },
  selectedPlantName: {
    color: Colors.headerText,
    fontSize: 36,
    fontWeight: '800',
  },
  selectedPlantMeta: {
    color: Colors.bodyText,
    fontSize: 19,
    fontWeight: '800',
  },
  selectedPlantXp: {
    color: Colors.leaf,
    fontSize: 18,
    fontWeight: '800',
  },
  xpTrack: {
    backgroundColor: '#E7D6A8',
    borderColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 3,
    height: 30,
    overflow: 'hidden',
  },
  xpFill: {
    backgroundColor: '#77C66E',
    borderRadius: 14,
    height: '100%',
  },
  feedButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.leaf,
    borderColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 60,
    minWidth: 270,
    paddingHorizontal: 22,
  },
  feedButtonDisabled: {
    opacity: 0.5,
  },
  feedButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  messageBubble: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#FFF0BA',
    borderRadius: 24,
    borderWidth: 3,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  messageText: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '800',
  },
  gridSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    borderWidth: 3,
    gap: 14,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.headerText,
    fontSize: 26,
    fontWeight: '800',
  },
  plantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  plantCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    gap: 6,
    minHeight: 150,
    padding: 12,
    width: '31.8%',
  },
  plantCardSelected: {
    borderColor: Colors.leaf,
    borderWidth: 5,
  },
  plantCardLocked: {
    backgroundColor: 'rgba(217, 240, 255, 0.76)',
  },
  plantCardIcon: {
    fontSize: 34,
  },
  plantCardName: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  plantCardMeta: {
    color: Colors.bodyText,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  plantCardAction: {
    color: Colors.leaf,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  plantCardActionMuted: {
    color: Colors.bodyText,
  },
});
