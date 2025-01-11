import { Agent } from "../agent/base_agent";
import { ScoreMetrics, SkillScore } from "../types";

export class AgentScorer {
  /**
   * Scores an agent's social skills based on various metrics
   * @param agent The agent to evaluate
   * @returns A score between 0-100
   */
  public static scoreSocialSkills(agent: Agent): SkillScore {
    const metrics: ScoreMetrics = {
      communicationClarity: this.evaluateCommunicationClarity(agent),
      empathyLevel: this.evaluateEmpathy(agent),
      responseAppropriateness: this.evaluateResponseAppropriateness(agent),
      contextualAwareness: this.evaluateContextAwareness(agent),
    };

    const weightedScore = this.calculateWeightedScore(metrics);

    return {
      score: weightedScore,
      metrics,
      timestamp: new Date(),
    };
  }

  /**
   * Scores an agent's financial skills based on various metrics
   * @param agent The agent to evaluate
   * @returns A score between 0-100
   */
  public static scoreFinancialSkills(agent: Agent): SkillScore {
    const metrics: ScoreMetrics = {
      resourceManagement: this.evaluateResourceManagement(agent),
      decisionMaking: this.evaluateFinancialDecisions(agent),
      riskAssessment: this.evaluateRiskAssessment(agent),
      marketAwareness: this.evaluateMarketAwareness(agent),
    };

    const weightedScore = this.calculateWeightedScore(metrics);

    return {
      score: weightedScore,
      metrics,
      timestamp: new Date(),
    };
  }

  private static calculateWeightedScore(metrics: ScoreMetrics): number {
    const weights = {
      communicationClarity: 0.25,
      empathyLevel: 0.25,
      responseAppropriateness: 0.25,
      contextualAwareness: 0.25,
      resourceManagement: 0.25,
      decisionMaking: 0.25,
      riskAssessment: 0.25,
      marketAwareness: 0.25,
    };

    const totalScore = Object.entries(metrics).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof typeof weights];
    }, 0);

    return Math.min(Math.round(totalScore * 100), 100);
  }

  private static evaluateCommunicationClarity(agent: Agent): number {
    // Evaluate based on message clarity, grammar, and structure
    console.log("Evaluating communication clarity", agent);
    return 0.8; // Placeholder implementation
  }

  private static evaluateEmpathy(agent: Agent): number {
    // Evaluate emotional intelligence and response appropriateness
    console.log("Evaluating empathy", agent);
    return 0.7; // Placeholder implementation
  }

  private static evaluateResponseAppropriateness(agent: Agent): number {
    // Evaluate if responses match the context and tone
    console.log("Evaluating response appropriateness", agent);
    return 0.9; // Placeholder implementation
  }

  private static evaluateContextAwareness(agent: Agent): number {
    // Evaluate understanding of conversation context
    console.log("Evaluating context awareness", agent);
    return 0.85; // Placeholder implementation
  }

  private static evaluateResourceManagement(agent: Agent): number {
    // Evaluate how well the agent manages resources
    console.log("Evaluating resource management", agent);
    return 0.75; // Placeholder implementation
  }

  private static evaluateFinancialDecisions(agent: Agent): number {
    // Evaluate quality of financial decision making
    console.log("Evaluating financial decisions", agent);
    return 0.8; // Placeholder implementation
  }

  private static evaluateRiskAssessment(agent: Agent): number {
    // Evaluate risk assessment capabilities
    console.log("Evaluating risk assessment", agent);
    return 0.7; // Placeholder implementation
  }

  private static evaluateMarketAwareness(agent: Agent): number {
    // Evaluate understanding of market conditions
    console.log("Evaluating market awareness", agent);
    return 0.85; // Placeholder implementation
  }
}
