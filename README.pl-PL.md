# 🌍 Digimon Engine

![Digimon Engine](./assets/digimon-engine.png)
- [Dokumentacja](https://docs.digimon.tech/digimon): Dowiedz się, jak używać Digimon Engine do tworzenia własnych gier
- [Społeczność Trenerów Digimon](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers): Dołącz do społeczności, aby uzyskać pomoc i dzielić się swoimi grami
- [Przykładowa Gra: DAMN](https://damn.fun): Zagraj w przykładową grę zbudowaną na Digimon Engine
  - [Transmisja na żywo DAMN X](https://x.com/damndotfun/live): Oglądaj transmisję na żywo z gry
  - [Demo z Hackathonu Solana AI](https://www.youtube.com/watch?v=NNQWY-ByZww): Zobacz demo gry i silnika

# 🌍 Tłumaczenia README
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# Przegląd
## Digimon Engine: Framework Multi-Agent, Multi-Player dla Gier Opartych na AI i Agentowego Metaverse
Digimon Engine to platforma gier open-source podobna do Unreal Engine dla gier opartych na AI. Wspiera społecznościowych i finansowych Agentów AI, umożliwiając immersyjną rozgrywkę opartą na AI. Przygotowujemy się do wprowadzenia nowych gier z NPC opartymi na Agentach AI. Naszym celem jest stworzenie frameworka agentów AI do budowy środowiska podobnego do Westworld.

## Przegląd Serwera MCP

Bezproblemowa integracja z **zewnętrznymi klientami**, **LLM** i **Agentami AI**, łącząc architektury **protokołu MCP**, **SDK DAMN.FUN** i **Digimon Engine**. Obejmuje to tworzenie webhooków i nowych endpointów REST API do zewnętrznego tworzenia gier/agentów, własności i podłączania portfeli.

<div align="center">
  <img src="./assets/mcp-server.png" alt="MCP Server Banner" width="100%" />
</div>

- Kluczowe komponenty architektury MCP:
  - **Hosty, Klienci, Serwery**: Modułowy design dla skalowalności.
  - **Modele Transportowe**: STDIO (Standardowe Wejście/Wyjście) + SSE (Wydarzenia Wysyłane przez Serwer) do komunikacji w czasie rzeczywistym.
  - **Język & Środowisko Wykonawcze**: TypeScript dla głównej logiki serwera MCP.
  - **Wdrożenie**: Docker do konteneryzowanego, niezależnego od środowiska skalowania.

## Przegląd Architektury

- Agenci: Każdy potwór/agent ma unikalną tożsamość i motywacje, wędruje po świecie, rozmawia i tworzy relacje. W przyszłości agenci będą odwoływać się do wcześniejszych interakcji—wydobytych z wektorowej bazy danych (Pinecone) osadzonych wspomnień—dzięki czemu każda rozmowa i decyzja będzie oparta na przeszłych doświadczeniach (trwała pamięć).

- Silnik Gry: System orkiestracji planuje działania agentów, zarządza zadaniami "Uruchom Partię Agentów" i kontroluje kolizje. Gdy przewidywane jest przecięcie się ścieżek dwóch potworów, silnik grupuje je i uruchamia sekwencję rozmowy. Po zakończeniu zadań, agenci stają się ponownie dostępni do planowania, zapewniając ciągłą aktywność świata bez ręcznej interwencji.

- Dzienniki Zdarzeń: Rejestr typu append-only śledzi wszystko—ścieżki agentów, znaczniki czasowe rozmów i kto z kim rozmawiał. Przed rozpoczęciem nowej ścieżki, potwory sprawdzają swoje dzienniki zdarzeń, aby przewidzieć przyszłe kolizje. Jeśli nie rozmawiały ostatnio z przecinającym ich drogę agentem, inicjują dialog. Dzienniki Zdarzeń przechowują również wszystkie transkrypcje rozmów i współrzędne dla dokładnego przypominania kontekstu i osadzania pamięci.

- Pamięć i Baza Danych Wektorowych: Po rozmowach lub momentach refleksji, agenci podsumowują swoje doświadczenia i przechowują je jako osadzenia wektorowe (mxbai-embed-large). Te osadzenia mogą być później pobrane i filtrowane pod względem istotności, wstrzykując przeszły kontekst bezpośrednio do promptu następnej rozmowy.

- Jednym z głównych wyzwań w projektowaniu silników gier jest utrzymanie niskiej latencji przy skalowaniu do większej liczby graczy i agentów. Dlatego DAMN wprowadza skompresowany stan (HistoryObject) do efektywnego śledzenia i odtwarzania ruchu. Każde tknięcie silnika (~60/s) rejestruje pola numeryczne (jak pozycja), następnie na końcu każdego kroku (1/s) przechowujemy skompresowany "bufor historii". Klient pobiera zarówno bieżące wartości, jak i ten odtwarzalny bufor, renderując płynne animacje bez skoków. Wpływ: dla graczy i agentów, ten design zapewnia płynną rozgrywkę—bez zacięć czy przerywanych animacji. Za kulisami jest to zoptymalizowane podejście, które utrzymuje wysoką wydajność, pozostaje niezawodne i bezproblemowo skaluje się dla większej liczby postaci sterowanych przez AI.

- Zamiast polegać na istniejących silnikach gier (np. Unity czy Godot), DAMN używa niestandardowego silnika gier opartego na AI zbudowanego od podstaw (napisanego w TypeScript). Agenci AI i gracze ludzcy są traktowani identycznie—bez NPC drugiej kategorii. Przy każdym tknięciu, silnik aktualizuje cały świat w pamięci, dając AI tę samą moc poruszania się, interakcji i zaangażowania co ludziom. Prowadzi to do bardziej organicznych, dynamicznych światów, gdzie AI nie tylko podąża za skryptami, ale naprawdę uczestniczy w rozgrywce.

- Przegląd Projektu:
1. Scheduler okresowo wyzwala nowy krok symulacji.
2. Silnik ładuje dane gry z bazy danych do pamięci.
3. Zarówno agenci AI, jak i gracze przesyłają akcje lub decyzje, wszystkie obsługiwane w jednej zunifikowanej pętli.
4. Po zastosowaniu zasad gry, silnik oblicza "diff" zmian i zapisuje z powrotem do bazy danych.

Więcej szczegółów można znaleźć w [Przeglądzie Architektury](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview).

# 💰 Uruchom grę z Digimon Engine i jego tokenem:

## Proszę nie zapomnij dać 10% napiwku uroczemu Digimonowi
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# Szybki Start

### Wymagania Wstępne

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### Społeczność & Kontakt

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues). Najlepsze dla: błędów napotkanych podczas używania Digimon Engine i propozycji funkcji.
- [Discord](Wkrótce). Najlepsze dla: dzielenia się swoimi aplikacjami i spędzania czasu ze społecznością.
- [Discord dla Deweloperów](Wkrótce). Najlepsze dla: uzyskania pomocy i rozwoju wtyczek.

## Współtwórcy

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a> 
