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

import { playSound } from '../audio/AudioManager';
import { badges } from '../data/badges';
import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const backgroundImage = require('../../assets/garden_bg.png');

export function BadgeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unlockedBadgeIds = useGardenStore((state) => state.unlockedBadgeIds);
  const unlockedBadgeCount = badges.filter((badge) =>
    unlockedBadgeIds.includes(badge.id),
  ).length;
  const completionPercent = Math.round(
    (unlockedBadgeCount / badges.length) * 100,
  );

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
            <Text style={styles.title}>徽章</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.summaryPanel}>
          <Text style={styles.summaryLabel}>已获得</Text>
          <Text style={styles.summaryValue}>
            {unlockedBadgeCount} / {badges.length}
          </Text>
          <Text style={styles.summaryPercent}>完成度 {completionPercent}%</Text>
        </View>

        <View style={styles.badgeGrid}>
          {badges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <View
                key={badge.id}
                style={[styles.badgeCard, !isUnlocked && styles.badgeLocked]}
              >
                <View style={styles.badgeIcon}>
                  <Ionicons
                    name={isUnlocked ? badge.iconName : 'lock-closed'}
                    size={30}
                    color={isUnlocked ? Colors.headerText : Colors.bodyText}
                  />
                </View>
                <Text style={styles.badgeTitle}>
                  {isUnlocked ? badge.title : '？？？'}
                </Text>
                <Text style={styles.badgeDescription}>
                  {isUnlocked ? badge.description : '未获得'}
                </Text>
              </View>
            );
          })}
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
  summaryPercent: {
    color: Colors.leaf,
    fontSize: 18,
    fontWeight: '800',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    flexGrow: 1,
    gap: 8,
    minHeight: 148,
    minWidth: 150,
    padding: 14,
    width: '31%',
  },
  badgeLocked: {
    backgroundColor: '#E4E9E8',
    opacity: 0.72,
  },
  badgeIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  badgeTitle: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  badgeDescription: {
    color: Colors.bodyText,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
