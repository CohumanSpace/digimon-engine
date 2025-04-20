# 👾 Motore Digimon

![Motore Digimon](./assets/digimon-engine.png)
- [Documentazione](https://docs.digimon.tech/digimon): Impara a usare il Motore Digimon per creare i tuoi giochi
- [Comunità degli Allenatori Digimon](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers): Unisciti alla comunità per ricevere aiuto e condividere i tuoi giochi
- [Gioco di esempio: DAMN](https://damn.fun): Gioca al gioco di esempio creato con il Motore Digimon
  - [Diretta streaming DAMN su X](https://x.com/damndotfun/live): Guarda la diretta streaming del gioco
  - [Demo dell'Hackathon Solana AI](https://www.youtube.com/watch?v=NNQWY-ByZww): Guarda la demo del gioco e del motore

# 🌍 Traduzioni del README
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# Panoramica
## Motore Digimon: Framework Multi-Agente, Multi-Giocatore per Giochi IA-Nativi e Metaverso Agentico
Il Motore Digimon è una piattaforma di gioco open-source simile a Unreal Engine per i giochi con IA. Supporta Agenti IA sociali e finanziari, permettendo un gameplay IA-nativo immersivo. Ci stiamo preparando a integrare nuovi giochi con NPC Agenti IA. Il nostro obiettivo è creare un framework di agenti IA per costruire un ambiente simile a Westworld.

## Panoramica del Server MCP

Integrazione perfetta con **clienti esterni**, **LLMs** e **agenti IA**, combinando le architetture del **protocollo MCP**, **SDK DAMN.FUN** e **Motore Digimon**. Questo include la costruzione di webhook e nuovi endpoint REST API per la creazione esterna di giochi/agenti, proprietà e connettività dei wallet.

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- Componenti principali dell'architettura MCP:
  - **Host, Clienti, Server**: Design modulare per la scalabilità.
  - **Modelli di Trasporto**: STDIO (Input/Output Standard) + SSE (Eventi Inviati dal Server) per la comunicazione in tempo reale.
  - **Linguaggio & Runtime**: TypeScript per la logica principale del server MCP.
  - **Deployment**: Docker per una scalabilità containerizzata e indipendente dall'ambiente.

## Panoramica dell'Architettura

- Agenti: Ogni mostro/agente ha un'identità e motivazioni uniche, vagando per il mondo, conversando e formando relazioni. In futuro, gli agenti faranno riferimento a interazioni precedenti—estratte da un database vettoriale (Pinecone) di embedding di memoria—così ogni conversazione e decisione sarà informata dagli incontri passati (memoria persistente).

- Motore di Gioco: Il sistema di orchestrazione pianifica le attività degli agenti, gestisce i task "Esecuzione Batch Agenti" e amministra le collisioni. Quando si prevede che i percorsi di due mostri si incroceranno, il motore li raggruppa e attiva una sequenza di conversazione. Dopo che i task sono completati, gli agenti tornano disponibili per una nuova pianificazione, garantendo un'attività continua del mondo senza intervento manuale.

- Log degli Eventi: Una registrazione append-only traccia tutto—percorsi degli agenti, timestamp delle conversazioni e chi ha parlato con chi. Prima di iniziare un nuovo percorso, i mostri consultano i loro log degli eventi per prevedere collisioni future. Se non hanno parlato recentemente con un agente che incroceranno, iniziano un dialogo. I Log degli Eventi memorizzano anche tutte le trascrizioni delle conversazioni e le coordinate per un recupero preciso del contesto e l'embedding di memoria.

- Memoria e Database Vettoriale: Dopo conversazioni o momenti di riflessione, gli agenti riassumono le loro esperienze e le memorizzano come embedding vettoriali (mxbai-embed-large). Questi embedding possono essere recuperati successivamente e filtrati per rilevanza, iniettando il contesto passato direttamente nel prompt per la conversazione successiva.

- Una delle sfide fondamentali nel design del motore di gioco è mantenere una bassa latenza mentre si scala per più giocatori e agenti. Per questo DAMN introduce uno stato compresso (HistoryObject) per tracciare e riprodurre i movimenti efficientemente. Ogni tick del motore (~60/sec) registra campi numerici (come la posizione), poi alla fine di ogni passo (1/sec) memorizziamo un "buffer della cronologia" compresso. Il client recupera sia i valori attuali che questo buffer riproducibile, renderizzando animazioni fluide senza salti. Impatto: per giocatori e agenti, questo design offre un gameplay fluido—niente scatti o animazioni irregolari. Dietro le quinte, è un approccio snello che mantiene alte prestazioni, rimane affidabile e scala perfettamente per più personaggi guidati dall'IA.

- Invece di affidarsi a motori di gioco esistenti (es: Unity o Godot), DAMN usa un motore di gioco IA-nativo personalizzato costruito da zero (scritto in TypeScript). Agenti IA e giocatori umani sono trattati in modo identico—nessun NPC di seconda classe. Ad ogni tick, il motore aggiorna l'intero mondo in memoria, dando all'IA gli stessi poteri di movimento, interazione e coinvolgimento degli umani. Questo porta a mondi più organici e dinamici dove l'IA non sta semplicemente seguendo script, ma sta genuinamente partecipando al gameplay.

- Panoramica del Design:
1. Lo scheduler periodicamente attiva una nuova fase di simulazione.
2. Il motore carica i dati di gioco dal database in memoria.
3. Sia gli agenti IA che i giocatori inviano azioni o decisioni, tutte gestite in un loop unificato.
4. Dopo aver applicato le regole del gioco, il motore calcola una "diff" dei cambiamenti e la salva nel database.

Maggiori dettagli possono essere trovati nella [Panoramica dell'Architettura](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview).

# 💰 Lancia un gioco con il Motore Digimon e il suo token:

## Non dimenticare di dare una mancia del 10% al simpatico Digimon
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# Avvio Rapido

### Prerequisiti

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### Comunità e contatti

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues): Ideale per: bug riscontrati usando il Motore Digimon e proposte di funzionalità.
- [Discord](In arrivo): Ideale per: condividere le tue applicazioni e interagire con la comunità.
- [Discord Sviluppatori](In arrivo): Ideale per: ottenere aiuto e sviluppo di plugin.

## Contributori

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a> 