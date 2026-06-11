# Test Plan

## Startup Tests

- Run `npm run` and confirm the project scripts are listed.
- Run `npx tsc --noEmit` and confirm there are no TypeScript errors.
- Run `npx expo start --localhost --port 8082` and confirm Metro starts.
- Stop the Expo server after confirming it starts.

## Home UI Preview Tests

- Confirm the Today screen scrolls from top resources through collection items.
- Confirm the section order is understandable: resources, hero, current plant, plant catalog, tasks, math, badges, collection.
- Confirm the top coins and fertilizers pills wrap instead of squeezing on small screens.
- Confirm the plant card title, level, XP, and watering button are readable.
- Confirm daily task buttons are large enough to tap comfortably.
- Confirm completed tasks look visually weaker.
- Confirm badge cards wrap when the screen is narrow.
- Confirm collection cards wrap and do not overlap.
- Confirm the screen respects safe area through the native navigation layout.

## MVP Wrap-Up Checks

- Confirm the home screen is readable even though several MVP systems share one page.
- Confirm repeated visual patterns still feel consistent across plant, task, badge, collection, and math sections.
- Confirm docs describe the current MVP scope.
- Confirm no new business behavior was added during wrap-up cleanup.

## Daily Task Tests

- Open the Today screen.
- Confirm the three tasks appear: 整理书包, 阅读 10 分钟, 早睡打卡.
- Tap one incomplete task.
- Confirm coins increase by 5.
- Confirm fertilizers increase by 1.
- Confirm the task button changes to 已完成.
- Tap the completed task again and confirm it cannot be claimed twice.

## Plant Growth Tests

- Tap 浇水 +10 成长值.
- Confirm plant XP increases by 10.
- Confirm water count increases by 1.
- Water until XP reaches 100 total.
- Confirm the plant level increases by 1.
- Confirm XP keeps the remainder after leveling.
- Complete a daily task and confirm it also waters the selected plant once.
- Answer a math question correctly and confirm it adds 10 plant XP without increasing water count.

## Global Growth Tests

- On a fresh install, confirm growth starts at 第 1 级 and 成长值 0/100.
- Tap 浇水 +10 成长值 and confirm global growth value increases by 10.
- Complete a daily task and confirm global growth value increases by 10.
- Answer a math question correctly and confirm global growth value increases by 10.
- Answer a math question incorrectly and confirm global growth does not change.
- Reach 100 total global growth and confirm growth level increases by 1.
- Confirm global growth keeps the remainder after leveling.
- Restart the app and confirm growth level and growth value persist.

## Avatar Mode Tests

- Confirm the Today screen shows mode buttons for 花园, 宠物, and 精灵.
- Tap 花园 and confirm the main character area shows 我的小花园, 养分, and 浇水 wording.
- Tap 宠物 and confirm the main character area shows 我的成长伙伴, 亲密度, and 抚摸 wording.
- Tap 精灵 and confirm the main character area shows 数字小精灵, 魔法值, and 施法 wording.
- Confirm switching modes does not reset coins, fertilizers, growth, badges, collection, tasks, or math progress.
- Tap the mode action button and confirm it still adds shared growth.
- Restart the app and confirm the selected mode persists.

## Multi-Plant Tests

- Confirm the 植物图鉴 section appears on the Today screen.
- Confirm four plants appear: 多肉, 彩叶芋, 碰碰草, 蝴蝶兰.
- Confirm 多肉 is owned by default.
- Confirm 彩叶芋, 碰碰草, and 蝴蝶兰 show 未拥有.
- Tap 多肉 and confirm it remains selected.
- Tap a locked plant and confirm selectedPlantId does not change.
- Confirm watering applies XP to the selected plant.
- Confirm daily task rewards apply plant XP to the selected plant.
- Confirm math rewards apply plant XP to the selected plant.
- Restart the app and confirm existing 多肉 growth data is retained.

## Plant Unlock Tests

- Confirm 多肉 shows cost 0 through default ownership.
- Confirm 彩叶芋 costs 20 coins.
- Confirm 碰碰草 costs 30 coins.
- Confirm 蝴蝶兰 costs 50 coins.
- With insufficient coins, confirm locked plant cards show 金币不足 and do not unlock.
- With enough coins, tap 解锁 and confirm coins decrease by the plant cost.
- Confirm the unlocked plant is added to ownedPlantIds and selected immediately.
- Tap an already owned plant and confirm coins are not charged again.
- Restart the app and confirm unlocked plant ownership persists.

## Badge Tests

- Complete the first daily task and confirm the first-task badge unlocks.
- Water until the plant reaches Level 2 and confirm the level-2-plant badge unlocks.
- Water 3 total times and confirm the three-waters badge unlocks.
- Confirm math rewards alone do not unlock the three-waters badge.
- Confirm unlocked badges do not duplicate.

## Collection Tests

- Complete one daily task and confirm the first collection item unlocks.
- Complete more daily tasks and confirm items unlock in list order.
- Confirm collected items do not duplicate.
- Confirm uncollected items display as ？？？.
- Confirm common items show 普通 and rare items show 稀有.

## Math Mini-Game Tests

- Confirm the 数字小游戏 section appears on the Today screen.
- Confirm one unanswered question is shown at a time.
- Tap the correct answer and confirm the feedback says 答对了.
- Confirm a correct answer gives +3 coins.
- Confirm a correct answer gives +1 fertilizer.
- Confirm a correct answer adds +10 plant XP.
- Confirm a correct answer does not increase plant water count.
- Tap an incorrect answer on another question and confirm the feedback says 再试试.
- Confirm an incorrect answer gives no reward.
- Confirm an incorrect answer does not advance to the next question.
- Try the same question again after an incorrect answer and confirm a correct answer can still complete it.
- Confirm answered questions do not appear again.

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
- Confirm growth level and growth value persist.
- Confirm selected avatar mode persists.
- Confirm plant level, XP, and water count persist.
- Confirm completed task state persists for the same date.
- Confirm unlocked badges persist.
- Confirm collected items persist.
- Confirm answered math question IDs persist.

## Known Limits

- Daily reset uses device local date, not server time.
- Collection rewards are ordered, not random.
- There is no backend, login, or cloud sync.
- There are no complex animations.
- There is no automated test suite yet.
- Math questions are built in and not randomly generated yet.
- Advanced plant shop and unlock conditions are not implemented yet.
- The home screen is intentionally feature-dense for MVP and can later be split into tabs or separate screens.
- Global growth badges are not implemented yet.
- Dedicated garden, pet, and sprite gameplay screens are not implemented yet.
- Garden, pet, and sprite currently differ by presentation text only.
- iOS Simulator and Android device preview depend on local machine/device availability.
