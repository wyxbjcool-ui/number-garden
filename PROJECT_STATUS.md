# Project Status

## Product

Number Garden is a local-first Expo React Native app for children ages 4-8. The app focuses on gentle habit building through rewards, growth, and collection.

## Current Step

Step 32: Data persistence acceptance check.

## Completed

- Expo TypeScript project foundation.
- React Navigation root stack.
- Zustand store with AsyncStorage persistence.
- Shared color theme.
- Initial home screen shell.
- GitHub remote connected.
- Single-plant growth system.
- Plant XP and level rules.
- Watering action persisted through Zustand.
- DailyTask model.
- Built-in daily task list.
- Daily task completion rewards coins, fertilizers, and plant XP.
- Completed daily task IDs persisted through Zustand.
- Local-date daily task reset.
- Badge model.
- Three built-in badges.
- Automatic badge unlock checks after daily tasks and watering.
- Unlocked badge IDs persisted through Zustand.
- Home screen badge count and badge list.
- CollectionItem model.
- Five built-in collection items.
- Daily task completion grants the next uncollected item.
- Collected item IDs persisted through Zustand.
- Home screen collection progress and item list.
- Scrollable Today screen.
- Clearer home sections for plant, tasks, badges, and collection.
- Softer completed task presentation.
- Localized collection rarity labels.
- Manual test plan.
- TypeScript stability check.
- Expo startup check.
- Ionicons icon typing cleanup.
- MathGame model.
- Five built-in math questions for early elementary level.
- Math answer state persisted through Zustand.
- Correct math answers reward coins, fertilizer, and plant XP.
- Home screen math mini-game section.
- Incorrect math answers can be retried without consuming the question.
- Four built-in plants.
- Owned plant list defaults to succulent.
- Home screen plant catalog and selected plant switching.
- Locked display for unowned plants.
- Persisted plant merge keeps existing succulent growth data.
- Plant unlock costs.
- Coin-based plant unlock action.
- Unlocked plants join ownedPlantIds and become selectable.
- Plant catalog unlock price and affordability states.
- Shared plant growth helper.
- Plant growth semantics separated XP gain from water count.
- Manual watering and daily task watering count toward water count.
- Math XP rewards do not count as watering.
- MVP documentation review.
- TypeScript check.
- Expo CLI availability check.
- Home screen readability review.
- Global growth XP and level state.
- Shared `addGrowthXp` action.
- Watering, daily tasks, and correct math answers now add global growth.
- Existing per-plant level and XP data is retained.
- Home screen shows child-friendly growth level and growth value.
- AvatarMode type with garden, pet, and sprite modes.
- Persisted avatar mode selection.
- Shared avatar mode configuration for title, subtitle, growth label, and action label.
- Today screen mode switcher for 花园, 宠物, and 精灵.
- Main character area adapts wording by mode while sharing the same growth system.
- Game-style first screen on TodayScreen.
- Central avatar scene with mode-specific garden, pet, and sprite backgrounds.
- Feature orb entry buttons around the main character.
- Entry buttons scroll to existing detailed sections.
- Placeholder notices for 粑粑时间 and 抽奖机.
- Reserved artwork container style names for future Canva or AI assets.
- Game home screen art assets integrated.
- Home screen light animations and button press feedback.
- Poop time MVP screen with once-per-day rewards.
- Game-style poop time screen art.
- Gacha machine MVP with rarity pool, duplicate conversion, and coin cost.
- Gacha collection screen with rarity groups and completion stats.
- Level-up reward system for global growth.
- Plant almanac MVP with five plants, unlock costs, fertilizer feeding, stages, and maturity rewards.
- Home screen current plant display.
- Badge system V1 with seven badges, automatic unlock checks, home toast, and dedicated BadgeScreen.
- Collection screen displays gacha rewards.
- Persistence acceptance check completed for coins, fertilizers, growth, plants, gacha records, collection, badges, and poop record.

## Not Included Yet

- Login or account system.
- Backend or cloud sync.
- Payment, ads, or store features.
- Complex animation.
- Server-time daily reset.
- Random collection drops.
- Advanced animations.
- Automated test suite.
- Randomized math question generation.
- Advanced plant shop or unlock conditions.
- Split-tab navigation for a less dense home screen.
- Global growth badges.
- Dedicated game interfaces for garden, pet, and sprite modes.
- Final illustrated assets for every plant stage and every character state.
- Full poop record details such as color, amount, smell, and comfort.
- Ten-pull gacha, pity rules, payment, ads, or online sync.
