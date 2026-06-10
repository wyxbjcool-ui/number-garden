# Review Request

## Scope

Please review the Step 3 daily task system and its interaction with the Step 2 plant growth system.

## Focus Areas

- Zustand state shape is simple and ready for later MVP features.
- Plant XP and level behavior matches the rule: each watering adds 10 XP, and every 100 XP increases one level.
- AsyncStorage persistence keeps plant growth after app restart.
- DailyTask model is clear and local-first.
- Completing a daily task rewards +5 coins, +1 fertilizer, and one plant watering.
- Completed task IDs prevent duplicate claims and are persisted.
- UI remains simple and child-friendly.

## Out of Scope

- Animation.
- Networking.
- Store or payment flow.
- Multi-plant management UI.
- Calendar-based daily reset.

## Manual Test Ideas

- Open the app and confirm the plant area renders.
- Tap the watering button once and confirm XP increases by 10.
- Tap until XP reaches 100 and confirm level increases.
- Tap a daily task completion button and confirm coins, fertilizers, and plant XP update.
- Confirm a completed task cannot be claimed again.
- Restart the app and confirm plant state is retained.
- Restart the app and confirm completed task state is retained.
