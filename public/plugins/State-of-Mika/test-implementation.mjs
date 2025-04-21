import { createLifeSimulatorClient } from './dist/life-simulator.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log("===== TESTING LIFE SIMULATOR IMPLEMENTATION =====");
console.log("Environment variables loaded:");
console.log("API Key:", process.env.STATE_OF_MIKA_API_KEY ? "✓ Found" : "❌ Missing");
console.log("API URL:", process.env.STATE_OF_MIKA_API_URL || "https://state.gmika.io");

async function testLifeSimulatorImplementation() {
  try {
    // Create an instance of your LifeSimulatorApiClient
    console.log("\nCreating LifeSimulatorApiClient...");
    const client = createLifeSimulatorClient({
      apiBaseUrl: process.env.STATE_OF_MIKA_API_URL,
      apiKey: process.env.STATE_OF_MIKA_API_KEY
    });
    console.log("✓ Client created successfully");
    
    // Create test config
    const testConfig = {
      city: "New York",
      country: "USA",
      timezone: "America/New_York",
      residence: {
        name: "Test Home",
        lat: 40.6936,
        lon: -73.9932,
        type: "residential",
        role: "home"
      },
      office: {
        name: "Test Office",
        lat: 40.7549,
        lon: -73.9840,
        type: "business",
        role: "office"
      },
      available_locations: {
        "Test Home": { name: "Test Home", lat: 40.6936, lon: -73.9932, type: "residential", role: "home" },
        "Test Office": { name: "Test Office", lat: 40.7549, lon: -73.9840, type: "business", role: "office" }
      },
      occupation: "Software Developer",
      name: "Test User",
      current_time: new Date().toISOString()
    };
    
    // Call the getLifeSimulation method
    console.log("\nCalling getLifeSimulation through our implementation...");
    const startTime = Date.now();
    const simulation = await client.getLifeSimulation(testConfig);
    const duration = Date.now() - startTime;
    
    console.log(`\n✓ Response received through our implementation in ${duration}ms!`);
    
    // Process results
    if (simulation) {
      console.log("\nResponse summary:");
      
      if (simulation.activity) {
        const activity = simulation.activity;
        console.log(`• Main action: ${activity.main_action}`);
        console.log(`• Location: ${activity.location.current} → ${activity.location.destination}`);
        console.log(`• Reason: ${activity.reason}`);
        
        if (activity.details && activity.details.weather) {
          console.log(`• Weather: ${activity.details.weather.condition}, ${activity.details.weather.temperature}°`);
        }
      }
      
      // Save full response to file
      fs.writeFileSync(
        'implementation_response.json', 
        JSON.stringify(simulation, null, 2)
      );
      console.log("\nFull response saved to implementation_response.json");
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

// Run the test
testLifeSimulatorImplementation()
  .then(success => {
    console.log(`\n===== Implementation Test ${success ? "PASSED ✓" : "FAILED ❌"} =====`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error("❌ Test execution error:", err);
    process.exit(1);
  }); 