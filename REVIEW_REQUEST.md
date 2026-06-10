# Review Request

## Scope

Please review the Step 4 badge achievement system and its interaction with daily tasks and plant growth.

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
- UI remains simple and child-friendly.

## Out of Scope

- Animation.
- Networking.
- Store or payment flow.
- Multi-plant management UI.
- Server-time validation.
- Badge reward payouts.

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
- Restart the app and confirm plant state is retained.
- Restart the app and confirm completed task state is retained.
- Restart the app and confirm unlocked badges are retained.
