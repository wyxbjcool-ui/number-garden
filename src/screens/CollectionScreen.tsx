import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  gachaRarityColors,
  gachaRarityLabels,
  gachaRewards,
} from '../data/gachaRewards';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { GachaRarity } from '../types/gacha';
import type { RootStackParamList } from '../types/navigation';

const backgroundImage = require('../../assets/garden_bg.png');

const rarityOrder: GachaRarity[] = [
  'common',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

const rarityCardColors: Record<GachaRarity, string> = {
  common: '#DFF5DE',
  rare: '#D9F0FF',
  epic: '#E9D9FF',
  legendary: '#FFE1AE',
  mythic: '#FFD7DE',
};

export function CollectionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const gachaRewardIds = useGardenStore((state) => state.gachaRewardIds);
  const collectedCount = gachaRewardIds.length;
  const totalCount = gachaRewards.length;
  const completionPercent = Math.round((collectedCount / totalCount) * 100);
  const isComplete = collectedCount === totalCount;

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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#FFF8D7" />
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
          <View style={styles.titleSign}>
            <Text style={styles.title}>收集册</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.summaryPanel}>
          <Text style={styles.summaryLabel}>已收集</Text>
          <Text style={styles.summaryValue}>
            {collectedCount} / {totalCount}
          </Text>
        </View>

        {rarityOrder.map((rarity) => {
          const rewards = gachaRewards.filter(
            (reward) => reward.rarity === rarity,
          );

          return (
            <View key={rarity} style={styles.raritySection}>
              <View style={styles.rarityHeader}>
                <View
                  style={[
                    styles.rarityDot,
                    { backgroundColor: gachaRarityColors[rarity] },
                  ]}
                />
                <Text style={styles.rarityTitle}>
                  {gachaRarityLabels[rarity]}
                </Text>
              </View>
              <View style={styles.rewardGrid}>
                {rewards.map((reward) => {
                  const isOwned = gachaRewardIds.includes(reward.id);

                  return (
                    <View
                      key={reward.id}
                      style={[
                        styles.rewardCard,
                        { backgroundColor: rarityCardColors[rarity] },
                        !isOwned && styles.rewardCardLocked,
                      ]}
                    >
                      <Text style={styles.rewardIcon}>
                        {isOwned ? reward.icon : '?'}
                      </Text>
                      <Text style={styles.rewardName}>
                        {isOwned ? reward.name : '未解锁'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.progressPanel}>
          <Text style={styles.progressTitle}>收集完成度</Text>
          <Text style={styles.progressValue}>
            已获得 {collectedCount} / {totalCount}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{completionPercent}%</Text>
          {isComplete ? (
            <View style={styles.completePanel}>
              <Text style={styles.completeTitle}>恭喜收集完成</Text>
              <Text style={styles.completeSubtitle}>小胖猫太厉害啦</Text>
            </View>
          ) : null}
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
    paddingBottom: 32,
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
  summaryPanel: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderColor: '#FFF0BA',
    borderRadius: 28,
    borderWidth: 3,
    minWidth: 260,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  summaryLabel: {
    color: Colors.bodyText,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryValue: {
    color: Colors.headerText,
    fontSize: 38,
    fontWeight: '800',
  },
  raritySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 26,
    borderWidth: 3,
    gap: 12,
    padding: 14,
  },
  rarityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rarityDot: {
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  rarityTitle: {
    color: Colors.headerText,
    fontSize: 23,
    fontWeight: '800',
  },
  rewardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rewardCard: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 3,
    gap: 6,
    minHeight: 118,
    paddingHorizontal: 8,
    paddingVertical: 12,
    width: '31.8%',
  },
  rewardCardLocked: {
    opacity: 0.55,
  },
  rewardIcon: {
    color: Colors.headerText,
    fontSize: 38,
    fontWeight: '800',
  },
  rewardName: {
    color: Colors.headerText,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  progressPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderColor: '#FFF0BA',
    borderRadius: 28,
    borderWidth: 3,
    gap: 8,
    padding: 18,
  },
  progressTitle: {
    color: Colors.headerText,
    fontSize: 23,
    fontWeight: '800',
  },
  progressValue: {
    color: Colors.bodyText,
    fontSize: 18,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: '#E6D2AA',
    borderColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    height: 22,
    overflow: 'hidden',
    width: '86%',
  },
  progressFill: {
    backgroundColor: Colors.leaf,
    height: '100%',
  },
  progressPercent: {
    color: Colors.headerText,
    fontSize: 20,
    fontWeight: '800',
  },
  completePanel: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  completeTitle: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: '800',
  },
  completeSubtitle: {
    color: Colors.bodyText,
    fontSize: 17,
    fontWeight: '800',
  },
});
