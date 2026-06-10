# Changelog

## Unreleased

- Added local-date reset for completed daily tasks.
- Added `currentTaskDate` to persist the active daily task date.
- Added `refreshDailyTasksForToday` for resetting completed task IDs when the date changes.
- Added first version of the daily task system.
- Added three built-in daily tasks: 整理书包, 阅读 10 分钟, 早睡打卡.
- Added task completion rewards: +5 coins, +1 fertilizer, and one plant watering.
- Prevented completed tasks from being claimed more than once.
- Added project tracking documents.
- Added first version of the plant growth system.
- Added single-plant model with level, XP, and water count.
- Added watering action: each watering adds 10 XP, and every 100 XP increases one level.

## Step 1 Project Foundation

- Created Expo TypeScript app.
- Added React Navigation.
- Added Zustand with AsyncStorage persistence.
- Added shared theme colors.
- Added initial Number Garden screen.
