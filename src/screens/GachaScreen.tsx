import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { playSound } from '../audio/AudioManager';
import {
  gachaCost,
  gachaRarityColors,
  gachaRarityLabels,
  gachaRarityRates,
} from '../data/gachaRewards';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { GachaDrawResult } from '../types/gacha';
import type { RootStackParamList } from '../types/navigation';

const gameAssets = {
  background: require('../../assets/garden_bg.png'),
  gachaMachine: require('../../assets/btn_gacha.png'),
  resourceCoin: require('../../assets/resource_coin.png'),
};

export function GachaScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const coins = useGardenStore((state) => state.coins);
  const drawGacha = useGardenStore((state) => state.drawGacha);
  const [drawResult, setDrawResult] = useState<GachaDrawResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawButtonScale = useRef(new Animated.Value(1)).current;
  const loadingPulse = useRef(new Animated.Value(0)).current;
  const rewardScale = useRef(new Animated.Value(1)).current;
  const rarityAura = useRef(new Animated.Value(0)).current;
  const loadingLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const rarityLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mythicTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRarityEffects = () => {
    rarityLoopRef.current?.stop();
    rarityLoopRef.current = null;
    rarityAura.stopAnimation();
    rarityAura.setValue(0);

    if (mythicTimeoutRef.current) {
      clearTimeout(mythicTimeoutRef.current);
      mythicTimeoutRef.current = null;
    }
  };

  const playRarityAnimation = (nextDrawResult: GachaDrawResult) => {
    if (!nextDrawResult.success || !nextDrawResult.reward) {
      stopRarityEffects();
      return;
    }

    stopRarityEffects();
    rewardScale.setValue(nextDrawResult.reward.rarity === 'epic' ? 0.45 : 0.5);

    Animated.sequence([
      Animated.timing(rewardScale, {
        toValue: nextDrawResult.reward.rarity === 'epic' ? 1.16 : 1.1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(rewardScale, {
        toValue: 1,
        friction: nextDrawResult.reward.rarity === 'epic' ? 4 : 5,
        tension: nextDrawResult.reward.rarity === 'epic' ? 165 : 145,
        useNativeDriver: true,
      }),
    ]).start();

    if (nextDrawResult.reward.rarity === 'rare') {
      Animated.timing(rarityAura, {
        toValue: 1,
        duration: 260,
        useNativeDriver: false,
      }).start();
      return;
    }

    if (nextDrawResult.reward.rarity === 'legendary') {
      rarityAura.setValue(0.25);
      rarityLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(rarityAura, {
            toValue: 1,
            duration: 420,
            useNativeDriver: false,
          }),
          Animated.timing(rarityAura, {
            toValue: 0.25,
            duration: 420,
            useNativeDriver: false,
          }),
        ]),
      );
      rarityLoopRef.current.start();
      return;
    }

    if (nextDrawResult.reward.rarity === 'mythic') {
      rarityAura.setValue(0.45);
      rarityLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(rarityAura, {
            toValue: 1,
            duration: 280,
            useNativeDriver: false,
          }),
          Animated.timing(rarityAura, {
            toValue: 0.45,
            duration: 280,
            useNativeDriver: false,
          }),
        ]),
      );
      rarityLoopRef.current.start();

      mythicTimeoutRef.current = setTimeout(() => {
        rarityLoopRef.current?.stop();
        rarityLoopRef.current = null;
      }, 2000);
    }
  };

  const handleDraw = () => {
    if (isDrawing) {
      return;
    }

    void playSound('buttonTap');
    setDrawResult(null);
    setIsDrawing(true);

    Animated.sequence([
      Animated.timing(drawButtonScale, {
        toValue: 0.92,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.spring(drawButtonScale, {
        toValue: 1,
        friction: 5,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();

    loadingPulse.setValue(0);
    loadingLoopRef.current?.stop();
    loadingLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingPulse, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(loadingPulse, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    );
    loadingLoopRef.current.start();

    revealTimeoutRef.current = setTimeout(() => {
      loadingLoopRef.current?.stop();
      loadingLoopRef.current = null;
      setIsDrawing(false);

      const nextDrawResult = drawGacha();
      setDrawResult(nextDrawResult);

      if (!nextDrawResult.success) {
        stopRarityEffects();
        return;
      }

      playRarityAnimation(nextDrawResult);
      void playSound(nextDrawResult.isNew ? 'taskComplete' : 'coinGain');
    }, 1200);
  };

  useEffect(() => {
    return () => {
      loadingLoopRef.current?.stop();
      stopRarityEffects();

      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const loadingGiftStyle = {
    transform: [
      {
        scale: loadingPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ],
  };

  const rewardCardStyle = {
    transform: [{ scale: rewardScale }],
  };

  const rewardBadgeStyle = {
    shadowColor:
      drawResult?.success && drawResult.reward
        ? gachaRarityColors[drawResult.reward.rarity]
        : '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: rarityAura.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.55],
    }),
    shadowRadius: rarityAura.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 26],
    }),
    transform: [
      {
        scale: rarityAura.interpolate({
          inputRange: [0, 1],
          outputRange: [
            1,
            drawResult?.success && drawResult.reward?.rarity === 'legendary'
              ? 1.05
              : drawResult?.success && drawResult.reward?.rarity === 'mythic'
                ? 1.08
                : 1.03,
          ],
        }),
      },
    ],
  };

  return (
    <ImageBackground
      source={gameAssets.background}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
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
            <Text style={styles.title}>抽奖机</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.machineStage}>
          <View style={styles.coinBar}>
            <Image
              source={gameAssets.resourceCoin}
              resizeMode="contain"
              style={styles.coinBarImage}
            />
            <Text style={styles.coinBarText}>{coins}</Text>
          </View>
          <View style={styles.machineGlow} />
          <Image
            source={gameAssets.gachaMachine}
            resizeMode="contain"
            style={styles.gachaMachine}
          />

          <Animated.View style={{ transform: [{ scale: drawButtonScale }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.drawButton,
                pressed && styles.pressedButton,
                isDrawing && styles.drawButtonDisabled,
              ]}
              disabled={isDrawing}
              onPress={handleDraw}
            >
              <Text style={styles.drawButtonText}>
                {isDrawing ? '正在抽奖…' : '抽一次（10金币）'}
              </Text>
            </Pressable>
          </Animated.View>

          {isDrawing ? (
            <View style={styles.resultCard}>
              <Animated.Text style={[styles.loadingGift, loadingGiftStyle]}>
                🎁
              </Animated.Text>
              <Text style={styles.loadingText}>正在抽奖…</Text>
            </View>
          ) : drawResult ? (
            <Animated.View style={[styles.resultCard, rewardCardStyle]}>
              {!drawResult.success ? (
                <Text style={styles.noCoinsText}>
                  {drawResult.reason === 'not-enough-coins'
                    ? '金币不足，再完成任务赚金币吧'
                    : '抽奖没有成功'}
                </Text>
              ) : drawResult.reward ? (
                <>
                  <Text style={styles.resultTitle}>
                    {drawResult.isNew ? '恭喜获得' : '又抽到啦'}
                  </Text>
                  <Animated.View
                    style={[
                      styles.rewardBadge,
                      rewardBadgeStyle,
                      {
                        borderColor:
                          gachaRarityColors[drawResult.reward.rarity],
                        backgroundColor:
                          drawResult.reward.rarity === 'mythic'
                            ? 'rgba(255, 239, 242, 0.96)'
                            : drawResult.reward.rarity === 'legendary'
                              ? 'rgba(255, 248, 228, 0.96)'
                              : '#FFF8D7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rarityText,
                        { color: gachaRarityColors[drawResult.reward.rarity] },
                      ]}
                    >
                      {gachaRarityLabels[drawResult.reward.rarity]}
                    </Text>
                    <Text style={styles.rewardIcon}>
                      {drawResult.reward.icon}
                    </Text>
                    <Text style={styles.rewardName}>
                      {drawResult.reward.name}
                    </Text>
                  </Animated.View>
                  {!drawResult.isNew ? (
                    <Text style={styles.duplicateText}>
                      已转化金币 +{drawResult.duplicateCoins}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </Animated.View>
          ) : (
            <View style={styles.resultCard}>
              <Text style={styles.readyText}>放入金币，看看会出现什么</Text>
            </View>
          )}
        </View>

        <View style={styles.ratePanel}>
          <Text style={styles.rateTitle}>奖池概率</Text>
          <View style={styles.rateList}>
            {gachaRarityRates.map((rate) => (
              <View key={rate.rarity} style={styles.rateItem}>
                <View
                  style={[
                    styles.rateDot,
                    { backgroundColor: gachaRarityColors[rate.rarity] },
                  ]}
                />
                <Text style={styles.rateText}>
                  {rate.label} {rate.rate}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(255, 248, 231, 0.16)',
    flex: 1,
    gap: 12,
    padding: 22,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
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
  machineStage: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 500,
    position: 'relative',
  },
  coinBar: {
    height: 62,
    position: 'relative',
    width: 184,
    zIndex: 3,
  },
  coinBarImage: {
    height: '100%',
    width: '100%',
  },
  coinBarText: {
    color: '#4B3521',
    fontSize: 24,
    fontWeight: '800',
    left: 92,
    position: 'absolute',
    textAlign: 'center',
    top: 16,
    width: 52,
  },
  machineGlow: {
    backgroundColor: 'rgba(255, 247, 211, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 150,
    borderWidth: 4,
    height: 300,
    position: 'absolute',
    top: 82,
    width: 300,
  },
  gachaMachine: {
    height: 230,
    width: 230,
    zIndex: 2,
  },
  drawButton: {
    alignItems: 'center',
    backgroundColor: '#7FC8F0',
    borderColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: 'center',
    minHeight: 68,
    minWidth: 300,
    paddingHorizontal: 26,
    zIndex: 3,
  },
  drawButtonDisabled: {
    opacity: 0.9,
  },
  drawButtonText: {
    color: Colors.headerText,
    fontSize: 23,
    fontWeight: '800',
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: '#FFF0BA',
    borderRadius: 28,
    borderWidth: 3,
    gap: 8,
    minHeight: 118,
    minWidth: 330,
    paddingHorizontal: 22,
    paddingVertical: 14,
    zIndex: 3,
  },
  readyText: {
    color: Colors.bodyText,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 30,
    textAlign: 'center',
  },
  loadingGift: {
    fontSize: 54,
    marginTop: 6,
  },
  loadingText: {
    color: Colors.headerText,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  noCoinsText: {
    color: '#B8793B',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 28,
  },
  resultTitle: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: '800',
  },
  rewardBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF8D7',
    borderRadius: 24,
    borderWidth: 4,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rarityText: {
    fontSize: 18,
    fontWeight: '800',
  },
  rewardIcon: {
    fontSize: 34,
  },
  rewardName: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: '800',
  },
  duplicateText: {
    color: Colors.leaf,
    fontSize: 18,
    fontWeight: '800',
  },
  ratePanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderColor: '#FFF0BA',
    borderRadius: 26,
    borderWidth: 3,
    gap: 10,
    padding: 16,
  },
  rateTitle: {
    color: Colors.headerText,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  rateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  rateItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rateDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  rateText: {
    color: Colors.bodyText,
    fontSize: 16,
    fontWeight: '800',
  },
});
