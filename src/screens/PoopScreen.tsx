import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const gameAssets = {
  background: require('../../assets/garden_bg.png'),
  catHappy: require('../../assets/cat_happy.png'),
  catPoop: require('../../assets/cat-poop.png'),
  rewardGift: require('../../assets/reward_gift.png'),
};

const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function PoopScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const avatarBreathAnim = useRef(new Animated.Value(0)).current;
  const giftPulseAnim = useRef(new Animated.Value(0)).current;
  const poopRecordDate = useGardenStore((state) => state.poopRecordDate);
  const recordPoopToday = useGardenStore((state) => state.recordPoopToday);
  const [message, setMessage] = useState<string | null>(null);
  const today = useMemo(() => getLocalDateString(), []);
  const isCompletedToday = poopRecordDate === today;

  const avatarAnimatedStyle = {
    transform: [
      {
        translateY: avatarBreathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        scale: avatarBreathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.035],
        }),
      },
    ],
  };

  const giftAnimatedStyle = {
    opacity: giftPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    }),
    transform: [
      {
        scale: giftPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.16],
        }),
      },
    ],
  };

  const handleRecordPoop = async () => {
    const didRecord = recordPoopToday();

    setMessage(didRecord ? '获得奖励' : '今天已经记录过啦');

    if (didRecord) {
      await playSound('coinGain');
    }
  };

  useEffect(() => {
    const avatarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarBreathAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: false,
        }),
        Animated.timing(avatarBreathAnim, {
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
          duration: 1100,
          useNativeDriver: false,
        }),
        Animated.timing(giftPulseAnim, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: false,
        }),
      ]),
    );

    avatarLoop.start();
    giftLoop.start();

    return () => {
      avatarLoop.stop();
      giftLoop.stop();
    };
  }, [avatarBreathAnim, giftPulseAnim]);

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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#FFF8D7" />
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
          <View style={styles.titleSign}>
            <Text style={styles.title}>粑粑时间</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.stage}>
          <View style={styles.avatarGlow} />
          <Animated.Image
            source={isCompletedToday ? gameAssets.catHappy : gameAssets.catPoop}
            resizeMode="contain"
            style={[
              isCompletedToday ? styles.happyAvatar : styles.poopAvatar,
              avatarAnimatedStyle,
            ]}
          />
          <View style={styles.copyBubble}>
            <Text style={styles.statusTitle}>
              {isCompletedToday ? '今天已经完成啦' : '准备好了吗？'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isCompletedToday ? '小胖猫为你鼓掌！' : '坐一坐，慢慢来'}
            </Text>
          </View>
        </View>

        {message ? (
          <View style={styles.rewardNotice}>
            <View style={styles.rewardGiftFrame}>
              <View style={styles.rewardGiftGlow} />
              <Animated.Image
                source={gameAssets.rewardGift}
                resizeMode="contain"
                style={[styles.rewardGift, giftAnimatedStyle]}
              />
            </View>
            <View style={styles.rewardTextGroup}>
              <Text style={styles.rewardTitle}>{message}</Text>
              {message === '获得奖励' ? (
                <Text style={styles.rewardDetail}>
                  金币 +10 · 肥料 +5 · 成长值 +10
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.recordButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleRecordPoop}
        >
          <Text style={styles.recordButtonText}>
            {isCompletedToday ? '今天已经记录过啦' : '我今天已经粑粑啦'}
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(255, 248, 231, 0.18)',
    flex: 1,
    gap: 18,
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
    minWidth: 210,
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
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 420,
    position: 'relative',
  },
  avatarGlow: {
    backgroundColor: 'rgba(255, 247, 211, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 165,
    borderWidth: 4,
    height: 330,
    position: 'absolute',
    top: '13%',
    width: 330,
  },
  poopAvatar: {
    height: 430,
    marginTop: -26,
    width: 286,
    zIndex: 2,
  },
  happyAvatar: {
    height: 360,
    marginTop: -8,
    width: 330,
    zIndex: 2,
  },
  copyBubble: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#FFF0BA',
    borderRadius: 30,
    borderWidth: 3,
    gap: 6,
    marginTop: -44,
    paddingHorizontal: 34,
    paddingVertical: 18,
    zIndex: 3,
  },
  statusTitle: {
    color: Colors.headerText,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: Colors.bodyText,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  rewardNotice: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(223, 245, 222, 0.9)',
    borderColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 16,
    minHeight: 92,
    paddingHorizontal: 22,
    paddingVertical: 12,
    zIndex: 4,
  },
  rewardGiftFrame: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 70,
  },
  rewardGiftGlow: {
    backgroundColor: 'rgba(255, 239, 121, 0.56)',
    borderRadius: 30,
    height: 60,
    position: 'absolute',
    width: 60,
  },
  rewardGift: {
    height: 144,
    left: -72,
    position: 'absolute',
    top: -38,
    width: 216,
  },
  rewardTextGroup: {
    gap: 4,
  },
  rewardTitle: {
    color: Colors.headerText,
    fontSize: 21,
    fontWeight: '800',
  },
  rewardDetail: {
    color: Colors.leaf,
    fontSize: 18,
    fontWeight: '800',
  },
  recordButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#7FC8F0',
    borderColor: '#FFFFFF',
    borderRadius: 34,
    borderWidth: 4,
    justifyContent: 'center',
    marginBottom: 6,
    minHeight: 80,
    minWidth: 360,
    paddingHorizontal: 28,
  },
  recordButtonText: {
    color: Colors.headerText,
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
});
