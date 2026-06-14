import type { DailyTask } from '../types/dailyTask';

export const dailyTaskPool: DailyTask[] = [
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
  {
    id: 'tidy-toys',
    title: '收拾玩具',
    description: '把玩具送回它们的小家',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
  {
    id: 'brush-teeth',
    title: '自己刷牙',
    description: '张大嘴巴，牙齿亮晶晶',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
  {
    id: 'help-parents',
    title: '帮爸爸妈妈',
    description: '一起做一件小小的家务',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
  {
    id: 'wash-hands',
    title: '洗手打卡',
    description: '饭前便后把小手洗干净',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
  {
    id: 'tidy-picture-books',
    title: '整理绘本',
    description: '把绘本整整齐齐放回书架',
    rewardCoins: 5,
    rewardFertilizers: 1,
  },
];

const DAILY_TASK_COUNT = 3;

export const getRandomDailyTasks = () => {
  const shuffledTasks = [...dailyTaskPool];

  for (let index = shuffledTasks.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentTask = shuffledTasks[index];
    shuffledTasks[index] = shuffledTasks[randomIndex];
    shuffledTasks[randomIndex] = currentTask;
  }

  return shuffledTasks.slice(0, DAILY_TASK_COUNT);
};

export const defaultDailyTasks = getRandomDailyTasks();
