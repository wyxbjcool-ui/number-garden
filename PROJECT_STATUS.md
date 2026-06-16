# Project Status

## Product

Number Garden（数字花园）是一个面向 4-8 岁儿童的本地习惯养成游戏 App。项目基于 Expo、React Native、TypeScript、Zustand、AsyncStorage 和 React Navigation，当前以 iPad / 手机本地试玩为主，不依赖账号、后端或云同步。

## Current Step

Step 49 前：Beta 文档同步与试玩准备。

## Current Status

当前项目已进入**可试玩 Beta 前状态**。  
核心玩法、奖励循环、小园丁等级、植物成长、抽奖与收集、徽章反馈、音效与数据持久化都已经接通，可以进行完整试玩。

## Completed

- Expo TypeScript 项目基础搭建。
- React Navigation 根导航。
- Zustand + AsyncStorage 本地持久化。
- 统一主题色 `theme.ts`。
- 首页游戏大厅。
- 小胖猫陪伴伙伴首页待机动画。
- 首页功能按钮悬浮动画。
- 首页进入动画。
- 资源栏金币 / 肥料反馈动画。
- 今日任务系统。
- 随机每日任务刷新。
- 数字小游戏。
- 粑粑时间 `PoopScreen`。
- 抽奖机 `GachaScreen`。
- 抽奖动画。
- 收集册摘要区与独立抽奖收集册页。
- 植物系统 `PlantScreen`。
- 植物成长反馈动画。
- 徽章系统 `BadgeScreen`。
- 徽章解锁提示动画。
- 成长等级系统与升级奖励。
- 音效系统 `AudioManager`。
- 数据持久化与启动恢复。
- 平衡性修复（限制无限刷成长/资源闭环）。
- TodayScreen 未使用 styles 清理。

## Core Playable Loop

1. 进入首页
2. 完成今日任务 / 做数字小游戏 / 记录粑粑时间
3. 获得金币、肥料，推进小园丁等级
4. 去植物页给植物施肥、升级植物
5. 去抽奖机消耗金币抽奖励
6. 查看收集册与徽章变化
7. 重启 App 后确认数据保留

## Known Issues

- 首页 [TodayScreen.tsx](/Users/fine/Documents/宝宝花园/number-garden/src/screens/TodayScreen.tsx:1) 仍然较大，后续需要做轻量拆分。
- 首页“收集册摘要”和独立抽奖收集册页面的概念还没有完全统一，后续正式版建议统一命名或合并。
- 每日限制依赖本地日期，手动修改系统时间理论上可以绕过，Beta 阶段可接受。
- `assets/` 目录中存在历史残留资源，后续需要整理正式资源路径。

## Not Included Yet

- 完整家长模式。
- 账号系统。
- 云同步。
- 后端服务。
- 支付 / 广告。
- 家长视角数据统计页。
- 粑粑详细记录（颜色、数量、气味、顺利程度）。
- 正式版统一收集册体系。
- 自动化测试套件。
