import axios from 'axios';

// First, we'll check for environment variables
const STATE_OF_MIKA_API_KEY = typeof process !== 'undefined' ? process.env.STATE_OF_MIKA_API_KEY : undefined;
// Use hardcoded URL instead of environment variable
const STATE_OF_MIKA_API_URL = 'https://state.gmika.io';

// Life Simulator Types
export interface Location {
  name: string;
  lat: number;
  lon: number;
  type: string;
  role?: string;
  country?: string;
}

export interface SimulationConfig {
  residence: Location;
  occupation: string;
  office: Location;
  current_time?: string; // ISO format date string
  available_locations: Record<string, Location>;
  city?: string;
  country?: string;
  timezone?: string;
  gender?: string;
  age?: number;
  name?: string;
}

export interface TransitInfo {
  line_name: string;
  delay_minutes: number;
  crowding_level: string;
  next_departure: string; // ISO format date string
}

export interface TransitRoute {
  line_name: string;
  departure_time: string; // ISO format date string
  arrival_time: string; // ISO format date string
  duration_minutes: number;
  transfers: number;
  sections: string[];
}

export interface WeatherInfo {
  condition: string;
  temperature: number;
  details: Record<string, any>;
}

export interface ActivityDetails {
  main_action: string;
  location: {
    current: string;
    destination: string;
  };
  reason: string;
  narrative: string;
  details: {
    time: string;
    weather: WeatherInfo;
    transit_info: {
      departures: TransitInfo[];
      routes: TransitRoute[];
    };
  };
}

export interface Incident {
  type: string;
  severity: number;
  description: string;
  impact_duration: number;
  affects_next_activity: boolean;
}

export interface ActivityResponse {
  activity: ActivityDetails;
  incident?: Incident;
}

export interface SimulatorError {
  status: number;
  message: string;
  detail?: string;
}

export interface LifeSimulatorOptions {
  apiBaseUrl?: string;
  apiKey?: string;
  defaultSimulationConfig?: Partial<SimulationConfig>;
  cacheDuration?: number; // in milliseconds
  logger?: LoggerInterface;
}

// Generic logger interface that doesn't depend on engine
export interface LoggerInterface {
  info: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string | Error) => void;
  warn: (message: string) => void;
}

// Default console logger implementation
export class ConsoleLogger implements LoggerInterface {
  private prefix: string;
  
  constructor(prefix: string = 'LifeSimulator') {
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

/**
 * Core Life Simulator API Client
 * 
 * This class handles the core functionality of the life simulator without
 * any dependencies on game engines or external frameworks.
 */
export class LifeSimulatorApiClient {
  private apiBaseUrl: string;
  private apiKey?: string;
  private defaultConfig: Partial<SimulationConfig>;
  private cache: Map<string, { data: ActivityResponse, timestamp: number }> = new Map();
  private cacheDuration: number;
  private logger: LoggerInterface;

  constructor(options: LifeSimulatorOptions = {}) {
    // Always use the hardcoded URL, ignoring environment variables
    this.apiBaseUrl = 'https://state.gmika.io';
    this.apiKey = options.apiKey || STATE_OF_MIKA_API_KEY;
    this.defaultConfig = options.defaultSimulationConfig || {};
    this.cacheDuration = options.cacheDuration || 5 * 60 * 1000; // 5 minutes default
    this.logger = options.logger || new ConsoleLogger();
    
    // Log API configuration status
    if (this.apiKey) {
      this.logger.info(`Initialized with API key: ${this.apiKey.substring(0, 3)}...${this.apiKey.substring(this.apiKey.length - 3)}`);
    } else {
      this.logger.warn('Initialized without API key - some features may be limited');
    }
    
    this.logger.info(`Using API URL: ${this.apiBaseUrl}/simulate`);
  }

  /**
   * Fetch simulation data from the API
   * @param config Simulation configuration
   * @returns Promise with the activity response
   */
  public async fetchSimulation(config: SimulationConfig): Promise<ActivityResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key to headers if provided
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      // Ensure current_time is in ISO format if not provided
      if (!config.current_time) {
        config.current_time = new Date().toISOString();
      }

      const response = await axios.post<ActivityResponse>(
        `${this.apiBaseUrl}/simulate`,
        config,
        { headers }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Format axios error
        const simulatorError: SimulatorError = {
          status: error.response.status,
          message: error.message,
          detail: error.response.data?.detail || 'Unknown error',
        };
        throw simulatorError;
      }
      
      // Generic error
      throw {
        status: 500,
        message: 'Failed to fetch life simulation',
        detail: error instanceof Error ? error.message : 'Unknown error',
      } as SimulatorError;
    }
  }

  /**
   * Get a cache key for a simulation config
   * @param config Simulation configuration
   * @returns Cache key string
   */
  private getCacheKey(config: SimulationConfig): string {
    return `${config.name}_${config.residence.name}_${config.current_time}`;
  }

  /**
   * Check if a cached response is still valid
   * @param cacheEntry Cache entry with timestamp
   * @returns Boolean indicating if cache is valid
   */
  private isCacheValid(cacheEntry: { data: ActivityResponse, timestamp: number }): boolean {
    return (Date.now() - cacheEntry.timestamp) < this.cacheDuration;
  }

  /**
   * Get cached simulation data if available, otherwise fetch new data
   * @param config Simulation configuration
   * @param forceRefresh Force a refresh regardless of cache
   * @returns Promise with activity response
   */
  public async getLifeSimulation(
    config: SimulationConfig, 
    forceRefresh = false
  ): Promise<ActivityResponse> {
    const cacheKey = this.getCacheKey(config);
    
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        this.logger.debug(`Using cached simulation data for ${config.name}`);
        return cachedData.data;
      }
    }
    
    // Fetch new data
    this.logger.debug(`Fetching fresh simulation data for ${config.name}`);
    const freshData = await this.fetchSimulation(config);
    
    // Update cache
    this.cache.set(cacheKey, {
      data: freshData,
      timestamp: Date.now()
    });
    
    return freshData;
  }
  
  /**
   * Clear the client's cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.logger.debug("Cache cleared");
  }
  
  /**
   * Creates a complete configuration by merging with defaults
   */
  public mergeWithDefaultConfig(partialConfig: Partial<SimulationConfig>): SimulationConfig {
    // This validation ensures we have the minimum required properties
    if (!partialConfig.residence || !partialConfig.office || !partialConfig.occupation) {
      throw new Error("Configuration must include residence, office, and occupation");
    }
    
    if (!partialConfig.available_locations) {
      partialConfig.available_locations = {};
      
      // Add residence and office to available locations if not already there
      if (partialConfig.residence) {
        partialConfig.available_locations[partialConfig.residence.name] = partialConfig.residence;
      }
      
      if (partialConfig.office) {
        partialConfig.available_locations[partialConfig.office.name] = partialConfig.office;
      }
    }
    
    return {
      ...this.defaultConfig,
      ...partialConfig,
      current_time: partialConfig.current_time || new Date().toISOString()
    } as SimulationConfig;
  }
}

// Optional Type Definitions for Engine Integration
// These can be used by adapter if needed, but core functionality doesn't need them
export interface DigimonPluginInterface {
  name: string;
  onInitialize: (engine: any) => void; 
  onDisable: () => void;
}

export interface DigimonEngineInterface {
  getLogger: () => LoggerInterface;
  getPlugin: (name: string) => any;
}

/**
 * Generic interface for agent context that doesn't depend on engine
 */
export interface AgentContextInterface {
  agent: {
    name?: string;
    age?: number;
    gender?: string;
    occupation?: string;
    location?: any;
    home?: any;
    work?: any;
    state?: any;
  };
  memory?: {
    addThought: (thought: any) => void;
  };
  world?: {
    city?: string;
    country?: string;
    timezone?: string;
    locations?: any[];
  };
  engine?: any;
}

/**
 * Optional Engine Plugin Adapter
 * 
 * This class can be used to integrate with Digimon Engine, but the core
 * LifeSimulatorApiClient can be used standalone without this adapter.
 */
export class LifeSimulatorPlugin implements DigimonPluginInterface {
  public readonly name: string = 'LifeSimulatorPlugin';
  private client: LifeSimulatorApiClient;
  private engine: DigimonEngineInterface | null = null;
  private logger: LoggerInterface;

  constructor(options: LifeSimulatorOptions = {}) {
    this.logger = options.logger || new ConsoleLogger();
    this.client = new LifeSimulatorApiClient({
      ...options,
      logger: this.logger
    });
  }

  /**
   * Initialize the plugin with the Digimon Engine
   * @param engine The Digimon Engine instance
   */
  public onInitialize(engine: any): void {
    this.engine = engine;
    if (engine.getLogger) {
      this.logger = engine.getLogger();
    }
    this.logger.info(`[${this.name}] Initialized`);
  }

  /**
   * Convert a game location to a life simulator location
   * @param gameLocation Location from the game
   * @returns Location object for the life simulator
   */
  public gameLocationToSimLocation(
    gameLocation: { 
      name: string;
      coordinates?: { lat: number, lng: number } | [number, number]; 
      type?: string;
      tags?: string[];
      country?: string;
    }
  ): Location {
    let lat = 0;
    let lon = 0;
    
    // Handle different coordinate formats
    if (gameLocation.coordinates) {
      if (Array.isArray(gameLocation.coordinates)) {
        [lat, lon] = gameLocation.coordinates;
      } else {
        lat = gameLocation.coordinates.lat;
        lon = gameLocation.coordinates.lng;
      }
    }
    
    // Determine location type and role from tags if available
    let locationType = gameLocation.type || 'unknown';
    let locationRole: string | undefined = undefined;
    
    if (gameLocation.tags && gameLocation.tags.length > 0) {
      // Use first tag as role if available
      locationRole = gameLocation.tags[0];
    }
    
    return {
      name: gameLocation.name,
      lat,
      lon,
      type: locationType,
      role: locationRole,
      country: gameLocation.country
    };
  }

  /**
   * Create a simulation configuration from agent context
   * @param context Agent context from Digimon Engine
   * @returns SimulationConfig object
   */
  public createConfigFromAgent(context: AgentContextInterface): SimulationConfig {
    const agent = context.agent;
    const world = context.world;
    
    // Extract agent's current location
    const currentLocation = this.gameLocationToSimLocation({
      name: agent.location?.name || 'Unknown',
      coordinates: agent.location?.coordinates || [0, 0],
      type: agent.location?.type || 'unknown',
      country: agent.location?.country
    });
    
    // Extract agent's home/residence location if available
    const homeLocation = agent.home ? 
      this.gameLocationToSimLocation(agent.home) : currentLocation;
    
    // Extract agent's work/office location if available
    const officeLocation = agent.work ? 
      this.gameLocationToSimLocation(agent.work) : currentLocation;
    
    // Gather available locations from the world
    const availableLocations: Record<string, Location> = {};
    
    // Add current, home and office locations
    availableLocations[currentLocation.name] = currentLocation;
    if (agent.home) availableLocations[homeLocation.name] = homeLocation;
    if (agent.work) availableLocations[officeLocation.name] = officeLocation;
    
    // Add other relevant locations from the world
    if (world && world.locations) {
      for (const location of world.locations) {
        if (!availableLocations[location.name]) {
          availableLocations[location.name] = this.gameLocationToSimLocation(location);
        }
      }
    }
    
    return {
      name: agent.name || 'Unknown',
      age: agent.age || 30,
      gender: agent.gender || 'unknown',
      occupation: agent.occupation || 'Unknown',
      residence: homeLocation,
      office: officeLocation,
      available_locations: availableLocations,
      city: world?.city || 'Unknown',
      country: world?.country || 'Unknown',
      timezone: world?.timezone || 'UTC',
      current_time: new Date().toISOString()
    };
  }

  /**
   * Get life simulation for an agent
   * @param context Agent context from Digimon Engine
   * @param forceRefresh Force a refresh regardless of cache
   * @returns Promise with activity response
   */
  public async getAgentLifeSimulation(
    context: AgentContextInterface,
    forceRefresh = false
  ): Promise<ActivityResponse> {
    const config = this.createConfigFromAgent(context);
    return this.client.getLifeSimulation(config, forceRefresh);
  }

  /**
   * Get a simulation based on the provided config
   */
  public async getLifeSimulation(
    config: SimulationConfig,
    forceRefresh = false
  ): Promise<ActivityResponse> {
    return this.client.getLifeSimulation(config, forceRefresh);
  }

  /**
   * Apply simulation effects to an agent
   * @param context Agent context from Digimon Engine
   * @param simulation Simulation data
   */
  public applySimulationToAgent(context: AgentContextInterface, simulation: ActivityResponse): void {
    const agent = context.agent;
    const activity = simulation.activity;
    
    // Update agent state based on simulation
    if (agent.state) {
      agent.state.currentActivity = activity.main_action;
      agent.state.destination = activity.location.destination;
      agent.state.reason = activity.reason;
      
      // Update weather knowledge
      if (!agent.state.environment) {
        agent.state.environment = {};
      }
      agent.state.environment.weather = {
        condition: activity.details.weather.condition,
        temperature: activity.details.weather.temperature
      };
      
      // Add transit knowledge
      agent.state.transitOptions = activity.details.transit_info.routes.map(route => ({
        name: route.line_name,
        duration: route.duration_minutes,
        transfers: route.transfers
      }));
    }
    
    // Add simulation narrative to agent's memory/thoughts
    if (context.memory && activity.narrative) {
      context.memory.addThought({
        content: activity.narrative,
        timestamp: new Date().toISOString(),
        type: 'observation'
      });
    }
    
    // If there's an incident, handle it
    if (simulation.incident) {
      this.handleIncident(context, simulation.incident);
    }
    
    this.logger.debug(`Applied simulation to agent ${agent.name}`);
  }
  
  /**
   * Handle an incident for an agent
   * @param context Agent context from Digimon Engine
   * @param incident Incident data
   */
  private handleIncident(context: AgentContextInterface, incident: Incident): void {
    const agent = context.agent;
    
    // Add the incident to agent's memory
    if (context.memory) {
      context.memory.addThought({
        content: incident.description,
        timestamp: new Date().toISOString(),
        type: incident.type === 'positive' ? 'positive_event' : 'negative_event',
        metadata: {
          severity: incident.severity,
          impact_duration: incident.impact_duration
        }
      });
    }
    
    // Update agent state based on incident
    if (agent.state) {
      // If not already tracking incidents, initialize array
      if (!agent.state.activeIncidents) {
        agent.state.activeIncidents = [];
      }
      
      // Add this incident
      agent.state.activeIncidents.push({
        type: incident.type,
        description: incident.description,
        severity: incident.severity,
        remainingDuration: incident.impact_duration,
        affectsNextActivity: incident.affects_next_activity
      });
      
      // Apply emotional impact based on incident type and severity
      if (!agent.state.emotions) {
        agent.state.emotions = {};
      }
      
      if (incident.type === 'positive') {
        agent.state.emotions.happiness = Math.min(
          (agent.state.emotions.happiness || 0) + (incident.severity * 20), 
          100
        );
      } else {
        agent.state.emotions.stress = Math.min(
          (agent.state.emotions.stress || 0) + (incident.severity * 20), 
          100
        );
      }
    }
    
    this.logger.info(
      `Applied ${incident.type} incident to agent ${agent.name}: ${incident.description}`
    );
  }
  
  /**
   * Run a life simulation cycle for an agent
   * @param context Agent context from Digimon Engine
   * @param forceRefresh Force a refresh regardless of cache
   * @returns Promise with the updated agent context
   */
  public async runAgentLifeCycle(
    context: AgentContextInterface,
    forceRefresh = false
  ): Promise<AgentContextInterface> {
    // Get simulation data
    const simulation = await this.getAgentLifeSimulation(context, forceRefresh);
    
    // Apply simulation effects to agent
    this.applySimulationToAgent(context, simulation);
    
    // Return updated context
    return context;
  }
  
  /**
   * Get direct access to the underlying API client
   */
  public getApiClient(): LifeSimulatorApiClient {
    return this.client;
  }
  
  /**
   * Clean up when the plugin is disabled
   */
  public onDisable(): void {
    this.logger.info(`[${this.name}] Disabled`);
    this.client.clearCache();
  }
}

// Factory function to create the standalone API client
export function createLifeSimulatorClient(options?: LifeSimulatorOptions): LifeSimulatorApiClient {
  return new LifeSimulatorApiClient(options);
}

// Factory function to create the plugin adapter
export function createLifeSimulatorPlugin(options?: LifeSimulatorOptions): LifeSimulatorPlugin {
  return new LifeSimulatorPlugin(options);
}


