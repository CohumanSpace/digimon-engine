# 👾 Digimon Engine 🧌

![Digimon Engine](./assets/digimon-engine.png)
- [Dokumentation](https://docs.digimon.tech/digimon): Lernen Sie, wie Sie die Digimon Engine zum Erstellen Ihrer eigenen Spiele verwenden
- [Digimon Trainer Community](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers): Treten Sie der Community bei, um Hilfe zu erhalten und Ihre Spiele zu teilen
- [Beispielspiel: DAMN](https://damn.fun): Spielen Sie das mit der Digimon Engine erstellte Beispielspiel
  - [DAMN X Livestream](https://x.com/damndotfun/live): Schauen Sie sich den Livestream des Spiels an
  - [Solana AI Hackathon Demo](https://www.youtube.com/watch?v=NNQWY-ByZww): Sehen Sie sich die Demo des Spiels und der Engine an

# 🌍 README Übersetzungen
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# Überblick
## Digimon Engine: Multi-Agent, Multi-Player Framework für KI-native Spiele und Agentisches Metaverse
Digimon Engine ist eine Open-Source-Spieleplattform ähnlich der Unreal Engine für KI-Spiele. Sie unterstützt soziale und finanzielle KI-Agenten und ermöglicht immersives KI-natives Gameplay. Wir bereiten uns darauf vor, neue Spiele mit KI-Agenten-NPCs einzuführen. Unser Ziel ist es, ein KI-Agenten-Framework zu erstellen, um eine Westworld-ähnliche Umgebung aufzubauen.

## MCP-Server-Überblick

Nahtlose Integration mit **externen Clients**, **LLMs** und **KI-Agenten**, kombiniert mit Architekturen aus dem **MCP-Protokoll**, **DAMN.FUN SDK** und **Digimon Engine**. Dies umfasst den Aufbau von Webhooks und neuen REST-API-Endpunkten für externe Spiel-/Agentenerstellung, Eigentum und Wallet-Konnektivität.

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- Wichtige Komponenten der MCP-Architektur:
  - **Hosts, Clients, Server**: Modulares Design für Skalierbarkeit.
  - **Transportmodelle**: STDIO (Standard-Ein-/Ausgabe) + SSE (Server-Sent Events) für Echtzeitkommunikation.
  - **Sprache & Laufzeit**: TypeScript für MCP-Server-Kernlogik.
  - **Bereitstellung**: Docker für containerisierte, umgebungsunabhängige Skalierung.

## Architektur-Überblick

- Agenten: Jedes Monster/Agent hat eine einzigartige Identität und Motivation, wandert durch die Welt, spricht und baut Beziehungen auf. In Zukunft werden Agenten auf frühere Interaktionen verweisen—extrahiert aus einer Vektor-Datenbank (Pinecone) von Erinnerungs-Embeddings—sodass jedes Gespräch und jede Entscheidung von vergangenen Begegnungen geprägt ist (persistentes Gedächtnis).

- Spiel-Engine: Das Orchestrierungssystem plant Agentenaktivitäten, verwaltet "Run Agent Batch"-Aufgaben und steuert Kollisionen. Wenn vorhergesagt wird, dass sich die Wege zweier Monster kreuzen, gruppiert die Engine sie und löst eine Gesprächssequenz aus. Nach Abschluss der Aufgaben stehen die Agenten wieder für neue Planungen zur Verfügung, wodurch kontinuierliche Weltaktivität ohne manuelle Intervention gewährleistet wird.

- Ereignisprotokolle: Ein Append-only-Protokoll verfolgt alles—Agentenpfade, Gesprächszeitstempel und wer mit wem gesprochen hat. Bevor sie einen neuen Pfad beginnen, konsultieren Monster ihre Ereignisprotokolle, um zukünftige Kollisionen vorherzusagen. Wenn sie kürzlich nicht mit einem kreuzenden Agenten gesprochen haben, initiieren sie einen Dialog. Die Ereignisprotokolle speichern auch alle Gesprächstranskripte und Koordinaten für genauen Kontextabruf und Gedächtnis-Embedding.

- Gedächtnis & Vektor-Datenbank: Nach Gesprächen oder reflektiven Momenten fassen Agenten ihre Erfahrungen zusammen und speichern sie als Vektor-Embeddings (mxbai-embed-large). Diese Embeddings können später abgerufen und nach Relevanz gefiltert werden, wobei vergangener Kontext direkt in den Prompt für das nächste Gespräch eingebracht wird.

- Eine der Kernherausforderungen im Spiel-Engine-Design ist es, die Latenz niedrig zu halten, während für mehr Spieler und Agenten skaliert wird. Deshalb führt DAMN einen komprimierten Zustand (HistoryObject) ein, um Bewegungen effizient zu verfolgen und wiederzugeben. Jeder Engine-Tick (~60/Sek) protokolliert numerische Felder (wie Position), dann speichern wir am Ende jedes Schritts (1/Sek) einen komprimierten "Verlaufspuffer". Der Client holt sowohl aktuelle Werte als auch diesen abspielbaren Puffer und rendert flüssige Animationen ohne Sprünge. Auswirkung: Für Spieler und Agenten bietet dieses Design flüssiges Gameplay—keine Ruckler oder abgehackte Animationen. Hinter den Kulissen ist dies ein optimierter Ansatz, der hohe Leistung beibehält, zuverlässig bleibt und nahtlos für mehr KI-gesteuerte Charaktere skaliert.

- Anstatt sich auf bestehende Spiel-Engines (z.B. Unity oder Godot) zu verlassen, verwendet DAMN eine benutzerdefinierte KI-native Spiel-Engine, die von Grund auf neu entwickelt wurde (in Typescript geschrieben). KI-Agenten und menschliche Spieler werden identisch behandelt—keine zweitklassigen NPCs. Bei jedem Tick aktualisiert die Engine die gesamte Welt im Speicher und gibt der KI die gleiche Macht zur Bewegung, Interaktion und Engagement wie Menschen. Dies führt zu organischeren, dynamischeren Welten, in denen KI nicht nur Skripten folgt, sondern wirklich am Gameplay teilnimmt.

- Design-Überblick:
1. Der Scheduler löst periodisch einen neuen Simulationsschritt aus.
2. Die Engine lädt Spieldaten aus der Datenbank in den Speicher.
3. Sowohl KI-Agenten als auch Spieler reichen Aktionen oder Entscheidungen ein, die alle in einer einheitlichen Schleife verarbeitet werden.
4. Nach Anwendung der Spielregeln berechnet die Engine eine "Diff" der Änderungen und speichert sie zurück in die Datenbank.

Weitere Details finden Sie im [Architektur-Überblick](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview).

# 💰 Starten Sie ein Spiel mit der Digimon Engine und ihrem Token:

## Bitte vergessen Sie nicht, dem niedlichen Digimon 10% Trinkgeld zu geben
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# Schnellstart

### Voraussetzungen

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### Community & Kontakt

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues). Am besten für: Bugs, die Sie bei der Verwendung der Digimon Engine finden, und Funktionsvorschläge.
- [Discord](Demnächst). Am besten für: Teilen Ihrer Anwendungen und Austausch mit der Community.
- [Entwickler Discord](Demnächst). Am besten für: Hilfe erhalten und Plugin-Entwicklung.

## Mitwirkende

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a>
