# State of Mika Plugin for Digimon Engine

The State of Mika plugin provides two powerful APIs to enhance your Digimon Engine applications:

1. **Life Simulator** - Creates realistic daily activities, weather conditions, and random incidents for your AI agents
2. **Data API** - Delivers real-time information on cryptocurrency, blockchain, financial markets, and general knowledge through web scraping

This modular plugin can be used as standalone API clients or integrated seamlessly with the Digimon Engine.

## About

This module is included as a plugin within the Digimon Engine library. If you're already using Digimon Engine, you have access to this plugin at:

```
public/plugins/State-of-Mika/
```

## Features

### Life Simulator
- Realistic daily activities based on time, location, and agent profiles
- Dynamic weather and transit information
- Random incidents that affect agent mood and behavior
- Memory integration for continuity in agent experiences

### Data API
- Real-time cryptocurrency market information
- Blockchain ecosystem updates and news
- Financial market analysis and trends
- Web search capability for up-to-date information
- General knowledge queries through web scraping
- Dynamic content from the live internet for any question

### Shared Features
- **Modular Architecture**: Use as standalone API clients or integrate with Digimon Engine
- **Environment Integration**: Automatically loads API keys from environment variables
- **Intelligent Caching**: Optimize API usage and performance
- **Flexible Configuration**: Customize behavior to match your application needs

## Setup

### Required Dependencies

The module requires:
- axios (for API requests)
- dotenv (for environment variables)

If not already installed in your Digimon Engine project:

```bash
npm install axios dotenv
```

### Environment Configuration

Add to your existing `.env` file in your project root:

```env
# State of Mika API Configuration
STATE_OF_MIKA_API_KEY=your_api_key_here
STATE_OF_MIKA_API_URL=https://state.gmika.io/api/v1/
```

## Basic Usage

### Life Simulator API

#### As a Standalone Client

```typescript
import { createLifeSimulatorClient } from './public/plugins/State-of-Mika/life-simulator';

// Create the standalone client
const lifeClient = createLifeSimulatorClient();

// Define simulation parameters
const simulationConfig = {
  city: "New York",
  country: "USA",
  timezone: "America/New_York",
  residence: {
    name: "Home",
    lat: 40.7128,
    lon: -74.0060,
    type: "residential"
  },
  office: {
    name: "Office",
    lat: 40.7580,
    lon: -73.9855,
    type: "business"
  },
  available_locations: {
    // Your locations here...
  },
  occupation: "Software Developer",
  name: "User"
};

// Get a simulation
const simulation = await lifeClient.getLifeSimulation(simulationConfig);
console.log(`User is ${simulation.activity.main_action}`);
```

#### As a Digimon Engine Plugin

```typescript
import { DigimonEngine } from './core';
import { createLifeSimulatorPlugin } from './public/plugins/State-of-Mika/life-simulator';

// Create the engine
const engine = new DigimonEngine();

// Create and register the plugin
const lifeSimulator = createLifeSimulatorPlugin();
engine.registerPlugin(lifeSimulator);
engine.start();

// Use with an agent
const agentContext = await engine.getAgentContext(agentId);
const updatedContext = await lifeSimulator.runAgentLifeCycle(agentContext);
```

### Data API

#### Basic Queries

```typescript
import { createApiClient } from './public/plugins/State-of-Mika/som-data';

// Create the data API client
const dataClient = createApiClient();

// Get real-time market information
const result = await dataClient.query('What is the current price of Bitcoin?');
if (result.status === 200) {
  console.log('Market Info:', result.response);
} else {
  console.error('Error:', result.error);
}

// General knowledge queries work too
const generalKnowledge = await dataClient.query('What is photosynthesis?');
console.log(generalKnowledge.response);
```

#### Web Search for the Latest Information

```typescript
// For more up-to-date information using web search
const webResult = await dataClient.query('Latest Solana ecosystem updates', {
  type: 'web_search',
  sessionId: 'user-123', // For tracking/logging
  timeout: 20000         // Custom timeout for complex queries
});

console.log(webResult.response);

// Web scraping for current events or general information
const currentEvents = await dataClient.query('What happened in the world today?', {
  type: 'web_search'
});
console.log(currentEvents.response);
```

#### Query Relevance Detection

```typescript
// Check if a query is relevant to State of Mika Data API
const isRelevant = dataClient.detectRelevance('What is the price of Bitcoin today?');
if (isRelevant) {
  // Use State of Mika Data API
} else {
  // Use another system
}
```

## Combining Life Simulator and Data API

You can use both APIs together to create more contextually aware agents:

```typescript
import { createLifeSimulatorPlugin } from './public/plugins/State-of-Mika/life-simulator';
import { createApiClient } from './public/plugins/State-of-Mika/som-data';

// Setup both systems
const lifeSimulator = createLifeSimulatorPlugin();
const dataClient = createApiClient();

// Agent function example
async function enhancedAgentBehavior(agentContext) {
  // Get current agent activity and location
  const simulation = await lifeSimulator.getAgentLifeSimulation(agentContext);
  
  // If agent is working, get relevant market data
  if (simulation.activity.main_action.includes('working') || 
      simulation.activity.main_action.includes('trading')) {
    
    // Get market data relevant to agent's interests
    const marketData = await dataClient.query(
      `Latest news on ${agentContext.agent.interests.join(', ')}`,
      { type: 'web_search' }
    );
    
    // Update agent knowledge with market data
    if (marketData.status === 200) {
      lifeSimulator.applySimulationToAgent(agentContext, simulation);
      
      // Add market knowledge to agent memory
      agentContext.memory.addThought({
        content: marketData.response,
        timestamp: new Date().toISOString(),
        type: 'market_information'
      });
    }
  }
  
  return agentContext;
}
```

## Advanced Configuration

### Life Simulator: Custom Location Setup

```typescript
const tokyoLocations = {
  "Shibuya": {
    name: "Shibuya",
    lat: 35.658000,
    lon: 139.701600,
    type: "shopping",
    role: "entertainment",
    country: "Japan"
  },
  // More locations...
};

// Create the client with default configuration
const client = createLifeSimulatorClient({
  defaultSimulationConfig: {
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    available_locations: tokyoLocations
  }
});
```

### Data API: Custom Logger

```typescript
// Create a custom logger
const customLogger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  debug: (msg) => console.debug(`[DEBUG] ${msg}`)
};

// Create client with custom logger
const dataClient = createApiClient({
  logger: customLogger,
  apiBaseUrl: 'https://state.gmika.io'
});
```

## Testing

### Using Mocks for Development

Both APIs support mocking for development and testing:

```typescript
// Life Simulator mocks
import { mockLifeSimulationResponse } from './public/plugins/State-of-Mika/mocks';

// Data API mocks (create your own based on API responses)
const mockDataResponse = {
  status: 200,
  response: "Bitcoin is currently trading at $65,432 with a 24h change of +2.3%..."
};
```

### Running Tests

```bash
# Compile TypeScript
npx tsc -p public/plugins/State-of-Mika/tsconfig.json

# Test with real API
node public/plugins/State-of-Mika/test-implementation.mjs
```

## API Reference

### Life Simulator API

#### Factory Functions
- `createLifeSimulatorClient(options)`: Creates a standalone API client
- `createLifeSimulatorPlugin(options)`: Creates a plugin adapter for Digimon Engine

#### Main Classes
- `