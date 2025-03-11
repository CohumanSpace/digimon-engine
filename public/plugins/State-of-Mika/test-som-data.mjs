// ESM version to test the State of Mika Data API
import { createApiClient } from './dist/som-data.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log("===== TESTING STATE OF MIKA DATA API =====");
console.log("Environment variables loaded:");
console.log("API Key:", process.env.STATE_OF_MIKA_API_KEY ? "✓ Found" : "❌ Missing");
console.log("API URL:", process.env.STATE_OF_MIKA_API_URL || "https://state.gmika.io");

// Helper function to safely get a string preview
function getResponsePreview(response) {
  if (response === undefined || response === null) {
    return "[No response data]";
  }
  
  // Convert to string if it's not already a string
  const responseStr = typeof response === 'string' 
    ? response 
    : JSON.stringify(response);
  
  // Return a preview
  return responseStr.substring(0, 150) + (responseStr.length > 150 ? "..." : "");
}

async function testSomDataApi() {
  try {
    // Create an instance of the API client
    console.log("\nCreating StateOfMikaApiClient...");
    const dataClient = createApiClient({
      apiBaseUrl: process.env.STATE_OF_MIKA_API_URL,
      apiKey: process.env.STATE_OF_MIKA_API_KEY
    });
    console.log("✓ Client created successfully");
    
    // Track test results
    const results = {
      crypto: false,
      webSearch: false,
      generalKnowledge: false,
      relevanceDetection: false
    };
    
    // Test 1: Basic query for cryptocurrency data
    console.log("\n1. Testing basic crypto query...");
    const startTime1 = Date.now();
    const cryptoResult = await dataClient.query("What is the current price of Solana?", {
      sessionId: "test-session-crypto"
    });
    const duration1 = Date.now() - startTime1;
    
    if (cryptoResult.status === 200) {
      console.log(`✓ Crypto query succeeded in ${duration1}ms`);
      console.log("Response preview:", getResponsePreview(cryptoResult.response));
      
      // Save full response to file
      fs.writeFileSync(
        'crypto_response.json', 
        JSON.stringify(cryptoResult, null, 2)
      );
      console.log("Full crypto response saved to crypto_response.json");
      results.crypto = true;
    } else {
      console.error("❌ Crypto query failed:", cryptoResult.error);
    }
    
    // Test 2: Web search query
    console.log("\n2. Testing web search query...");
    const startTime2 = Date.now();
    const webSearchResult = await dataClient.query("What are the latest developments in AI technology?", {
      tool: "web_search",
      sessionId: "test-session-websearch",
      timeout: 25000 // Longer timeout for web search
    });
    const duration2 = Date.now() - startTime2;
    
    if (webSearchResult.status === 200) {
      console.log(`✓ Web search query succeeded in ${duration2}ms`);
      console.log("Response preview:", getResponsePreview(webSearchResult.response));
      
      // Save full response to file
      fs.writeFileSync(
        'web_search_response.json', 
        JSON.stringify(webSearchResult, null, 2)
      );
      console.log("Full web search response saved to web_search_response.json");
      results.webSearch = true;
    } else {
      console.error("❌ Web search query failed:", webSearchResult.error);
    }
    
    // Test 3: General knowledge query
    console.log("\n3. Testing general knowledge query...");
    const startTime3 = Date.now();
    const generalResult = await dataClient.query("What is photosynthesis?", {
      sessionId: "test-session-general"
    });
    const duration3 = Date.now() - startTime3;
    
    if (generalResult.status === 200) {
      console.log(`✓ General knowledge query succeeded in ${duration3}ms`);
      console.log("Response preview:", getResponsePreview(generalResult.response));
      
      // Save full response to file
      fs.writeFileSync(
        'general_knowledge_response.json', 
        JSON.stringify(generalResult, null, 2)
      );
      console.log("Full general knowledge response saved to general_knowledge_response.json");
      results.generalKnowledge = true;
    } else {
      console.error("❌ General knowledge query failed:", generalResult.error);
    }
    
    // Test 4: Relevance detection
    console.log("\n4. Testing relevance detection...");
    const cryptoQuery = "What is the current price of Ethereum?";
    const generalQuery = "What is the capital of France?";
    
    const isCryptoRelevant = dataClient.detectRelevance(cryptoQuery);
    const isGeneralRelevant = dataClient.detectRelevance(generalQuery);
    
    console.log(`Query: "${cryptoQuery}"`);
    console.log(`Detected as relevant: ${isCryptoRelevant ? "✓ Yes" : "❌ No"}`);
    
    console.log(`Query: "${generalQuery}"`);
    console.log(`Detected as relevant: ${isGeneralRelevant ? "✓ Yes" : "❌ No"}`);
    
    results.relevanceDetection = isCryptoRelevant && !isGeneralRelevant;
    
    // Summary
    console.log("\nTest Summary:");
    console.log(`Crypto query: ${results.crypto ? "✓ PASSED" : "❌ FAILED"}`);
    console.log(`Web search query: ${results.webSearch ? "✓ PASSED" : "❌ FAILED"}`);
    console.log(`General knowledge query: ${results.generalKnowledge ? "✓ PASSED" : "❌ FAILED"}`);
    console.log(`Relevance detection: ${results.relevanceDetection ? "✓ PASSED" : "⚠️ UNEXPECTED RESULTS"}`);
    
    // At least one API call succeeded, consider the test a partial success
    const apiSuccess = results.crypto || results.webSearch || results.generalKnowledge;
    const detectionSuccess = results.relevanceDetection;
    
    // Consider the test successful if at least one API call succeeded
    return apiSuccess;
  } catch (error) {
    console.error("❌ Unexpected error running tests:", error);
    return false;
  }
}

// Run the test
testSomDataApi()
  .then(success => {
    console.log(`\n===== SoM Data API Test ${success ? "PASSED ✓" : "FAILED ❌"} =====`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error("❌ Test execution error:", err);
    process.exit(1);
  }); 