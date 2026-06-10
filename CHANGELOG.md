# Changelog

## Unreleased

- Refactored repeated plant growth calculation into a shared internal helper.
- Kept plant level, XP remainder, and water count behavior unchanged.
- Added first version of the plant unlock system.
- Added unlock costs for all built-in plants.
- Added coin-based `unlockPlant` action.
- Added unlock, insufficient-coins, and owned states to the plant catalog.
- Unlocking a plant now adds it to ownedPlantIds and selects it immediately.
- Added first version of the multi-plant system.
- Added four built-in plants: 多肉, 彩叶芋, 碰碰草, 蝴蝶兰.
- Added plant catalog UI with owned, locked, and selected states.
- Added selected plant switching for owned plants.
- Preserved existing succulent growth data during persisted state merge.
- Fixed math mini-game retry behavior so incorrect answers do not mark questions as answered.
- Confirmed the built-in math game set contains five questions across addition/subtraction, patterns, and comparison.
- Added first version of the math mini-game system.
- Added five built-in questions covering 20以内加减法, simple patterns, and comparison.
- Added persisted answered math question IDs.
- Added correct-answer rewards: +3 coins, +1 fertilizer, and +10 plant XP.
- Added a home screen math mini-game section.
- Added manual test plan for startup, tasks, plant growth, badges, collection, date reset, and persistence.
- Verified TypeScript compilation with `npx tsc --noEmit`.
- Verified Expo start command reaches Metro startup.
- Removed an unnecessary Ionicons type assertion after narrowing Badge icon typing.
- Polished the Today screen with ScrollView support.
- Moved coins and fertilizers into a clearer top resource row.
- Made the plant area feel more like a growth card.
- Clarified task, badge, and collection sections.
- Added softer completed-task styling and localized collection rarity labels.
- Added first version of the collection system.
- Added five built-in collection items.
- Added ordered collection reward after completing daily tasks.
- Added collection progress and item list to the home screen.
- Tightened Badge `iconName` typing to Ionicons icon names.
- Added first version of the badge achievement system.
- Added three built-in badges: first-task, level-2-plant, and three-waters.
- Added automatic badge unlock checks after completing tasks and watering plants.
- Added badge count and badge list to the home screen.
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
