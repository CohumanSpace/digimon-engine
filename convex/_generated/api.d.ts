/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agent_cdpAgentkit from "../agent/cdpAgentkit.js";
import type * as agent_conversation from "../agent/conversation.js";
import type * as agent_embeddingsCache from "../agent/embeddingsCache.js";
import type * as agent_gameVirtual from "../agent/gameVirtual.js";
import type * as agent_memory from "../agent/memory.js";
import type * as agent_trade from "../agent/trade.js";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as damn_agent_agent from "../damn/agent/agent.js";
import type * as damn_agent_agentOperations from "../damn/agent/agentOperations.js";
import type * as damn_agent_inputs from "../damn/agent/inputs.js";
import type * as damn_conversation_conversation from "../damn/conversation/conversation.js";
import type * as damn_conversation_conversationMembership from "../damn/conversation/conversationMembership.js";
import type * as damn_conversation_inputs from "../damn/conversation/inputs.js";
import type * as damn_game from "../damn/game.js";
import type * as damn_gameConfig from "../damn/gameConfig.js";
import type * as damn_ids from "../damn/ids.js";
import type * as damn_inputHandler from "../damn/inputHandler.js";
import type * as damn_inputs from "../damn/inputs.js";
import type * as damn_insertInput from "../damn/insertInput.js";
import type * as damn_main from "../damn/main.js";
import type * as damn_player_inputs from "../damn/player/inputs.js";
import type * as damn_player_inventory from "../damn/player/inventory.js";
import type * as damn_player_location from "../damn/player/location.js";
import type * as damn_player_movement from "../damn/player/movement.js";
import type * as damn_player_player from "../damn/player/player.js";
import type * as damn_player_playerDescription from "../damn/player/playerDescription.js";
import type * as damn_trade_inputs from "../damn/trade/inputs.js";
import type * as damn_trade_trade from "../damn/trade/trade.js";
import type * as damn_trade_tradeDeal from "../damn/trade/tradeDeal.js";
import type * as damn_world from "../damn/world.js";
import type * as damn_worldMap from "../damn/worldMap.js";
import type * as engine_abstractGame from "../engine/abstractGame.js";
import type * as engine_historicalObject from "../engine/historicalObject.js";
import type * as http from "../http.js";
import type * as manageGame_api from "../manageGame/api.js";
import type * as manageGame_http from "../manageGame/http.js";
import type * as manageGame_service_clearGame from "../manageGame/service/clearGame.js";
import type * as manageGame_service_createGame from "../manageGame/service/createGame.js";
import type * as manageGame_service_pauseGame from "../manageGame/service/pauseGame.js";
import type * as manageGame_service_resumeGame from "../manageGame/service/resumeGame.js";
import type * as manageGame_service_updateGame from "../manageGame/service/updateGame.js";
import type * as manageGame_test from "../manageGame/test.js";
import type * as manageGame_types from "../manageGame/types.js";
import type * as map from "../map.js";
import type * as messages from "../messages.js";
import type * as testing from "../testing.js";
import type * as user_user from "../user/user.js";
import type * as util_FastIntegerCompression from "../util/FastIntegerCompression.js";
import type * as util_assertNever from "../util/assertNever.js";
import type * as util_asyncMap from "../util/asyncMap.js";
import type * as util_compression from "../util/compression.js";
import type * as util_geometry from "../util/geometry.js";
import type * as util_isSimpleObject from "../util/isSimpleObject.js";
import type * as util_llm from "../util/llm.js";
import type * as util_minheap from "../util/minheap.js";
import type * as util_object from "../util/object.js";
import type * as util_sleep from "../util/sleep.js";
import type * as util_types from "../util/types.js";
import type * as util_xxhash from "../util/xxhash.js";
import type * as world from "../world.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "agent/cdpAgentkit": typeof agent_cdpAgentkit;
  "agent/conversation": typeof agent_conversation;
  "agent/embeddingsCache": typeof agent_embeddingsCache;
  "agent/gameVirtual": typeof agent_gameVirtual;
  "agent/memory": typeof agent_memory;
  "agent/trade": typeof agent_trade;
  auth: typeof auth;
  constants: typeof constants;
  crons: typeof crons;
  "damn/agent/agent": typeof damn_agent_agent;
  "damn/agent/agentOperations": typeof damn_agent_agentOperations;
  "damn/agent/inputs": typeof damn_agent_inputs;
  "damn/conversation/conversation": typeof damn_conversation_conversation;
  "damn/conversation/conversationMembership": typeof damn_conversation_conversationMembership;
  "damn/conversation/inputs": typeof damn_conversation_inputs;
  "damn/game": typeof damn_game;
  "damn/gameConfig": typeof damn_gameConfig;
  "damn/ids": typeof damn_ids;
  "damn/inputHandler": typeof damn_inputHandler;
  "damn/inputs": typeof damn_inputs;
  "damn/insertInput": typeof damn_insertInput;
  "damn/main": typeof damn_main;
  "damn/player/inputs": typeof damn_player_inputs;
  "damn/player/inventory": typeof damn_player_inventory;
  "damn/player/location": typeof damn_player_location;
  "damn/player/movement": typeof damn_player_movement;
  "damn/player/player": typeof damn_player_player;
  "damn/player/playerDescription": typeof damn_player_playerDescription;
  "damn/trade/inputs": typeof damn_trade_inputs;
  "damn/trade/trade": typeof damn_trade_trade;
  "damn/trade/tradeDeal": typeof damn_trade_tradeDeal;
  "damn/world": typeof damn_world;
  "damn/worldMap": typeof damn_worldMap;
  "engine/abstractGame": typeof engine_abstractGame;
  "engine/historicalObject": typeof engine_historicalObject;
  http: typeof http;
  "manageGame/api": typeof manageGame_api;
  "manageGame/http": typeof manageGame_http;
  "manageGame/service/clearGame": typeof manageGame_service_clearGame;
  "manageGame/service/createGame": typeof manageGame_service_createGame;
  "manageGame/service/pauseGame": typeof manageGame_service_pauseGame;
  "manageGame/service/resumeGame": typeof manageGame_service_resumeGame;
  "manageGame/service/updateGame": typeof manageGame_service_updateGame;
  "manageGame/test": typeof manageGame_test;
  "manageGame/types": typeof manageGame_types;
  map: typeof map;
  messages: typeof messages;
  testing: typeof testing;
  "user/user": typeof user_user;
  "util/FastIntegerCompression": typeof util_FastIntegerCompression;
  "util/assertNever": typeof util_assertNever;
  "util/asyncMap": typeof util_asyncMap;
  "util/compression": typeof util_compression;
  "util/geometry": typeof util_geometry;
  "util/isSimpleObject": typeof util_isSimpleObject;
  "util/llm": typeof util_llm;
  "util/minheap": typeof util_minheap;
  "util/object": typeof util_object;
  "util/sleep": typeof util_sleep;
  "util/types": typeof util_types;
  "util/xxhash": typeof util_xxhash;
  world: typeof world;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
