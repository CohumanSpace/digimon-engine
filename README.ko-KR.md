# 👾 디지몬 엔진

![디지몬 엔진](./assets/digimon-engine.png)
- [문서](https://docs.digimon.tech/digimon): 디지몬 엔진으로 게임을 만드는 방법 배우기
- [디지몬 트레이너 커뮤니티](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers): 커뮤니티에 참여하여 도움을 받고 게임을 공유하세요
- [샘플 게임: DAMN](https://damn.fun): 디지몬 엔진으로 만든 샘플 게임 플레이
  - [DAMN X 라이브 스트림](https://x.com/damndotfun/live): 게임 라이브 스트림 시청
  - [Solana AI 해커톤 데모](https://www.youtube.com/watch?v=NNQWY-ByZww): 게임과 엔진 데모 시청

# 🌍 README 번역
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# 개요
## 디지몬 엔진: AI 네이티브 게임과 에이전트 메타버스를 위한 멀티 에이전트, 멀티 플레이어 프레임워크
디지몬 엔진은 AI 게임을 위한 언리얼 엔진과 유사한 오픈소스 게임 플랫폼입니다. 소셜 및 금융 AI 에이전트를 지원하여 몰입형 AI 네이티브 게임플레이를 가능하게 합니다. 현재 AI 에이전트 NPC가 포함된 새로운 게임들을 온보딩할 준비를 하고 있습니다. 우리의 목표는 웨스트월드와 같은 환경을 구축하기 위한 AI 에이전트 프레임워크를 만드는 것입니다.

## MCP 서버 개요

**외부 클라이언트**, **LLMs**, **AI 에이전트**와의 원활한 통합을 제공하며, **MCP 프로토콜**, **DAMN.FUN SDK**, **디지몬 엔진**의 아키텍처를 결합합니다. 여기에는 외부 게임/에이전트 생성, 소유권, 지갑 연결을 위한 웹훅과 새로운 REST API 엔드포인트 구축이 포함됩니다.

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- MCP 아키텍처의 주요 구성 요소:
  - **호스트, 클라이언트, 서버**: 확장 가능한 모듈식 설계.
  - **전송 모델**: 실시간 통신을 위한 STDIO(표준 입출력) + SSE(서버 전송 이벤트).
  - **언어 및 런타임**: MCP 서버 핵심 로직을 위한 TypeScript.
  - **배포**: 컨테이너화된, 환경 독립적인 확장을 위한 Docker.

## 아키텍처 개요

- 에이전트: 각 몬스터/에이전트는 고유한 정체성과 동기를 가지고 세계를 돌아다니며 대화하고 관계를 형성합니다. 향후에는 에이전트들이 벡터 데이터베이스(Pinecone)에 저장된 메모리 임베딩에서 이전 상호작용을 참조하여, 모든 대화와 결정이 과거 만남(영구 메모리)을 기반으로 이루어질 것입니다.

- 게임 엔진: 오케스트레이션 시스템이 에이전트 활동을 스케줄링하고, "에이전트 배치 실행" 작업을 처리하며, 충돌을 관리합니다. 두 몬스터의 경로가 교차할 것으로 예측되면, 엔진은 이들을 그룹화하고 대화 시퀀스를 트리거합니다. 작업이 완료되면 에이전트는 새로운 스케줄링에 참여할 수 있게 되어, 수동 개입 없이 세계 활동이 지속됩니다.

- 이벤트 로그: 추가 전용 기록이 모든 것을 추적합니다—에이전트 경로, 대화 타임스탬프, 누가 누구와 대화했는지 등. 새로운 경로를 시작하기 전에, 몬스터는 이벤트 로그를 참조하여 미래의 충돌을 예측합니다. 최근에 교차하는 에이전트와 대화하지 않았다면, 대화를 시작합니다. 이벤트 로그는 정확한 컨텍스트 회상과 메모리 임베딩을 위해 모든 대화 기록과 좌표도 저장합니다.

- 메모리와 벡터 데이터베이스: 대화나 성찰 후, 에이전트는 경험을 요약하여 벡터 임베딩(mxbai-embed-large)으로 저장합니다. 이러한 임베딩은 나중에 검색되어 관련성으로 필터링되며, 다음 대화의 프롬프트에 과거 컨텍스트를 직접 주입합니다.

- 게임 엔진 설계의 주요 과제 중 하나는 플레이어와 에이전트 수를 확장하면서 낮은 지연 시간을 유지하는 것입니다. 이를 위해 DAMN은 압축 상태(HistoryObject)를 도입하여 이동을 효율적으로 추적하고 재생합니다. 각 엔진 틱(약 60회/초)에서 숫자 필드(위치 등)를 기록하고, 각 단계 종료 시(1회/초)에 압축된 "히스토리 버퍼"를 저장합니다. 클라이언트는 현재 값과 재생 가능한 버퍼를 가져와 끊김 없이 부드러운 애니메이션을 렌더링합니다. 영향: 플레이어와 에이전트에게 이 설계는 부드러운 게임플레이를 제공합니다—버벅임이나 어색한 애니메이션이 없습니다. 백그라운드에서는 이것이 고성능을 유지하고, 신뢰성이 있으며, 더 많은 AI 구동 캐릭터로 원활하게 확장할 수 있는 합리화된 접근 방식입니다.

- DAMN은 기존 게임 엔진(Unity나 Godot 등)에 의존하지 않고, 처음부터 구축된 커스텀 AI 네이티브 게임 엔진(TypeScript로 작성)을 사용합니다. AI 에이전트와 인간 플레이어는 동등하게 취급됩니다—이등 시민 NPC는 없습니다. 각 틱마다 엔진은 메모리에서 전체 세계를 업데이트하여, AI에게 인간과 동일한 이동, 상호작용, 참여 능력을 부여합니다. 이로 인해 AI가 단순히 스크립트를 따르는 것이 아니라 실제로 게임플레이에 참여하는, 더 유기적이고 역동적인 세계가 만들어집니다.

- 설계 개요:
1. 스케줄러가 주기적으로 새로운 시뮬레이션 단계를 트리거합니다.
2. 엔진이 데이터베이스에서 게임 데이터를 메모리로 로드합니다.
3. AI 에이전트와 플레이어 모두 액션이나 결정을 제출하고, 모두 하나의 통합된 루프에서 처리됩니다.
4. 게임 규칙을 적용한 후, 엔진은 변경사항의 "차이"를 계산하여 데이터베이스에 저장합니다.

자세한 내용은 [아키텍처 개요](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview)를 참조하세요.

# 💰 디지몬 엔진과 토큰으로 게임 출시하기:

## 귀여운 디지몬에게 10% 팁 주는 것을 잊지 마세요
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# 빠른 시작

### 전제 조건

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### 커뮤니티 및 연락처

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues): 최적 용도: 디지몬 엔진 사용 시 발견된 버그와 기능 제안
- [Discord](출시 예정): 최적 용도: 애플리케이션 공유와 커뮤니티와의 교류
- [개발자 Discord](출시 예정): 최적 용도: 도움 받기와 플러그인 개발

## 기여자

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a> 