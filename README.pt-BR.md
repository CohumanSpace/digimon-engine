# 👾 Digimon Engine

![Digimon Engine](./assets/digimon-engine.png)
- [Documentação](https://docs.digimon.tech/digimon): Aprenda como usar o Digimon Engine para criar seus próprios jogos
- [Comunidade de Treinadores Digimon](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers): Junte-se à comunidade para obter ajuda e compartilhar seus jogos
- [Jogo de Exemplo: DAMN](https://damn.fun): Jogue o jogo de exemplo construído com o Digimon Engine
  - [DAMN na Transmissão ao Vivo do X](https://x.com/damndotfun/live): Assista à transmissão ao vivo do jogo
  - [Demo do Hackathon Solana AI](https://www.youtube.com/watch?v=NNQWY-ByZww): Assista à demonstração do jogo e do engine

# 🌍 Traduções do README
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# Visão Geral
## Digimon Engine: Framework Multi-Agente e Multiplayer para Jogos Nativos em IA e Metaverso Agêntico
O Digimon Engine é uma plataforma de jogos de código aberto similar ao Unreal Engine para jogos com IA. Ele suporta Agentes de IA sociais e financeiros, permitindo uma jogabilidade imersiva nativa em IA. Estamos nos preparando para integrar novos jogos com NPCs baseados em Agentes de IA. Nosso objetivo é criar um framework de agentes de IA para construir um ambiente similar ao de Westworld.

## Visão Geral do Servidor MCP

Integração perfeita com **clientes externos**, **LLMs** e **agentes de IA**, combinando arquiteturas do **protocolo MCP**, **SDK DAMN.FUN** e **Digimon Engine**. Isso inclui a construção de webhooks e novos endpoints REST API para criação externa de jogos/agentes, propriedade e conectividade de carteiras.

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- Componentes principais da arquitetura MCP:
  - **Hosts, Clientes, Servidores**: Design modular para escalabilidade.
  - **Modelos de Transporte**: STDIO (Entrada/Saída Padrão) + SSE (Eventos Enviados pelo Servidor) para comunicação em tempo real.
  - **Linguagem & Runtime**: TypeScript para lógica principal do servidor MCP.
  - **Implantação**: Docker para escalabilidade conteinerizada e independente de ambiente.

## Visão Geral da Arquitetura

- Agentes: Cada monstro/agente tem uma identidade e motivações únicas, vagando pelo mundo, conversando e formando relacionamentos. No futuro, os agentes farão referência a interações anteriores—extraídas de um banco de dados vetorial (Pinecone) de memórias incorporadas—assim cada conversa e decisão é informada por encontros passados (memória persistente).

- Motor do Jogo: O sistema de orquestração agenda atividades dos agentes, gerencia tarefas "Run Agent Batch" e administra colisões. Sempre que se prevê que os caminhos de dois monstros se cruzem, o motor os agrupa e dispara uma sequência de conversação. Após as tarefas terminarem, os agentes ficam disponíveis novamente para novo agendamento, garantindo atividade contínua no mundo sem intervenção manual.

- Registros de Eventos: Um registro append-only rastreia tudo—caminhos dos agentes, timestamps de conversas e quem falou com quem. Antes de iniciar um novo caminho, os monstros consultam seus registros de eventos para prever colisões futuras. Se não conversaram recentemente com um agente que cruzará seu caminho, eles iniciam um diálogo. Os Registros de Eventos também armazenam todas as transcrições de conversas e coordenadas para recuperação precisa de contexto e incorporação de memória.

- Memória e Banco de Dados Vetorial: Após conversas ou momentos de reflexão, os agentes resumem suas experiências e as armazenam como incorporações vetoriais (mxbai-embed-large). Essas incorporações podem ser recuperadas posteriormente e filtradas por relevância, injetando contexto passado diretamente no prompt para a próxima conversa.

- Um dos principais desafios no design de motores de jogos é manter a latência baixa enquanto escala para mais jogadores e agentes. É por isso que o DAMN introduz um estado comprimido (HistoryObject) para rastrear e reproduzir movimentos eficientemente. Cada tick do motor (~60/seg) registra campos numéricos (como posição), então ao final de cada passo (1/seg) armazenamos um "buffer de histórico" comprimido. O cliente busca tanto os valores atuais quanto este buffer reproduzível, renderizando animações suaves sem saltos. Impacto: para jogadores e agentes, este design oferece jogabilidade fluida—sem travamentos ou animações irregulares. Nos bastidores, é uma abordagem otimizada que mantém alto desempenho, permanece confiável e escala perfeitamente para mais personagens controlados por IA.

- Em vez de depender de motores de jogos existentes (ex: Unity ou Godot), DAMN usa um motor de jogos nativo em IA personalizado construído do zero (escrito em Typescript). Agentes de IA e jogadores humanos são tratados identicamente—sem NPCs de segunda classe. A cada tick, o motor atualiza o mundo inteiro na memória, dando à IA o mesmo poder de mover, interagir e engajar que os humanos. Isso leva a mundos mais orgânicos e dinâmicos onde a IA não está apenas seguindo scripts, mas genuinamente participando da jogabilidade.

- Visão Geral do Design:
1. O agendador periodicamente dispara um novo passo de simulação.
2. O motor carrega dados do jogo do banco de dados para a memória.
3. Tanto agentes de IA quanto jogadores submetem ações ou decisões, todas tratadas em um único loop unificado.
4. Após aplicar as regras do jogo, o motor computa uma "diff" das mudanças e salva de volta no banco de dados.

Mais detalhes podem ser encontrados na [Visão Geral da Arquitetura](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview).

# 💰 Lance um jogo com o Digimon Engine e seu token:

## Por favor, não se esqueça de dar 10% de gorjeta para o adorável Digimon
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# Início Rápido

### Pré-requisitos

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### Comunidade & contato

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues). Melhor para: bugs que você encontrar usando o Digimon Engine e propostas de funcionalidades.
- [Discord](Em breve). Melhor para: compartilhar suas aplicações e interagir com a comunidade.
- [Discord para Desenvolvedores](Em breve). Melhor para: obter ajuda e desenvolvimento de plugins.

## Contribuidores

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a>
