# 👾 数码兽引擎

![数码兽引擎](./assets/digimon-engine.png)
- [文档](https://docs.digimon.tech/digimon)：了解如何使用数码兽引擎构建您自己的游戏
- [数码兽训练师社区](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers)：加入社区获取帮助并分享您的游戏
- [示例游戏：DAMN](https://damn.fun)：体验使用数码兽引擎构建的示例游戏
  - [DAMN X直播](https://x.com/damndotfun/live)：观看游戏直播
  - [Solana AI黑客马拉松演示](https://www.youtube.com/watch?v=NNQWY-ByZww)：观看游戏和引擎演示

# 🌍 README 翻译
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# 概述
## 数码兽引擎：AI原生游戏和智能元宇宙的多智能体、多玩家框架
数码兽引擎是一个类似虚幻引擎的开源AI游戏平台。它支持社交和金融AI智能体，实现沉浸式AI原生游戏体验。我们正在准备引入新的具有AI智能体NPC的游戏。我们的目标是创建一个AI智能体框架，以构建类似西部世界的环境。

## MCP 服务器概述

与**外部客户端**、**LLMs**和**AI智能体**无缝集成，结合**MCP协议**、**DAMN.FUN SDK**和**数码兽引擎**的架构。这包括构建用于外部游戏/智能体创建、所有权和钱包连接的webhooks和新的REST API端点。

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- MCP架构的关键组件：
  - **主机、客户端、服务器**：可扩展的模块化设计。
  - **传输模型**：STDIO（标准输入/输出）+ SSE（服务器发送事件）用于实时通信。
  - **语言和运行时**：TypeScript用于MCP服务器核心逻辑。
  - **部署**：Docker用于容器化、环境无关的扩展。

## 架构概述

- 智能体：每个怪物/智能体都有独特的身份和动机，在世界中漫游、交谈并建立关系。未来，智能体将参考存储在向量数据库（Pinecone）中的记忆嵌入，使每次对话和决策都基于过往经历（持久记忆）。

- 游戏引擎：编排系统调度智能体活动，处理"运行智能体批次"任务，并管理碰撞。当预测到两个怪物的路径相交时，引擎将它们分组并触发对话序列。任务完成后，智能体可重新参与调度，确保世界活动持续进行，无需人工干预。

- 事件日志：追加式记录跟踪所有内容——智能体路径、对话时间戳以及对话参与者。在开始新路径前，怪物会查询事件日志以预测未来碰撞。如果最近未与相交的智能体交谈，它们会发起对话。事件日志还存储所有对话记录和坐标，以便准确回忆上下文和记忆嵌入。

- 记忆和向量数据库：对话或反思后，智能体总结经历并将其存储为向量嵌入（mxbai-embed-large）。这些嵌入可在之后检索并筛选相关内容，直接将过往上下文注入下一次对话的提示中。

- 游戏引擎设计的核心挑战之一是在扩展玩家和智能体数量的同时保持低延迟。因此，DAMN引入压缩状态（HistoryObject）来高效跟踪和重放移动。每个引擎刻度（约60次/秒）记录数值字段（如位置），然后在每个步骤结束时（1次/秒）存储压缩的"历史缓冲区"。客户端获取当前值和可重放缓冲区，渲染流畅动画而无跳跃。影响：对玩家和智能体而言，这种设计提供流畅的游戏体验——无卡顿或动画不连贯。在后台，这是一种简化的方法，保持高性能、可靠性，并可无缝扩展更多AI驱动角色。

- DAMN不依赖现有游戏引擎（如Unity或Godot），而是使用从零开始构建的自定义AI原生游戏引擎（用Typescript编写）。AI智能体和人类玩家被同等对待——没有二等公民NPC。每个刻度，引擎在内存中更新整个世界，赋予AI与人类相同的移动、互动和参与能力。这带来更有机、更动态的世界，AI不只是遵循脚本，而是真正参与游戏。

- 设计概述：
1. 调度器定期触发新的模拟步骤。
2. 引擎将游戏数据从数据库加载到内存中。
3. AI智能体和玩家提交操作或决策，都在统一循环中处理。
4. 应用游戏规则后，引擎计算变更"差异"并保存回数据库。

更多详情请参阅[架构概述](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview)。

# 💰 使用数码兽引擎及其代币启动游戏：

# 快速开始

### 前提条件

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### 社区和联系方式

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues)：最适合：报告使用数码兽引擎时遇到的bug和功能建议。
- [Discord](即将推出)：最适合：分享您的应用程序并与社区互动。
- [开发者Discord](即将推出)：最适合：获取帮助和插件开发。

## 贡献者

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a> 