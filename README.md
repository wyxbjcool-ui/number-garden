# Number Garden

数字花园 Number Garden 是一个面向 4-8 岁儿童的本地习惯养成游戏 App。  
项目以“奖励、成长、收集”为核心，不做惩罚、不做失败反馈，当前版本以**可试玩 Beta**为目标。

## 项目简介

- 技术栈：Expo、React Native、TypeScript、Zustand、AsyncStorage、React Navigation、Expo Vector Icons
- 运行方式：本地运行
- 当前不包含：登录、注册、云同步、支付、广告、后端服务

## 当前核心玩法

- 首页游戏大厅：中央小胖猫、六个功能入口、成长面板、资源栏
- 今日任务：完成任务获得金币、肥料、成长推进
- 数字小游戏：答对获得奖励，答错可重试
- 粑粑时间：每日一次记录与奖励
- 植物系统：解锁植物、喂肥料、成长到成熟、领取成熟奖励
- 抽奖机：消耗金币抽取奖励，重复奖励返还部分金币
- 收集册：查看抽奖获得的收集物
- 徽章系统：根据行为自动解锁徽章
- 成长等级：全局成长值升级并发放升级奖励
- 数据持久化：重启 App 后保留主要进度

## 主要页面

- 首页 `TodayScreen`
- 粑粑时间 `PoopScreen`
- 抽奖机 `GachaScreen`
- 收集册 `CollectionScreen`
- 徽章页 `BadgeScreen`
- 植物页 `PlantScreen`

## 如何运行

安装依赖：

```sh
npm install
```

启动项目：

```sh
npx expo start
```

常用预览方式：

- Expo Go：扫描终端中的二维码
- iOS Simulator：在 Expo 终端中按 `i`
- Android Emulator：在 Expo 终端中按 `a`

更多说明见 [PREVIEW_GUIDE.md](/Users/fine/Documents/宝宝花园/number-garden/PREVIEW_GUIDE.md:1)。

## 当前 Beta 试玩路线

建议按下面顺序试玩：

1. 进入首页
2. 完成今日任务
3. 做数字小游戏
4. 记录一次粑粑时间
5. 查看金币 / 肥料 / 成长变化
6. 去抽奖机抽一次
7. 查看收集册
8. 去植物页喂肥料
9. 查看徽章页
10. 重启 App，检查数据是否保留

## 收集册说明

当前 Beta 中有两个相关概念：

- 首页摘要区：偏“成长 / 收集进度展示”
- 独立收集册页：主要展示**抽奖获得物**

后续正式版建议统一命名或合并，避免儿童和测试者混淆。

## 检查命令

TypeScript 检查：

```sh
npx tsc --noEmit
```

查看 Expo 启动参数：

```sh
npx expo start --help
```
