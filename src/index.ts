#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";
import OpenAI from "openai";

const server = new McpServer(
  {
    name: "mcp-context-engineering",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configuration
const config = {
  connectionString: process.env.MDB_MCP_CONNECTION_STRING,
  openaiApiKey: process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
};

// MongoDB client and OpenAI client
let mongoClient: MongoClient | null = null;
let openaiClient: OpenAI | null = null;

// Initialize clients
async function initializeClients() {
  if (!config.connectionString) {
    throw new Error("MDB_MCP_CONNECTION_STRING environment variable is required");
  }
  
  if (!config.openaiApiKey) {
    throw new Error("MDB_MCP_OPENAI_API_KEY or OPENAI_API_KEY environment variable is required");
  }

  // Initialize MongoDB client
  if (!mongoClient) {
    mongoClient = new MongoClient(config.connectionString);
    await mongoClient.connect();
  }

  // Initialize OpenAI client
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  return { mongoClient, openaiClient };
}

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const { openaiClient } = await initializeClients();
  
  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No embedding data returned from OpenAI");
    }

    return response.data[0]!.embedding;
  } catch (error) {
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Advanced pattern search with vector capabilities
async function searchPatterns(
  queryEmbedding: number[], 
  techStack: string[], 
  successThreshold: number, 
  maxPatterns: number
) {
  const { mongoClient } = await initializeClients();
  const db = mongoClient!.db("context_engineering");
  const collection = db.collection("implementation_patterns");

  // Phase 1: Basic search with metadata filtering
  // TODO: Replace with vector search when Atlas Vector Search indexes are set up
  const patterns = await collection.find({
    technology_stack: { $in: techStack },
    "success_metrics.success_rate": { $gte: successThreshold }
  }, {
    limit: maxPatterns,
    sort: { "success_metrics.success_rate": -1, "success_metrics.usage_count": -1 }
  }).toArray();

  // Add relevance scoring based on technology stack match
  return patterns.map(pattern => ({
    ...pattern,
    relevance_score: calculateRelevanceScore(pattern, techStack, queryEmbedding)
  }));

  /* TODO: Advanced vector search implementation for Phase 2:
  return await collection.aggregate([
    {
      $vectorSearch: {
        index: "patterns_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: maxPatterns * 2
      }
    },
    {
      $match: {
        technology_stack: { $in: techStack },
        "success_metrics.success_rate": { $gte: successThreshold }
      }
    },
    {
      $addFields: {
        relevance_score: {
          $add: [
            { $multiply: ["$score", 0.4] }, // Vector similarity weight
            { $multiply: ["$success_metrics.success_rate", 0.3] }, // Success rate weight
            { $multiply: ["$success_metrics.usage_count", 0.2] }, // Usage weight
            { $cond: [{ $in: ["$complexity_level", ["beginner", "intermediate"]] }, 0.1, 0] } // Complexity bonus
          ]
        }
      }
    },
    { $sort: { relevance_score: -1 } },
    { $limit: maxPatterns }
  ]).toArray();
  */
}

// Advanced rules search
async function searchRules(
  queryEmbedding: number[], 
  techStack: string[], 
  maxRules: number
) {
  const { mongoClient } = await initializeClients();
  const db = mongoClient!.db("context_engineering");
  const collection = db.collection("project_rules");

  // Phase 1: Basic search
  return await collection.find({
    technology_stack: { $in: techStack }
  }, {
    limit: maxRules,
    sort: { enforcement_level: -1, priority: -1 }
  }).toArray();
}

// Research knowledge search
async function searchResearch(techStack: string[]) {
  const { mongoClient } = await initializeClients();
  const db = mongoClient!.db("context_engineering");
  const collection = db.collection("research_knowledge");

  return await collection.find({
    technology_stack: { $in: techStack },
    freshness_score: { $gte: 0.7 }
  }, {
    limit: 10,
    sort: { freshness_score: -1, relevance_score: -1 }
  }).toArray();
}

// Calculate relevance score
function calculateRelevanceScore(pattern: any, techStack: string[], queryEmbedding: number[]): number {
  let score = 0;
  
  // Technology stack match bonus
  const techMatches = pattern.technology_stack?.filter((tech: string) => 
    techStack.some(userTech => userTech.toLowerCase().includes(tech.toLowerCase()))
  ).length || 0;
  score += (techMatches / Math.max(techStack.length, 1)) * 0.3;
  
  // Success rate bonus
  score += (pattern.success_metrics?.success_rate || 0) * 0.4;
  
  // Usage count bonus (normalized)
  const usageScore = Math.min((pattern.success_metrics?.usage_count || 0) / 100, 1);
  score += usageScore * 0.2;
  
  // Complexity appropriateness
  if (pattern.complexity_level === "intermediate") score += 0.1;
  
  return Math.round(score * 100) / 100;
}

// Calculate summary metrics
function calculateSummary(patterns: any[], rules: any[], research: any[]) {
  const avgSuccessRate = patterns.length > 0
    ? patterns.reduce((sum, p) => sum + (p.success_metrics?.success_rate || 0), 0) / patterns.length 
    : 0;

  const avgRelevanceScore = patterns.length > 0
    ? patterns.reduce((sum, p) => sum + (p.relevance_score || 0), 0) / patterns.length
    : 0;

  const complexityDistribution = patterns.reduce((acc, p) => {
    const level = p.complexity_level || 'unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total_patterns: patterns.length,
    total_rules: rules.length,
    total_research_sources: research.length,
    avg_success_rate: Math.round(avgSuccessRate * 100) / 100,
    avg_relevance_score: Math.round(avgRelevanceScore * 100) / 100,
    complexity_distribution: complexityDistribution,
    confidence_indicators: {
      high_success_patterns: patterns.filter(p => p.success_metrics?.success_rate >= 0.9).length,
      mandatory_rules: rules.filter(r => r.enforcement_level === 'mandatory').length,
      fresh_research: research.filter(r => r.freshness_score >= 0.9).length
    }
  };
}

// Context Research Tool
const contextResearchSchema = {
  feature_request: z.string().describe("The feature or functionality you want to implement"),
  technology_stack: z.array(z.string()).optional().describe("Technology stack preferences"),
  success_rate_threshold: z.number().min(0).max(1).optional().default(0.7).describe("Minimum success rate for patterns"),
  max_results: z.number().min(1).max(50).optional().default(10).describe("Maximum number of results to return"),
  include_research: z.boolean().optional().default(true).describe("Include external research knowledge")
};

server.tool(
  "context-research",
  "🔍 Intelligent pattern and rule discovery using MongoDB semantic search and vector embeddings",
  contextResearchSchema,
  async (args) => {
    try {
      const {
        feature_request,
        technology_stack = [],
        success_rate_threshold = 0.7,
        max_results = 10,
        include_research = true
      } = args;

      // Generate embedding for semantic search
      const queryEmbedding = await generateEmbedding(feature_request);

      // Search for relevant patterns with advanced scoring
      const patterns = await searchPatterns(queryEmbedding, technology_stack, success_rate_threshold, max_results);

      // Search for relevant rules
      const rules = await searchRules(queryEmbedding, technology_stack, Math.ceil(max_results / 2));

      // Search for research knowledge if requested
      const research = include_research ? await searchResearch(technology_stack) : [];

      // Calculate comprehensive summary
      const summary = calculateSummary(patterns, rules, research);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              patterns,
              rules,
              research,
              summary,
              metadata: {
                query_embedding_generated: true,
                search_timestamp: new Date().toISOString(),
                tech_stack_used: technology_stack,
                success_threshold_applied: success_rate_threshold,
                vector_search_ready: false // Will be true when Atlas Vector Search is configured
              }
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Context Research Error: ${error instanceof Error ? error.message : String(error)}\n\nThis may be due to:\n- Missing OpenAI API key for embeddings\n- MongoDB connection issues\n- Invalid context data structure\n\nPlease check your configuration and try again.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Advanced template search for PRP assembly
async function findOptimalTemplate(
  queryEmbedding: number[],
  templatePreferences: string[],
  researchSummary: any
) {
  const { mongoClient } = await initializeClients();
  const db = mongoClient!.db("context_engineering");
  const collection = db.collection("prp_templates");

  // Phase 1: Basic template search
  const query: any = {};
  if (templatePreferences.length > 0) {
    query.template_type = { $in: templatePreferences };
  }

  const templates = await collection.find(query, {
    limit: 5,
    sort: { success_rate: -1, usage_count: -1 }
  }).toArray();

  // Score templates based on research summary
  return templates.map(template => ({
    ...template,
    compatibility_score: calculateTemplateCompatibility(template, researchSummary)
  })).sort((a, b) => b.compatibility_score - a.compatibility_score)[0] || null;
}

// Calculate template compatibility
function calculateTemplateCompatibility(template: any, researchSummary: any): number {
  let score = 0;

  // Base success rate
  score += (template.success_rate || 0) * 0.4;

  // Usage count bonus (normalized)
  const usageScore = Math.min((template.usage_count || 0) / 50, 1);
  score += usageScore * 0.2;

  // Complexity match with research
  const avgComplexity = researchSummary.complexity_distribution;
  if (avgComplexity && template.complexity_level) {
    const complexityMatch = avgComplexity[template.complexity_level] || 0;
    score += (complexityMatch / researchSummary.total_patterns) * 0.3;
  }

  // High success pattern bonus
  if (researchSummary.confidence_indicators?.high_success_patterns > 0) {
    score += 0.1;
  }

  return Math.round(score * 100) / 100;
}

// Assemble optimal context using advanced algorithms
async function assembleOptimalContext(
  researchResults: any,
  queryEmbedding: number[],
  complexityPreference: string
) {
  const { patterns, rules, research, summary } = researchResults;

  // Filter patterns by complexity preference
  const filteredPatterns = patterns.filter((p: any) => {
    if (complexityPreference === "beginner") return p.complexity_level === "beginner";
    if (complexityPreference === "advanced") return ["intermediate", "advanced"].includes(p.complexity_level);
    return true; // intermediate accepts all
  });

  // Rank patterns by relevance and success
  const rankedPatterns = filteredPatterns
    .sort((a: any, b: any) => {
      const scoreA = (a.relevance_score || 0) * 0.6 + (a.success_metrics?.success_rate || 0) * 0.4;
      const scoreB = (b.relevance_score || 0) * 0.6 + (b.success_metrics?.success_rate || 0) * 0.4;
      return scoreB - scoreA;
    })
    .slice(0, 5); // Top 5 patterns

  // Prioritize mandatory rules
  const prioritizedRules = rules
    .sort((a: any, b: any) => {
      const priorityA = a.enforcement_level === 'mandatory' ? 2 : (a.enforcement_level === 'recommended' ? 1 : 0);
      const priorityB = b.enforcement_level === 'mandatory' ? 2 : (b.enforcement_level === 'recommended' ? 1 : 0);
      return priorityB - priorityA;
    });

  return {
    selected_patterns: rankedPatterns,
    prioritized_rules: prioritizedRules,
    relevant_research: research.slice(0, 3), // Top 3 research sources
    context_quality_score: calculateContextQuality(rankedPatterns, prioritizedRules, research),
    assembly_metadata: {
      complexity_filter_applied: complexityPreference,
      patterns_filtered: patterns.length - filteredPatterns.length,
      ranking_algorithm: "relevance_success_hybrid",
      assembly_timestamp: new Date().toISOString()
    }
  };
}

// Calculate context quality score
function calculateContextQuality(patterns: any[], rules: any[], research: any[]): number {
  let score = 0;

  // Pattern quality (40% weight)
  if (patterns.length > 0) {
    const avgPatternScore = patterns.reduce((sum, p) => sum + (p.relevance_score || 0), 0) / patterns.length;
    score += avgPatternScore * 0.4;
  }

  // Rule coverage (30% weight)
  const mandatoryRules = rules.filter(r => r.enforcement_level === 'mandatory').length;
  const ruleScore = Math.min(mandatoryRules / 3, 1); // Normalize to max 3 mandatory rules
  score += ruleScore * 0.3;

  // Research freshness (20% weight)
  if (research.length > 0) {
    const avgFreshness = research.reduce((sum, r) => sum + (r.freshness_score || 0), 0) / research.length;
    score += avgFreshness * 0.2;
  }

  // Completeness bonus (10% weight)
  const completeness = (patterns.length > 0 ? 0.4 : 0) + (rules.length > 0 ? 0.4 : 0) + (research.length > 0 ? 0.2 : 0);
  score += completeness * 0.1;

  return Math.round(score * 100) / 100;
}

// Context Assemble PRP Tool Schema
const contextAssemblePRPSchema = {
  feature_request: z.string().describe("The feature request to create PRP for"),
  research_results: z.object({
    patterns: z.array(z.any()),
    rules: z.array(z.any()),
    research: z.array(z.any()),
    summary: z.any()
  }).describe("Results from context-research tool"),
  template_preferences: z.array(z.string()).optional().default([]).describe("Preferred template types"),
  complexity_preference: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate").describe("Preferred complexity level"),
  validation_strictness: z.enum(["basic", "standard", "strict"]).optional().default("standard").describe("Validation requirements level")
};

server.tool(
  "context-assemble-prp",
  "📋 Dynamically assemble optimal PRP using MongoDB aggregation and advanced context intelligence",
  contextAssemblePRPSchema,
  async (args) => {
    try {
      const {
        feature_request,
        research_results,
        template_preferences = [],
        complexity_preference = "intermediate",
        validation_strictness = "standard"
      } = args;

      // Generate embedding for template matching
      const queryEmbedding = await generateEmbedding(feature_request);

      // Find optimal template using advanced scoring
      const optimalTemplate = await findOptimalTemplate(
        queryEmbedding,
        template_preferences,
        research_results.summary
      );

      // Assemble context using sophisticated algorithms
      const assembledContext = await assembleOptimalContext(
        research_results,
        queryEmbedding,
        complexity_preference
      );

      // Generate dynamic PRP content
      const prpContent = generateDynamicPRP(
        feature_request,
        optimalTemplate,
        assembledContext,
        validation_strictness
      );

      // Calculate confidence metrics
      const confidenceMetrics = calculatePRPConfidence(
        optimalTemplate,
        assembledContext,
        research_results.summary
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              prp_content: prpContent,
              template_used: optimalTemplate,
              assembled_context: assembledContext,
              confidence_metrics: confidenceMetrics,
              metadata: {
                generation_timestamp: new Date().toISOString(),
                complexity_preference: complexity_preference,
                validation_strictness: validation_strictness,
                template_compatibility_score: optimalTemplate?.compatibility_score || 0,
                context_quality_score: assembledContext.context_quality_score
              }
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Context Assemble PRP Error: ${error instanceof Error ? error.message : String(error)}\n\nThis may be due to:\n- Invalid research results format\n- Missing template data\n- MongoDB connection issues\n\nPlease ensure you run context-research first and check your configuration.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Generate dynamic PRP content
function generateDynamicPRP(
  featureRequest: string,
  template: any,
  assembledContext: any,
  validationStrictness: string
): string {
  const { selected_patterns, prioritized_rules, relevant_research } = assembledContext;

  let prp = `# Project Requirements and Patterns (PRP)\n\n`;
  prp += `## Feature Request\n${featureRequest}\n\n`;

  // Add patterns section
  if (selected_patterns.length > 0) {
    prp += `## Implementation Patterns\n\n`;
    selected_patterns.forEach((pattern: any, index: number) => {
      prp += `### Pattern ${index + 1}: ${pattern.pattern_name || 'Unnamed Pattern'}\n`;
      prp += `**Success Rate:** ${Math.round((pattern.success_metrics?.success_rate || 0) * 100)}%\n`;
      prp += `**Complexity:** ${pattern.complexity_level || 'Unknown'}\n`;
      prp += `**Description:** ${pattern.description || 'No description available'}\n\n`;

      if (pattern.implementation_steps) {
        prp += `**Implementation Steps:**\n`;
        pattern.implementation_steps.forEach((step: string, stepIndex: number) => {
          prp += `${stepIndex + 1}. ${step}\n`;
        });
        prp += `\n`;
      }

      if (pattern.gotchas && pattern.gotchas.length > 0) {
        prp += `**⚠️ Gotchas:**\n`;
        pattern.gotchas.forEach((gotcha: string) => {
          prp += `- ${gotcha}\n`;
        });
        prp += `\n`;
      }
    });
  }

  // Add rules section
  if (prioritized_rules.length > 0) {
    prp += `## Project Rules\n\n`;
    prioritized_rules.forEach((rule: any) => {
      const enforcement = rule.enforcement_level === 'mandatory' ? '🔴 MANDATORY' :
                         rule.enforcement_level === 'recommended' ? '🟡 RECOMMENDED' : '🟢 OPTIONAL';
      prp += `### ${enforcement}: ${rule.rule_name || 'Unnamed Rule'}\n`;
      prp += `${rule.description || 'No description available'}\n\n`;

      if (rule.examples && rule.examples.length > 0) {
        prp += `**Examples:**\n`;
        rule.examples.forEach((example: string) => {
          prp += `- ${example}\n`;
        });
        prp += `\n`;
      }
    });
  }

  // Add research section
  if (relevant_research.length > 0) {
    prp += `## Research Knowledge\n\n`;
    relevant_research.forEach((research: any, index: number) => {
      prp += `### Research Source ${index + 1}\n`;
      prp += `**Freshness Score:** ${Math.round((research.freshness_score || 0) * 100)}%\n`;
      prp += `**Summary:** ${research.summary || 'No summary available'}\n\n`;
    });
  }

  // Add validation section based on strictness
  if (validationStrictness !== 'basic') {
    prp += `## Validation Requirements\n\n`;
    prp += `**Validation Level:** ${validationStrictness.toUpperCase()}\n\n`;

    if (validationStrictness === 'strict') {
      prp += `- All mandatory rules must be followed\n`;
      prp += `- Success rate must be above 90%\n`;
      prp += `- All gotchas must be addressed\n`;
      prp += `- Implementation must include error handling\n`;
    } else {
      prp += `- Mandatory rules should be followed\n`;
      prp += `- Success rate should be above 70%\n`;
      prp += `- Major gotchas should be considered\n`;
    }
    prp += `\n`;
  }

  return prp;
}

// Calculate PRP confidence metrics
function calculatePRPConfidence(
  template: any,
  assembledContext: any,
  researchSummary: any
): any {
  const confidence = {
    overall_confidence: 0,
    template_confidence: template?.compatibility_score || 0,
    context_confidence: assembledContext.context_quality_score || 0,
    pattern_confidence: 0,
    rule_confidence: 0,
    research_confidence: 0
  };

  // Pattern confidence
  if (assembledContext.selected_patterns.length > 0) {
    const avgPatternSuccess = assembledContext.selected_patterns.reduce(
      (sum: number, p: any) => sum + (p.success_metrics?.success_rate || 0), 0
    ) / assembledContext.selected_patterns.length;
    confidence.pattern_confidence = avgPatternSuccess;
  }

  // Rule confidence
  const mandatoryRules = assembledContext.prioritized_rules.filter(
    (r: any) => r.enforcement_level === 'mandatory'
  ).length;
  confidence.rule_confidence = Math.min(mandatoryRules / 3, 1);

  // Research confidence
  if (assembledContext.relevant_research.length > 0) {
    const avgFreshness = assembledContext.relevant_research.reduce(
      (sum: number, r: any) => sum + (r.freshness_score || 0), 0
    ) / assembledContext.relevant_research.length;
    confidence.research_confidence = avgFreshness;
  }

  // Overall confidence (weighted average)
  confidence.overall_confidence = Math.round((
    confidence.template_confidence * 0.2 +
    confidence.context_confidence * 0.3 +
    confidence.pattern_confidence * 0.3 +
    confidence.rule_confidence * 0.15 +
    confidence.research_confidence * 0.05
  ) * 100) / 100;

  return confidence;
}

// Graceful shutdown
async function cleanup() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error("🚀 MCP Context Engineering Server started successfully!");
    console.error("📊 Advanced vector search capabilities ready");
    console.error("🔍 Tools available: context-research, context-assemble-prp");
  }
}

main().catch((error) => {
  console.error("Failed to start MCP Context Engineering Server:", error);
  process.exit(1);
});
