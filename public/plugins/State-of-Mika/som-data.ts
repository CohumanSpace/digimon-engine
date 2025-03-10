/**
 * State of Mika API Client
 * Provides access to the general-purpose State of Mika API endpoints
 */

import axios from 'axios';
import FormData from 'form-data';
import { LoggerInterface, ConsoleLogger } from './life-simulator';

// Load environment variables if available
const STATE_OF_MIKA_API_KEY = typeof process !== 'undefined' ? process.env.STATE_OF_MIKA_API_KEY : undefined;
const STATE_OF_MIKA_API_URL = typeof process !== 'undefined' ? process.env.STATE_OF_MIKA_API_URL || 'https://state.gmika.io' : 'https://state.gmika.io';

export interface ApiClientOptions {
  apiKey?: string;
  apiBaseUrl?: string;
  logger?: LoggerInterface;
}

export interface QueryOptions {
  type?: 'web_search' | 'standard';
  sessionId?: string; // For tracking/logging
  timeout?: number;   // Request timeout in ms
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
    this.apiBaseUrl = options.apiBaseUrl || STATE_OF_MIKA_API_URL;
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
    try {
      if (!this.apiKey) {
        this.logger.error('Missing API key for State of Mika API');
        return {
          status: 401,
          error: 'Missing API key'
        };
      }

      const sessionId = options.sessionId || `req-${Date.now()}`;
      const isWebSearch = options.type === 'web_search';
      const timeout = options.timeout || 15000;
      
      this.logger.info(`[${sessionId}] Querying State of Mika API (${isWebSearch ? 'web search' : 'standard'}) with: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
      
      // Create form data
      const formData = new FormData();
      formData.append('query', query);
      
      // Add web search flag if needed
      if (isWebSearch) {
        formData.append('type', 'web_search');
      }
      
      // Build the URL
      const url = `${this.apiBaseUrl}/api/v1/`;
      
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

      // Log response details at debug level
      this.logger.debug(`[${sessionId}] API response: Status=${response.status}`);
      
      if (response.status === 200 && response.data) {
        this.logger.info(`[${sessionId}] Successfully received data from State of Mika API`);
        return {
          response: response.data.response || response.data,
          status: response.status,
          raw: response.data
        };
      } else {
        // Log error details
        this.logger.error(`[${sessionId}] API error: Status=${response.status}, Error=${JSON.stringify(response.data?.error || 'Unknown error')}`);
        
        if (response.status === 500) {
          this.logger.error(`[${sessionId}] ❌ API SERVER ERROR (500): This could indicate a problem with the API server or your API key`);
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
      const result = await client.query('What is the latest news about Solana?');
      console.log('API Response:', result.status === 200 ? result.response : `Error: ${result.error}`);
    } catch (error) {
      console.error('Failed to run example:', error);
    }
  };
  
  runExample();
} 