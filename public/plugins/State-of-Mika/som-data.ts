/**
 * State of Mika API Client
 * Provides access to the general-purpose State of Mika API endpoints
 */

import axios from 'axios';
import FormData from 'form-data';

// Define logger interface and implementation
export interface LoggerInterface {
  info: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string | Error) => void;
  warn: (message: string) => void;
}

export class ConsoleLogger implements LoggerInterface {
  private prefix: string;
  
  constructor(prefix: string = 'MikaApiClient') {
    this.prefix = prefix;
  }
  
  info(message: string): void {
    console.log(`[${this.prefix}] ${message}`);
  }
  
  debug(message: string): void {
    console.debug(`[${this.prefix}] ${message}`);
  }
  
  error(message: string | Error): void {
    console.error(`[${this.prefix}] ${message instanceof Error ? message.message : message}`);
  }
  
  warn(message: string): void {
    console.warn(`[${this.prefix}] ${message}`);
  }
}

// Load environment variables if available
const STATE_OF_MIKA_API_KEY = typeof process !== 'undefined' ? process.env.STATE_OF_MIKA_API_KEY : undefined;
// Only use 'https://state.gmika.io' as the VERY LAST fallback if no environment variable exists
const STATE_OF_MIKA_API_URL = typeof process !== 'undefined' ? 
  (process.env.STATE_OF_MIKA_API_URL || 'https://state.gmika.io/api/v1/') : 
  'https://state.gmika.io/api/v1/';

// Ensure the URL ends with /api/v1/
const normalizeApiUrl = (url: string): string => {
  // Remove trailing slash if present
  let normalized = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Ensure URL has /api/v1 path
  if (!normalized.endsWith('/api/v1')) {
    // If URL already has some form of /api/v1 path but not exactly /api/v1, fix it
    normalized = normalized.replace(/\/api\/v1\/?$/, '');
    normalized = `${normalized}/api/v1`;
  }
  
  return normalized;
};

export interface ApiClientOptions {
  apiKey?: string;
  apiBaseUrl?: string;
  logger?: LoggerInterface;
}

export interface QueryOptions {
  tool?: string; // Tool parameter - this is correct per the API specs and CURL test
  forceWebSearch?: boolean; // New option to force using web_search
  sessionId?: string; // For tracking/logging
  timeout?: number;   // Request timeout in ms
  debug?: boolean;    // More verbose debugging
  disableFallback?: boolean; // Prevent infinite recursion
}

export interface ApiResponse {
  response?: string;
  status: number;
  error?: string;
  raw?: any; // For debugging or accessing other fields
}

/**
 * Client for interacting with the generic State of Mika API endpoints
 */
export class StateOfMikaApiClient {
  private apiKey: string;
  private apiBaseUrl: string;
  private logger: LoggerInterface;

  constructor(options: ApiClientOptions = {}) {
    this.apiKey = options.apiKey || STATE_OF_MIKA_API_KEY || '';
    // Normalize the API URL to remove /api/v1/ if present
    this.apiBaseUrl = normalizeApiUrl(options.apiBaseUrl || STATE_OF_MIKA_API_URL);
    this.logger = options.logger || new ConsoleLogger('MikaApiClient');
    
    if (!this.apiKey) {
      this.logger.warn('Initialized without API key - queries will fail');
    }
    
    this.logger.debug(`API client initialized with base URL: ${this.apiBaseUrl}`);
  }

  /**
   * Determine if the query is likely relevant to State of Mika
   * @param query The user's query text
   * @returns True if the query appears relevant to State of Mika
   */
  public detectRelevance(query: string): boolean {
    const relevantKeywords = [
      'price', 'market', 'token', 'crypto', 'blockchain', 'solana', 'bitcoin', 'eth',
      'news', 'latest', 'update', 'analysis', 'chart', 'trading', 'volume',
      'defi', 'nft', 'yield', 'apy', 'liquidity'
    ];
    
    const queryLower = query.toLowerCase();
    for (const keyword of relevantKeywords) {
      if (queryLower.includes(keyword)) {
        this.logger.debug(`Detected relevant keyword: ${keyword}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Query State of Mika API
   * @param query The query to send to the API
   * @param options Additional query options
   * @returns API response
   */
  public async query(query: string, options: QueryOptions = {}): Promise<ApiResponse> {
    // If fallback is disabled, just do a normal query
    if (options.disableFallback) {
      return this.performQuery(query, options);
    }

    // Check for Bitcoin-specific queries which we know have issues with auto-routing
    const lowerQuery = query.toLowerCase();
    const isBitcoinQuery = lowerQuery.includes('bitcoin') || lowerQuery.includes('btc');
    
    // If it's a Bitcoin price query, skip auto-routing and go straight to web_search
    if (isBitcoinQuery && (lowerQuery.includes('price') || lowerQuery.includes('worth') || lowerQuery.includes('value'))) {
      this.logger.info(`Bitcoin price query detected. Skipping auto-routing and using web_search directly.`);
      return this.performQuery(query, {
        ...options,
        forceWebSearch: true,
        timeout: options.timeout || 30000, // Increase timeout for web searches
        disableFallback: true // Prevent infinite recursion
      });
    }

    // First try with automatic routing (no tool specified)
    const initialResult = await this.performQuery(query, {
      ...options,
      disableFallback: true // Prevent infinite recursion
    });

    // If the initial query succeeded, return the result
    if (initialResult.status === 200) {
      return initialResult;
    }

    // Check for specific DexScreener validation error pattern in the response
    const isDexScreenerError = 
      initialResult.status === 500 && 
      initialResult.raw?.detail && 
      typeof initialResult.raw.detail === 'string' &&
      initialResult.raw.detail.includes('DexScreenerResponse');

    if (isDexScreenerError) {
      this.logger.info(`DexScreener validation error detected. Falling back to web_search.`);
    } else {
      this.logger.info(`Automatic routing failed (${initialResult.status}), falling back to web_search tool`);
    }
    
    // If automatic routing failed and we haven't specified a tool, try again with web_search
    if (!options.tool && !options.forceWebSearch) {      
      // Try again with web_search tool (with increased timeout)
      return this.performQuery(query, {
        ...options,
        forceWebSearch: true, // Force web_search on the fallback
        timeout: options.timeout || 30000, // Increase timeout for web searches
        disableFallback: true // Prevent infinite recursion
      });
    }

    // If we already specified a tool or we're already using forceWebSearch, return the original error
    return initialResult;
  }

  /**
   * Internal method to perform the actual API query
   * @param query The query to send to the API
   * @param options Additional query options
   * @returns API response
   */
  private async performQuery(query: string, options: QueryOptions = {}): Promise<ApiResponse> {
    try {
      if (!this.apiKey) {
        this.logger.error('Missing API key for State of Mika API');
        return {
          status: 401,
          error: 'Missing API key'
        };
      }

      const sessionId = options.sessionId || `req-${Date.now()}`;
      const timeout = options.timeout || 30000;
      const debug = options.debug || false;
      
      // Prepare Form Data
      const formData = new FormData();
      
      // Add the query (required)
      formData.append('query', query);
      
      // Add tool parameter according to options
      if (options.tool) {
        // If a specific tool is requested, use it
        formData.append('tool', options.tool);
        this.logger.info(`[${sessionId}] Querying State of Mika API with tool "${options.tool}" and query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
      } else if (options.forceWebSearch) {
        // If forceWebSearch is true, explicitly use web_search
        formData.append('tool', 'web_search');
        this.logger.info(`[${sessionId}] Querying State of Mika API with forced web_search and query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
      } else {
        // Otherwise, let the API router decide which tool to use (empty tool parameter)
        formData.append('tool', ''); // Send empty 'tool' parameter to allow auto-routing
        this.logger.info(`[${sessionId}] Querying State of Mika API with no tool specified (using automatic routing) for query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
      }
      
      // Add empty parameters_str and file fields to match the CURL format exactly
      formData.append('parameters_str', '');
      formData.append('file', '');
      
      // Ensure the URL ends with a slash for consistency
      const url = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl : `${this.apiBaseUrl}/`;
      
      this.logger.debug(`[${sessionId}] API request details: URL=${url}, Tool=${options.tool || (options.forceWebSearch ? 'web_search' : '(auto-routing)')}, Query="${query.substring(0, 50)}..."`);
      
      // Create a detailed log of the request payload
      const headers = {
        'X-API-Key': this.apiKey.substring(0, 8) + '...',  // Only show first 8 chars of API key for security
        ...formData.getHeaders()
      };
      
      // Keep track of form values for logging
      const formValues = {
        query: query.length > 100 ? query.substring(0, 100) + '...' : query,
        tool: options.tool || (options.forceWebSearch ? 'web_search' : ''),
        parameters_str: '',
        file: 'empty'
      };
      
      // Log the complete request payload
      this.logger.info(`[${sessionId}] 📤 COMPLETE REQUEST PAYLOAD:`);
      this.logger.info(`[${sessionId}] 📤 URL: ${url}`);
      this.logger.info(`[${sessionId}] 📤 Method: POST`);
      this.logger.info(`[${sessionId}] 📤 Headers: ${JSON.stringify(headers, null, 2)}`);
      this.logger.info(`[${sessionId}] 📤 Form Data Fields:`);
      this.logger.info(`[${sessionId}] 📤   - query: "${formValues.query}"`);
      this.logger.info(`[${sessionId}] 📤   - tool: "${formValues.tool}"`);
      this.logger.info(`[${sessionId}] 📤   - parameters_str: "${formValues.parameters_str}"`);
      this.logger.info(`[${sessionId}] 📤   - file: "${formValues.file}"`);
      
      if (debug) {
        // Log the form data contents for debugging
        this.logger.debug(`[${sessionId}] Form data keys: ${Object.keys(formData).join(', ')}`);
        for (const [key, value] of Object.entries(formData)) {
          this.logger.debug(`[${sessionId}] Form data ${key}: ${value}`);
        }
      }
      
      // Make the request
      const response = await axios({
        method: 'post',
        url: url,
        headers: {
          'X-API-Key': this.apiKey,
          ...formData.getHeaders()
        },
        data: formData,
        timeout: timeout,
        validateStatus: () => true // Always resolve promise regardless of status
      });

      // Enhanced response logging
      this.logger.info(`[${sessionId}] 📥 COMPLETE RESPONSE FROM API:`);
      this.logger.info(`[${sessionId}] 📥 Status: ${response.status} ${response.statusText}`);
      this.logger.info(`[${sessionId}] 📥 Headers: ${JSON.stringify(response.headers, null, 2)}`);
      
      // Log different levels of response data detail based on size
      const responseDataStr = JSON.stringify(response.data);
      if (responseDataStr.length > 1000) {
        this.logger.info(`[${sessionId}] 📥 Response Body (${responseDataStr.length} chars): ${responseDataStr.substring(0, 1000)}...`);
        this.logger.debug(`[${sessionId}] 📥 FULL Response Body: ${responseDataStr}`);
      } else {
        this.logger.info(`[${sessionId}] 📥 Response Body: ${responseDataStr}`);
      }
      
      // Log response details at debug level
      this.logger.debug(`[${sessionId}] API response: Status=${response.status}, Headers=${JSON.stringify(response.headers || {})}`);
      
      if (debug) {
        // More detailed response logging for debugging
        this.logger.debug(`[${sessionId}] Complete response object: ${JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        })}`);
      }
      
      if (response.status === 200 && response.data) {
        this.logger.info(`[${sessionId}] Successfully received data from State of Mika API`);
        
        // Check if the response contains information about which tool was selected
        if (response.data.route && response.data.route.tool) {
          this.logger.info(`[${sessionId}] API selected tool: ${response.data.route.tool} with confidence ${response.data.route.confidence}`);
        }
        
        this.logger.debug(`[${sessionId}] Complete raw response: ${JSON.stringify(response.data)}`);
        return {
          response: response.data.response?.processed_response || response.data.response || response.data,
          status: response.status,
          raw: response.data
        };
      } else {
        // Log error details
        this.logger.error(`[${sessionId}] API error: Status=${response.status}, Error=${JSON.stringify(response.data?.error || 'Unknown error')}`);
        
        if (response.status === 500) {
          this.logger.error(`[${sessionId}] ❌ API SERVER ERROR (500): This could indicate a problem with the API server or your API key`);
          // Check for specific error messages
          if (response.data && response.data.error) {
            this.logger.error(`[${sessionId}] Error message from API: ${response.data.error}`);
          }
        } else if (response.status === 400) {
          this.logger.error(`[${sessionId}] ❌ API BAD REQUEST (400): The request was invalid, possibly due to missing or invalid parameters`);
          if (debug) {
            // Suggest trying with web_search tool explicitly if auto-routing failed
            this.logger.debug(`[${sessionId}] Try again with options.forceWebSearch=true or options.tool='web_search'`);
          }
        }
        
        return {
          status: response.status,
          error: response.data?.error || `Error ${response.status}`,
          raw: response.data
        };
      }
    } catch (error: any) {
      const sessionId = options.sessionId || `err-${Date.now()}`;
      this.logger.error(`[${sessionId}] Error querying State of Mika API: ${error.message}`);
      
      // Log more detailed error info
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        this.logger.error(`[${sessionId}] API error details: Status=${error.response.status}, Data=${JSON.stringify(error.response.data || {})}`);
        
        return {
          status: error.response.status,
          error: error.response.data?.error || error.message,
          raw: error.response.data
        };
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error(`[${sessionId}] API no response - request was sent but no response received`);
        
        return {
          status: 0,
          error: 'No response received from server'
        };
      }
      
      // Something happened in setting up the request
      return {
        status: 500,
        error: error.message
      };
    }
  }
}

/**
 * Create a State of Mika API client
 * @param options Client configuration options
 * @returns Configured API client
 */
export function createApiClient(options?: ApiClientOptions): StateOfMikaApiClient {
  return new StateOfMikaApiClient(options);
}

/**
 * Simple example usage if this module is run directly
 */
if (typeof require !== 'undefined' && require.main === module) {
  const runExample = async () => {
    const client = createApiClient();
    console.log('Testing State of Mika API client...');
    
    try {
      // Test with auto-routing
      console.log('\n1. Testing automatic routing:');
      const autoResult = await client.query('What is the latest news about Solana?', { debug: true });
      console.log('Auto-routing API Response:', autoResult.status === 200 ? autoResult.response : `Error: ${autoResult.error}`);
      
      // Test with explicit web_search tool
      console.log('\n2. Testing explicit web_search tool:');
      const webSearchResult = await client.query('What is the latest news about Solana?', { tool: 'web_search', debug: true });
      console.log('Web search API Response:', webSearchResult.status === 200 ? webSearchResult.response : `Error: ${webSearchResult.error}`);
      
      // Test with forceWebSearch option
      console.log('\n3. Testing forceWebSearch option:');
      const forcedResult = await client.query('What is the latest news about Solana?', { forceWebSearch: true, debug: true });
      console.log('Forced web search API Response:', forcedResult.status === 200 ? forcedResult.response : `Error: ${forcedResult.error}`);
    } catch (error) {
      console.error('Failed to run example:', error);
    }
  };
  
  runExample();
} 