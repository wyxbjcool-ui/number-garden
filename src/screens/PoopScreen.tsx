import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGardenStore } from '../store/useGardenStore';
import { Colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const poopImage = require('../../assets/cat-poop.png');

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
  const poopRecordDate = useGardenStore((state) => state.poopRecordDate);
  const recordPoopToday = useGardenStore((state) => state.recordPoopToday);
  const [message, setMessage] = useState<string | null>(null);
  const today = useMemo(() => getLocalDateString(), []);
  const isCompletedToday = poopRecordDate === today;

  const handleRecordPoop = () => {
    const didRecord = recordPoopToday();

    setMessage(
      didRecord
        ? '获得奖励：金币 +10 · 肥料 +5 · 成长值 +10'
        : '今天已经记录过啦',
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.headerText} />
          <Text style={styles.backButtonText}>返回</Text>
        </Pressable>
        <Text style={styles.title}>粑粑时间</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.statusCard}>
        <View
          style={[
            styles.statusIconWrap,
            isCompletedToday && styles.statusIconWrapDone,
          ]}
        >
          {isCompletedToday ? (
            <Ionicons
              name="checkmark-circle"
              size={96}
              color={Colors.leaf}
            />
          ) : (
            <Image
              source={poopImage}
              resizeMode="contain"
              style={styles.poopImage}
            />
          )}
        </View>
        <Text style={styles.statusTitle}>
          {isCompletedToday ? '今天已经完成啦' : '今天还没有记录'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {isCompletedToday ? '小花园收到养分了' : '准备好了就点下面的大按钮'}
        </Text>
      </View>

      {message ? (
        <View style={styles.rewardNotice}>
          <Text style={styles.rewardNoticeText}>{message}</Text>
        </View>
      ) : null}

      <Pressable style={styles.recordButton} onPress={handleRecordPoop}>
        <Text style={styles.recordButtonText}>我今天已经粑粑啦</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    gap: 24,
    padding: 22,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 4,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: Colors.headerText,
    fontSize: 17,
    fontWeight: '800',
  },
  title: {
    color: Colors.headerText,
    fontSize: 34,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 86,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 4,
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: 24,
  },
  statusIconWrap: {
    alignItems: 'center',
    backgroundColor: '#FFF8D7',
    borderRadius: 78,
    height: 156,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 156,
  },
  statusIconWrapDone: {
    backgroundColor: Colors.lightGreen,
  },
  poopImage: {
    height: 260,
    width: 174,
  },
  statusTitle: {
    color: Colors.headerText,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: Colors.bodyText,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  rewardNotice: {
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rewardNoticeText: {
    color: Colors.headerText,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    minHeight: 76,
    paddingHorizontal: 24,
  },
  recordButtonText: {
    color: Colors.headerText,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
});
