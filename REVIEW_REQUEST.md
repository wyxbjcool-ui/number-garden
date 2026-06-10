# Review Request

## Scope

Please review the Step 9 math mini-game system.

## Focus Areas

- Zustand state shape is simple and ready for later MVP features.
- Plant XP and level behavior matches the rule: each watering adds 10 XP, and every 100 XP increases one level.
- AsyncStorage persistence keeps plant growth after app restart.
- DailyTask model is clear and local-first.
- Completing a daily task rewards +5 coins, +1 fertilizer, and one plant watering.
- Completed task IDs prevent duplicate claims and are persisted.
- Daily task reset uses local `YYYY-MM-DD` date and only clears completed task IDs.
- Badge model is simple and local-first.
- Badges unlock automatically after completing tasks or watering plants.
- Unlocked badge IDs are not duplicated and are persisted.
- Home screen badge count and badge list render clearly.
- CollectionItem model is simple and local-first.
- Completing a daily task grants the next uncollected collection item.
- Collected item IDs are not duplicated and are persisted.
- Home screen collection progress and item list render clearly.
- Badge icon typing is narrowed to Ionicons icon names.
- Today screen uses ScrollView and avoids content overflow.
- Coins and fertilizers are visible near the top.
- Plant, task, badge, and collection sections are visually clearer.
- Completed daily tasks are visually weaker while remaining readable.
- Collection rarity labels show 普通 and 稀有.
- TEST_PLAN.md covers startup, daily tasks, plant growth, badges, collection, date reset, persistence, and known limits.
- TypeScript checks pass.
- Expo start reaches Metro startup.
- Top resource pills wrap on narrow screens.
- Daily task buttons are larger and easier to tap.
- Badge cards wrap instead of staying cramped in one row.
- Collection cards can grow and wrap cleanly.
- ScrollView uses automatic content inset adjustment.
- MathGame model is simple and local-first.
- Built-in questions cover 20以内加减法, simple patterns, and comparison.
- Each math question can only be answered once.
- Correct answers reward +3 coins, +1 fertilizer, and +10 plant XP.
- Answered math question IDs persist.
- UI remains simple and child-friendly.

## Out of Scope

- Animation.
- Networking.
- Store or payment flow.
- Multi-plant management UI.
- Server-time validation.
- Badge reward payouts.
- Random collection drops.
- Complex animations.
- Automated test suite.
- Business logic changes.
- Generated or randomized math questions.

## Manual Test Ideas

- Open the app and confirm the plant area renders.
- Tap the watering button once and confirm XP increases by 10.
- Tap until XP reaches 100 and confirm level increases.
- Tap a daily task completion button and confirm coins, fertilizers, and plant XP update.
- Confirm a completed task cannot be claimed again.
- Change to a new local date and confirm completed tasks reset without clearing coins, fertilizers, or plants.
- Complete one task and confirm the first-task badge unlocks.
- Water until the plant reaches Level 2 and confirm the level-2-plant badge unlocks.
- Water 3 total times and confirm the three-waters badge unlocks.
- Complete daily tasks and confirm collection items unlock in list order.
- Confirm collected items cannot be duplicated.
- Confirm the Today screen scrolls when content is taller than the viewport.
- Confirm completed task cards look visually weaker and cannot be claimed again.
- Confirm common collection items show 普通 and rare items show 稀有.
- Follow TEST_PLAN.md manually on an iPad or simulator.
- Check iPhone small screen layout for resource pills, task buttons, badges, and collection cards.
- Check Android layout when an Android device or emulator is available.
- Answer one math question correctly and confirm coins, fertilizer, and plant XP update.
- Answer one math question incorrectly and confirm no reward is given.
- Confirm answered math questions do not appear again.
- Restart the app and confirm plant state is retained.
- Restart the app and confirm completed task state is retained.
- Restart the app and confirm unlocked badges are retained.
- Restart the app and confirm collected items are retained.
