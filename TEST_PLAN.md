# Test Plan

## Startup Tests

- Run `npm run` and confirm the project scripts are listed.
- Run `npx tsc --noEmit` and confirm there are no TypeScript errors.
- Run `npx expo start --localhost --port 8082` and confirm Metro starts.
- Stop the Expo server after confirming it starts.

## Daily Task Tests

- Open the Today screen.
- Confirm the three tasks appear: 整理书包, 阅读 10 分钟, 早睡打卡.
- Tap one incomplete task.
- Confirm coins increase by 5.
- Confirm fertilizers increase by 1.
- Confirm the task button changes to 已完成.
- Tap the completed task again and confirm it cannot be claimed twice.

## Plant Growth Tests

- Tap 浇水 +10 XP.
- Confirm plant XP increases by 10.
- Water until XP reaches 100 total.
- Confirm the plant level increases by 1.
- Confirm XP keeps the remainder after leveling.
- Complete a daily task and confirm it also waters the selected plant once.

## Badge Tests

- Complete the first daily task and confirm the first-task badge unlocks.
- Water until the plant reaches Level 2 and confirm the level-2-plant badge unlocks.
- Water 3 total times and confirm the three-waters badge unlocks.
- Confirm unlocked badges do not duplicate.

## Collection Tests

- Complete one daily task and confirm the first collection item unlocks.
- Complete more daily tasks and confirm items unlock in list order.
- Confirm collected items do not duplicate.
- Confirm uncollected items display as ？？？.
- Confirm common items show 普通 and rare items show 稀有.

## Date Reset Tests

- Confirm `currentTaskDate` uses local `YYYY-MM-DD` format.
- Simulate a new local day.
- Open the Today screen.
- Confirm `completedTodayTaskIds` clears.
- Confirm coins, fertilizers, plants, badges, and collection items are not cleared.

## Persistence Tests

- Complete a task, water the plant, unlock a badge, and collect an item.
- Restart the app.
- Confirm coins and fertilizers persist.
- Confirm plant level, XP, and water count persist.
- Confirm completed task state persists for the same date.
- Confirm unlocked badges persist.
- Confirm collected items persist.

## Known Limits

- Daily reset uses device local date, not server time.
- Collection rewards are ordered, not random.
- There is no backend, login, or cloud sync.
- There are no complex animations.
- There is no automated test suite yet.
