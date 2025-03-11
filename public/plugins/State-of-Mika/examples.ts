import { SimulationConfig, ActivityResponse, Incident } from './life-simulator';
import { createApiClient } from './som-data';

/**
 * Example 1: Basic Plugin Setup
 * Shows how to create and use the Life Simulator as a standalone API client.
 */
async function exampleStandaloneUsage() {
  // Use dynamic import to get the client creator
  const { createLifeSimulatorClient } = await import('./life-simulator');
  
  // Create a client instance with API key from environment
  const client = createLifeSimulatorClient({
    // These options are optional as they'll default to env variables
    // apiBaseUrl: process.env.STATE_OF_MIKA_API_URL,
    // apiKey: process.env.STATE_OF_MIKA_API_KEY,
  });

  // Define a simulation configuration
  const config: SimulationConfig = {
    city: "New York",
    country: "USA",
    timezone: "America/New_York",
    residence: {
      name: "Home",
      lat: 40.7128,
      lon: -74.0060,
      type: "residential",
      role: "home"
    },
    office: {
      name: "Office",
      lat: 40.7580,
      lon: -73.9855,
      type: "business",
      role: "office"
    },
    available_locations: {
      "Home": {
        name: "Home",
        lat: 40.7128,
        lon: -74.0060,
        type: "residential",
        role: "home"
      },
      "Office": {
        name: "Office",
        lat: 40.7580,
        lon: -73.9855,
        type: "business",
        role: "office"
      },
      "Central Park": {
        name: "Central Park",
        lat: 40.7812,
        lon: -73.9665,
        type: "park",
        role: "recreation"
      }
    },
    occupation: "Software Developer",
    name: "Test User",
    // Optional fields
    gender: "non-binary",
    age: 30
  };

  try {
    // Get life simulation data
    console.log("Fetching life simulation data...");
    const simulation = await client.getLifeSimulation(config);
    
    // Display results
    console.log("Simulation results:");
    console.log(`Activity: ${simulation.activity.main_action}`);
    console.log(`Location: ${simulation.activity.location.current} → ${simulation.activity.location.destination}`);
    console.log(`Reason: ${simulation.activity.reason}`);
    console.log(`Weather: ${simulation.activity.details.weather.condition}, ${simulation.activity.details.weather.temperature}°`);
    
    if (simulation.incident) {
      console.log(`\nIncident occurred: ${simulation.incident.type} (severity: ${simulation.incident.severity})`);
      console.log(`Description: ${simulation.incident.description}`);
    }
    
    return simulation;
  } catch (error) {
    console.error("Error fetching simulation:", error);
    throw error;
  }
}

/**
 * Example 2: Digimon Engine Integration
 * Shows how to use the Life Simulator as a Digimon Engine plugin.
 */
async function exampleEngineIntegration(engine: any) {
  // Import the plugin factory function
  const { createLifeSimulatorPlugin } = await import('./life-simulator');
  
  // Create the plugin
  const lifeSimulator = createLifeSimulatorPlugin({
    // These options are optional as they'll default to env variables
    // apiBaseUrl: process.env.STATE_OF_MIKA_API_URL,
    // apiKey: process.env.STATE_OF_MIKA_API_KEY,
  });
  
  // Register with the engine
  engine.registerPlugin(lifeSimulator);
  
  // Get an agent context
  const agentId = 'agent-123';
  const agentContext = await engine.getAgentContext(agentId);
  
  // Run a simulation cycle for the agent
  const updatedContext = await lifeSimulator.runAgentLifeCycle(agentContext);
  
  // The agent's state is now updated with simulation data
  console.log(`Agent ${updatedContext.agent.name} is ${updatedContext.agent.state.currentActivity}`);
  
  // You can also get just the simulation data without applying it
  const simulation = await lifeSimulator.getAgentLifeSimulation(agentContext);
  console.log(`Raw simulation activity: ${simulation.activity.main_action}`);
  
  return updatedContext;
}

/**
 * Example 3: Advanced Features - Custom Locations, Filtering Incidents
 */
async function exampleAdvancedFeatures() {
  const { createLifeSimulatorClient } = await import('./life-simulator');
  
  // Create a client with Tokyo locations
  const tokyoLocations = {
    "Shibuya": {
      name: "Shibuya",
      lat: 35.658000,
      lon: 139.701600,
      type: "shopping",
      role: "entertainment",
      country: "Japan"
    },
    "Shinjuku": {
      name: "Shinjuku",
      lat: 35.689700,
      lon: 139.700400,
      type: "business",
      role: "office",
      country: "Japan"
    },
    "Tokyo Apartment": {
      name: "Tokyo Apartment",
      lat: 35.671700,
      lon: 139.764900,
      type: "residential",
      role: "home",
      country: "Japan"
    }
  };
  
  // Create client with default configuration
  const client = createLifeSimulatorClient({
    defaultSimulationConfig: {
      city: "Tokyo",
      country: "Japan",
      timezone: "Asia/Tokyo",
      available_locations: tokyoLocations,
      residence: tokyoLocations["Tokyo Apartment"],
      office: tokyoLocations["Shinjuku"],
      occupation: "English Teacher"
    }
  });
  
  // Get multiple simulations to find incidents
  const numSimulations = 5;
  const simulations: ActivityResponse[] = [];
  
  for (let i = 0; i < numSimulations; i++) {
    console.log(`Running simulation ${i+1}/${numSimulations}...`);
    const sim = await client.getLifeSimulation({
      // Only need to provide the required fields, the rest come from defaults
      residence: tokyoLocations["Tokyo Apartment"],
      office: tokyoLocations["Shinjuku"],
      occupation: "English Teacher",
      available_locations: tokyoLocations,
    }, true); // Force refresh to avoid cache
    
    simulations.push(sim);
    // Small delay to avoid overloading the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Filter for significant incidents (severity 4+)
  const significantIncidents: Incident[] = simulations
    .filter(sim => sim.incident && sim.incident.severity >= 4)
    .map(sim => sim.incident as Incident);
  
  console.log(`Found ${significantIncidents.length} significant incidents out of ${numSimulations} simulations`);
  
  if (significantIncidents.length > 0) {
    console.log("Significant incidents:");
    significantIncidents.forEach((incident, i) => {
      console.log(`${i+1}. ${incident.type} (severity: ${incident.severity}): ${incident.description}`);
    });
  }
  
  return {
    simulations,
    significantIncidents
  };
}

/**
 * Example 4: Batch processing for multiple agents
 */
async function exampleBatchProcessing(engine: any, agentIds: string[]) {
  const { createLifeSimulatorPlugin } = await import('./life-simulator');
  
  // Create and register the plugin
  const lifeSimulator = createLifeSimulatorPlugin();
  engine.registerPlugin(lifeSimulator);
  
  // Get all agent contexts
  const agentContexts = await Promise.all(
    agentIds.map(id => engine.getAgentContext(id))
  );
  
  console.log(`Processing life simulations for ${agentContexts.length} agents...`);
  
  // Process in smaller batches to avoid API rate limits
  const batchSize = 3;
  const results: ActivityResponse[] = [];
  
  for (let i = 0; i < agentContexts.length; i += batchSize) {
    const batch = agentContexts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(agentContexts.length/batchSize)}...`);
    
    // Run simulations in parallel within the batch
    const batchResults = await Promise.all(
      batch.map(context => lifeSimulator.getAgentLifeSimulation(context))
    );
    
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < agentContexts.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summarize activities
  const activityCounts: Record<string, number> = results.reduce((counts: Record<string, number>, sim) => {
    const activity = sim.activity.main_action;
    counts[activity] = (counts[activity] || 0) + 1;
    return counts;
  }, {});
  
  console.log("Activity distribution:");
  Object.entries(activityCounts).forEach(([activity, count]) => {
    console.log(`${activity}: ${count} agents (${Math.round(count / results.length * 100)}%)`);
  });
  
  // Find global incidents (severity 4+)
  const globalIncidents: Incident[] = results
    .filter(sim => sim.incident && sim.incident.severity >= 4)
    .map(sim => sim.incident as Incident);
  
  if (globalIncidents.length > 0) {
    console.log("\nGlobal incidents affecting agents:");
    console.log({
      count: globalIncidents.length,
      descriptions: globalIncidents.map(incident => incident.description)
    });
  }
  
  return results;
}

// Export examples for potential use
export {
  exampleStandaloneUsage,
  exampleEngineIntegration,
  exampleAdvancedFeatures,
  exampleBatchProcessing
};

// Automatically run the standalone example if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log("Running standalone example...");
  exampleStandaloneUsage()
    .then(result => {
      console.log("\nExample completed successfully!");
    })
    .catch(error => {
      console.error("Example failed:", error);
      process.exit(1);
    });
}

// Basic query
async function getLatestInfo() {
  const dataClient = createApiClient();
  
  // Make a query to get crypto info
  const result = await dataClient.query('What is the latest news about Solana?');
  
  if (result.status === 200) {
    console.log('Latest Info:', result.response);
    return result.response;
  } else {
    console.error('Error getting data:', result.error);
    return null;
  }
}

// Web search with more options
async function getDetailedMarketAnalysis(topic: string, userId: string) {
  // Create a simple logger to pass in
  const customLogger = {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`),
    debug: (msg: string) => console.debug(`[DEBUG] ${msg}`)
  };
  
  const dataClient = createApiClient({
    // Optional custom config
    logger: {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      error: (message: string | Error) => console.error(`[ERROR] ${message}`),
      warn: (msg: string) => console.warn(`[WARN] ${msg}`),
      debug: (msg: string) => console.debug(`[DEBUG] ${msg}`)
    }
  });
  
  const result = await dataClient.query(`Provide detailed market analysis about ${topic}`, {
    tool: 'web_search',  // Use web search for more up-to-date info
    sessionId: userId,   // Track by user ID
    timeout: 20000       // Longer timeout for complex queries
  });
  
  return result;
}
