# Review Request

## Scope

Please review the Step 2 plant growth system once implemented.

## Focus Areas

- Zustand state shape is simple and ready for later MVP features.
- Plant XP and level behavior matches the rule: each watering adds 10 XP, and every 100 XP increases one level.
- AsyncStorage persistence keeps plant growth after app restart.
- UI remains simple and child-friendly.

## Out of Scope

- Animation.
- Networking.
- Store or payment flow.
- Multi-plant management UI.

## Manual Test Ideas

- Open the app and confirm the plant area renders.
- Tap the watering button once and confirm XP increases by 10.
- Tap until XP reaches 100 and confirm level increases.
- Restart the app and confirm plant state is retained.

