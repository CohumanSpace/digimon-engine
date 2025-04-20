# 🐾 數碼寶貝引擎 🧌

![數碼寶貝引擎](./assets/digimon-engine.png)
- [文檔](https://docs.digimon.tech/digimon)：了解如何使用數碼寶貝引擎製作您自己的遊戲
- [數碼寶貝訓練師社群](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers)：加入社群以獲得幫助並分享您的遊戲
- [示例遊戲：DAMN](https://damn.fun)：體驗使用數碼寶貝引擎製作的示例遊戲
  - [DAMN 在 X 的直播](https://x.com/damndotfun/live)：觀看遊戲直播
  - [Solana AI 黑客松演示](https://www.youtube.com/watch?v=NNQWY-ByZww)：觀看遊戲和引擎的演示

# 🌍 README 翻譯
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# 概述
## 數碼寶貝引擎：AI原生遊戲和智能元宇宙的多智能體、多玩家框架
數碼寶貝引擎是一個類似虛幻引擎的開源AI遊戲平台。它支持社交和金融AI智能體，實現沉浸式AI原生遊戲體驗。我們正在準備引入新的遊戲，這些遊戲將具有AI智能體NPC。我們的目標是創建一個AI智能體框架，以建立類似西部世界的環境。

## MCP 伺服器概述

與**外部客戶端**、**LLMs**和**AI智能體**無縫集成，結合**MCP協議**、**DAMN.FUN SDK**和**數碼寶貝引擎**的架構。這包括構建用於外部遊戲/智能體創建、所有權和錢包連接的webhooks和新的REST API端點。

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- MCP架構的關鍵組件：
  - **主機、客戶端、伺服器**：可擴展的模塊化設計。
  - **傳輸模型**：STDIO（標準輸入/輸出）+ SSE（伺服器發送事件）用於實時通信。
  - **語言和運行時**：TypeScript用於MCP伺服器核心邏輯。
  - **部署**：Docker用於容器化、環境無關的擴展。

## 架構概述

- 智能體：每個怪獸/智能體都有獨特的身份和動機，在世界中漫遊、交談並建立關係。未來，智能體將參考先前的互動（從記憶嵌入的Pinecone向量數據庫中提取），使每次對話和決策都基於過去的經歷（持久記憶）。

- 遊戲引擎：編排系統安排智能體活動，處理"運行智能體批次"任務，並管理碰撞。當預測到兩個怪獸的路徑相交時，引擎將它們分組並觸發對話序列。任務完成後，智能體可再次進行新的調度，確保世界活動持續進行，無需手動干預。

- 事件日誌：追加式記錄追蹤所有內容—智能體的路徑、對話時間戳以及誰與誰交談。在開始新路徑之前，怪獸會查詢其事件日誌以預測未來的碰撞。如果最近沒有與相交的智能體聊天，他們會發起對話。事件日誌還存儲所有對話記錄和坐標，以便準確回顧上下文和記憶嵌入。

- 記憶和向量數據庫：在對話或反思時刻之後，智能體總結其經歷並將其存儲為向量嵌入（mxbai-embed-large）。這些嵌入可以稍後檢索並按相關性過濾，直接將過去的上下文注入到下一次對話的提示中。

- 遊戲引擎設計的核心挑戰之一是在擴展更多玩家和智能體的同時保持低延遲。這就是為什麼DAMN引入壓縮狀態（HistoryObject）來高效追蹤和重播移動。每個引擎刻度（約60次/秒）記錄數值字段（如位置），然後在每個步驟結束時（1次/秒）存儲壓縮的"歷史緩衝區"。客戶端獲取當前值和這個可重播的緩衝區，渲染流暢的動畫而不會有任何跳躍。影響：對於玩家和智能體，這種設計提供流暢的遊戲體驗—沒有卡頓或不連貫的動畫。在幕後，這是一種精簡的方法，保持高性能，保持可靠性，並為更多AI驅動的角色無縫擴展。

- 與使用現有遊戲引擎（如Unity或Godot）不同，DAMN使用從頭開始構建的自定義AI原生遊戲引擎（用Typescript編寫）。AI智能體和人類玩家被同等對待—沒有二等公民NPC。每一刻，引擎都在內存中更新整個世界，讓AI擁有與人類相同的移動、互動和參與能力。這導致更有機、更動態的世界，AI不僅僅是遵循腳本，而是真正參與遊戲。

- 設計概述：
1. 調度器定期觸發新的模擬步驟。
2. 引擎將遊戲數據從數據庫加載到內存中。
3. AI智能體和玩家都提交動作或決策，全部在一個統一的循環中處理。
4. 應用遊戲規則後，引擎計算變更的"差異"並將其保存回數據庫。

更多詳情請參閱[架構概述](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview)。

# 💰 使用數碼寶貝引擎及其代幣啟動遊戲：

## 請別忘了給可愛的數碼寶貝10%的小費
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# 快速開始

### 前置條件

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### 社群與聯繫

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues)。最適合：使用數碼寶貝引擎時遇到的錯誤和功能提議。
- [Discord](即將推出)。最適合：分享您的應用程序並與社群互動。
- [開發者 Discord](即將推出)。最適合：獲取幫助和插件開發。

## 貢獻者

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a> 