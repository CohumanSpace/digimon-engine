# 👾 Motor Digimon 🧌

![Motor Digimon](./assets/digimon-engine.jpg)
- [Documentación](https://docs.digimon.tech/digimon): Aprende a usar el Motor Digimon para crear tus propios juegos
- [Comunidad de Entrenadores Digimon](https://docs.digimon.tech/digimon/community/welcome-aboard-digimon-trainers): Únete a la comunidad para obtener ayuda y compartir tus juegos
- [Juego de ejemplo: DAMN](https://damn.fun): Juega al juego de ejemplo creado con el Motor Digimon
  - [Transmisión en vivo de DAMN en X](https://x.com/digimon_tech/live): Mira la transmisión en vivo del juego
  - [Demo del Hackathon Solana AI](https://www.youtube.com/watch?v=NNQWY-ByZww): Mira la demo del juego y del motor

# 🌍 Traducciones del README
[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md) | [日本語](./README.ja-JP.md) | [Deutsch](./README.de-DE.md) | [Français](./README.fr-FR.md) | [Português](./README.pt-BR.md) | [Italiano](./README.it-IT.md) | [Español](./README.es-ES.md) | [Русский](./README.ru-RU.md) | [Türkçe](./README.tr-TR.md) | [Polski](./README.pl-PL.md)

# Descripción General
## Motor Digimon: Framework Multi-Agente, Multi-Jugador para Juegos IA-Nativos y Metaverso Agéntico
El Motor Digimon es una plataforma de juegos de código abierto similar a Unreal Engine para juegos con IA. Soporta Agentes de IA sociales y financieros, permitiendo una jugabilidad IA-nativa inmersiva. Nos estamos preparando para integrar nuevos juegos con NPCs Agentes de IA. Nuestro objetivo es crear un framework de agentes de IA para construir un entorno similar a Westworld.

## Descripción General de la Arquitectura

- Agentes: Cada monstruo/agente tiene una identidad y motivaciones únicas, vagando por el mundo, conversando y formando relaciones. En el futuro, los agentes harán referencia a interacciones previas—extraídas de una base de datos vectorial (Pinecone) de embeddings de memoria—así cada conversación y decisión estará informada por encuentros pasados (memoria persistente).

- Motor de Juego: El sistema de orquestación programa actividades de los agentes, maneja tareas de "Ejecución por Lotes de Agentes" y administra colisiones. Cuando se predice que los caminos de dos monstruos se cruzarán, el motor los agrupa y dispara una secuencia de conversación. Después de que las tareas terminan, los agentes vuelven a estar disponibles para nueva programación, asegurando actividad continua del mundo sin intervención manual.

- Registros de Eventos: Un registro append-only rastrea todo—caminos de los agentes, marcas de tiempo de conversaciones y quién habló con quién. Antes de comenzar un nuevo camino, los monstruos consultan sus registros de eventos para predecir colisiones futuras. Si no han conversado recientemente con un agente que cruzarán, inician un diálogo. Los Registros de Eventos también almacenan todas las transcripciones de conversaciones y coordenadas para recuperación precisa de contexto y embedding de memoria.

- Memoria y Base de Datos Vectorial: Después de conversaciones o momentos de reflexión, los agentes resumen sus experiencias y las almacenan como embeddings vectoriales (mxbai-embed-large). Estos embeddings pueden ser recuperados posteriormente y filtrados por relevancia, inyectando contexto pasado directamente en el prompt para la siguiente conversación.

- Uno de los desafíos fundamentales en el diseño del motor de juego es mantener baja latencia mientras se escala para más jugadores y agentes. Por eso DAMN introduce un estado comprimido (HistoryObject) para rastrear y reproducir movimientos eficientemente. Cada tick del motor (~60/seg) registra campos numéricos (como posición), luego al final de cada paso (1/seg) almacenamos un "buffer de historial" comprimido. El cliente obtiene tanto los valores actuales como este buffer reproducible, renderizando animaciones suaves sin saltos. Impacto: para jugadores y agentes, este diseño ofrece jugabilidad fluida—sin tartamudeos ni animaciones irregulares. Entre bastidores, es un enfoque racionalizado que mantiene alto rendimiento, permanece confiable y escala perfectamente para más personajes impulsados por IA.

- En lugar de depender de motores de juego existentes (ej: Unity o Godot), DAMN usa un motor de juego IA-nativo personalizado construido desde cero (escrito en TypeScript). Agentes de IA y jugadores humanos son tratados de manera idéntica—sin NPCs de segunda clase. En cada tick, el motor actualiza el mundo entero en memoria, dando a la IA los mismos poderes de movimiento, interacción y participación que los humanos. Esto lleva a mundos más orgánicos y dinámicos donde la IA no está simplemente siguiendo scripts, sino genuinamente participando en la jugabilidad.

- Descripción General del Diseño:
1. El programador periódicamente dispara una nueva etapa de simulación.
2. El motor carga datos del juego de la base de datos a memoria.
3. Tanto agentes de IA como jugadores envían acciones o decisiones, todas manejadas en un bucle unificado.
4. Después de aplicar las reglas del juego, el motor calcula una "diff" de los cambios y la guarda en la base de datos.

Más detalles pueden encontrarse en la [Descripción General de la Arquitectura](https://docs.digimon.tech/digimon/digimon-engine/architecture-overview).

# 💰 Lanza un juego con el Motor Digimon y su token:

## No olvides dar una propina del 10% al simpático Digimon
[Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf](https://solscan.io/account/Afcg6gaouRZTo8goQa3UhwGcBrtWkDj2NgpebtmjxBKf)

# Inicio Rápido

### Prerrequisitos

- [npm 11.0.0](https://www.npmjs.com/get-npm)
- [node 23.3.0](https://nodejs.org/en/download/)

### Comunidad y contacto

- [GitHub Issues](https://github.com/CohumanSpace/digimon-engine/issues): Ideal para: bugs encontrados al usar el Motor Digimon y propuestas de funcionalidades.
- [Discord](Próximamente): Ideal para: compartir tus aplicaciones e interactuar con la comunidad.
- [Discord Desarrolladores](Próximamente): Ideal para: obtener ayuda y desarrollo de plugins.

## Contribuidores

<a href="https://github.com/CohumanSpace/digimon-engine/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CohumanSpace/digimon-engine" />
</a> 