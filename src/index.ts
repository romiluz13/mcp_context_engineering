#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const server = new McpServer(
  {
    name: "mcp-context-engineering",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      logging: {},
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

// Load Universal AI Rules
function loadUniversalRules(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rulesPath = join(__dirname, '..', 'UNIVERSAL_AI_RULES.md');
    return readFileSync(rulesPath, 'utf8');
  } catch (error) {
    console.warn('Could not load UNIVERSAL_AI_RULES.md:', error);
    return `# Universal AI Assistant Rules

## Core Principles
- Follow project patterns and conventions
- Write comprehensive tests and documentation
- Use proper error handling and validation
- Maintain code quality and consistency
- Respect existing architecture and design patterns`;
  }
}

// Register MCP Resources
server.registerResource(
  "universal-ai-rules",
  "universal://ai-rules",
  {
    title: "Universal AI Assistant Rules",
    description: "Global rules and guidelines for AI assistants",
    mimeType: "text/markdown"
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: loadUniversalRules()
    }]
  })
);

server.registerResource(
  "platform-config",
  "config://platform",
  {
    title: "Platform Configuration",
    description: "MongoDB Context Engineering Platform configuration and status",
    mimeType: "application/json"
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        platform: "MongoDB Context Engineering",
        version: "1.0.0",
        capabilities: ["context-research", "context-assemble-prp"],
        mongodb_connected: !!mongoClient,
        openai_configured: !!config.openaiApiKey,
        status: "ready"
      }, null, 2)
    }]
  })
);

// Register MCP Prompts
server.registerPrompt(
  "context-engineering-workflow",
  {
    title: "Context Engineering Workflow",
    description: "Complete workflow for implementing features using MongoDB Context Engineering",
    argsSchema: {
      feature_description: z.string().describe("Description of the feature to implement")
    }
  },
  ({ feature_description }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `I want to implement: ${feature_description}

Please help me using the MongoDB Context Engineering workflow:

1. First, call context-research to find relevant patterns and best practices
2. Then, call context-assemble-prp to create a comprehensive implementation plan
3. Follow the generated PRP to implement the feature with proper validation

Let's start with research!`
      }
    }]
  })
);

server.registerPrompt(
  "debug-context-engineering",
  {
    title: "Debug Context Engineering",
    description: "Troubleshoot issues with MongoDB Context Engineering platform",
    argsSchema: {
      issue_description: z.string().describe("Description of the issue you're experiencing")
    }
  },
  ({ issue_description }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `I'm having an issue with MongoDB Context Engineering: ${issue_description}

Please help me debug this by:

1. Checking the platform configuration (use config://platform resource)
2. Verifying MongoDB connection and vector search setup
3. Testing the context-research and context-assemble-prp tools
4. Providing specific troubleshooting steps

Let's start by checking the platform status.`
      }
    }]
  })
);

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

  try {
    // Phase 1: Try advanced vector search first
    const vectorResults = await collection.aggregate([
      {
        $vectorSearch: {
          index: "patterns_vector_search",
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

    if (vectorResults.length > 0) {
      console.log(`🧠 Vector search found ${vectorResults.length} patterns`);
      return vectorResults;
    }
  } catch (error) {
    console.log(`⚠️ Vector search not available, falling back to basic search: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Phase 2: Fallback to basic search with metadata filtering
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

  try {
    // Try vector search first
    const vectorResults = await collection.aggregate([
      {
        $vectorSearch: {
          index: "rules_vector_search",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: maxRules * 2
        }
      },
      {
        $match: {
          technology_stack: { $in: techStack }
        }
      },
      {
        $addFields: {
          relevance_score: {
            $add: [
              { $multiply: ["$score", 0.5] }, // Vector similarity weight
              { $cond: [{ $eq: ["$enforcement_level", "mandatory"] }, 0.3, 0] }, // Mandatory bonus
              { $cond: [{ $eq: ["$enforcement_level", "recommended"] }, 0.2, 0] } // Recommended bonus
            ]
          }
        }
      },
      { $sort: { relevance_score: -1 } },
      { $limit: maxRules }
    ]).toArray();

    if (vectorResults.length > 0) {
      return vectorResults;
    }
  } catch (error) {
    console.log(`⚠️ Vector search for rules not available, using basic search`);
  }

  // Fallback to basic search
  return await collection.find({
    technology_stack: { $in: techStack }
  }, {
    limit: maxRules,
    sort: { enforcement_level: -1, priority: -1 }
  }).toArray();
}

// Research knowledge search
async function searchResearch(techStack: string[], queryEmbedding?: number[]) {
  const { mongoClient } = await initializeClients();
  const db = mongoClient!.db("context_engineering");
  const collection = db.collection("research_knowledge");

  if (queryEmbedding) {
    try {
      // Try vector search first
      const vectorResults = await collection.aggregate([
        {
          $vectorSearch: {
            index: "research_vector_search",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 30,
            limit: 20
          }
        },
        {
          $match: {
            technology_stack: { $in: techStack },
            freshness_score: { $gte: 0.7 }
          }
        },
        {
          $addFields: {
            relevance_score: {
              $add: [
                { $multiply: ["$score", 0.6] }, // Vector similarity weight
                { $multiply: ["$freshness_score", 0.4] } // Freshness weight
              ]
            }
          }
        },
        { $sort: { relevance_score: -1 } },
        { $limit: 10 }
      ]).toArray();

      if (vectorResults.length > 0) {
        return vectorResults;
      }
    } catch (error) {
      console.log(`⚠️ Vector search for research not available, using basic search`);
    }
  }

  // Fallback to basic search
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
  feature_request: z.string().describe("What you want to build (e.g., 'user authentication system', 'real-time chat', 'payment processing')"),
  technology_stack: z.array(z.string()).optional().describe("Technologies you're using (e.g., ['React', 'Node.js', 'MongoDB'])"),
  success_rate_threshold: z.number().min(0).max(1).optional().default(0.7).describe("Only show patterns with high success rates (0.7 = 70% success rate)"),
  max_results: z.number().min(1).max(50).optional().default(10).describe("Maximum number of research results to return"),
  include_research: z.boolean().optional().default(true).describe("Include external documentation and best practices")
};

server.registerTool(
  "context-research",
  {
    title: "Context Research",
    description: `🔍 COMPREHENSIVE RESEARCH ENGINE - Enhanced from original .claude/commands/generate-prp.md

RESEARCH METHODOLOGY (30+ minute depth from original):

**Phase 1: MongoDB Intelligence** (Instant)
- Search collaborative knowledge base for proven patterns
- Find similar implementations with success rates
- Identify relevant rules and best practices
- Leverage community-validated solutions

**Phase 2: Codebase Analysis** (AI Assistant Required)
⚠️  IMPORTANT: This tool provides MongoDB research. For complete research matching the original:
1. Ask AI assistant to search codebase for similar features/patterns
2. Request identification of files to reference in PRP
3. Ask for existing conventions and test patterns
4. Have AI assistant note integration requirements

**Phase 3: External Research** (AI Assistant Required)
⚠️  IMPORTANT: This tool provides MongoDB research. For complete research matching the original:
1. Ask AI assistant to search online for similar features/patterns
2. Request library documentation with specific URLs
3. Ask for implementation examples (GitHub/StackOverflow/blogs)
4. Have AI assistant find best practices and common pitfalls

**USAGE PATTERN for Original Research Depth:**
1. Call context-research (this tool) for MongoDB intelligence
2. Ask AI assistant: "Search codebase for similar patterns to [feature]"
3. Ask AI assistant: "Find external documentation and examples for [feature]"
4. Call context-assemble-prp with all research combined

This tool provides the MongoDB intelligence layer. Combine with AI assistant codebase/web research for full original methodology.`,
    inputSchema: contextResearchSchema,
  },
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
      const research = include_research ? await searchResearch(technology_stack, queryEmbedding) : [];

      // If no data found, provide helpful fallback guidance
      if (patterns.length === 0 && rules.length === 0 && research.length === 0) {
        console.log("ℹ️  No patterns found in database. Consider running: mcp-context-engineering generate-sample-data");
      }

      // Calculate comprehensive summary
      const summary = calculateSummary(patterns, rules, research);

      // Add research completion guidance for AI assistant
      const researchGuidance = {
        mongodb_research_complete: true,
        next_steps_for_original_depth: [
          {
            phase: "Codebase Analysis",
            action: `Search your codebase for similar features to: "${feature_request}"`,
            details: [
              "Look for existing implementations of similar functionality",
              "Identify files that should be referenced in the PRP",
              "Note existing conventions and patterns to follow",
              "Check test patterns for validation approach",
              "Find integration points and dependencies"
            ]
          },
          {
            phase: "External Research",
            action: `Search online for: "${feature_request}" best practices`,
            details: [
              "Find library documentation with specific URLs",
              "Look for implementation examples on GitHub/StackOverflow",
              "Research best practices and common pitfalls",
              "Find recent blog posts and tutorials",
              "Check for version-specific considerations"
            ]
          },
          {
            phase: "Research Integration",
            action: "Combine all research sources before calling context-assemble-prp",
            details: [
              "Merge MongoDB patterns with codebase findings",
              "Include external documentation URLs in PRP context",
              "Note any conflicts between different approaches",
              "Prioritize proven patterns with high success rates",
              "Prepare comprehensive context for PRP generation"
            ]
          }
        ],
        estimated_research_time: "20-30 minutes for original depth",
        mongodb_intelligence_summary: summary
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              patterns,
              rules,
              research,
              summary,
              research_guidance: researchGuidance,
              metadata: {
                query_embedding_generated: true,
                search_timestamp: new Date().toISOString(),
                tech_stack_used: technology_stack,
                success_threshold_applied: success_rate_threshold,
                vector_search_ready: false, // Will be true when Atlas Vector Search is configured
                research_phase: "mongodb_intelligence_complete",
                original_methodology_status: "requires_ai_assistant_for_codebase_and_external_research"
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
  const avgComplexity = researchSummary.complexity_distribution || {};
  if (avgComplexity && template.complexity_level && researchSummary.total_patterns > 0) {
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

server.registerTool(
  "context-assemble-prp",
  {
    title: "Context Assemble PRP",
    description: `📋 COMPREHENSIVE PRP GENERATION - Enhanced from original .claude/commands/generate-prp.md + PRPs/templates/prp_base.md

ORIGINAL WORKFLOW ENHANCED (212 lines of template intelligence):
- Uses research findings to create context-rich implementation plans
- Includes ALL necessary documentation, examples, and caveats
- Provides executable tests/validation loops for iterative refinement
- Follows "Context is King" principle with progressive success approach
- Incorporates MongoDB collaborative intelligence for proven patterns

PRP GENERATION PROCESS (from original):
1. **Load Research** - Use context-research results for comprehensive context
2. **Template Selection** - Choose optimal template based on complexity and preferences
3. **Context Assembly** - Include all documentation, examples, gotchas, and validation loops
4. **Validation Design** - Create executable tests and refinement checkpoints
5. **MongoDB Enhancement** - Add collaborative learning and success metrics

USAGE: Call AFTER context-research to create implementation-ready PRPs with full context.`,
    inputSchema: contextAssemblePRPSchema,
  },
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
      // Handle both direct research results and nested summary structure
      const researchSummary = research_results.summary || {
        total_patterns: (research_results.patterns || []).length,
        total_rules: (research_results.rules || []).length,
        total_research_sources: (research_results.research || []).length,
        complexity_distribution: {},
        avg_success_rate: 0,
        avg_relevance_score: 0,
        confidence_indicators: {
          high_success_patterns: 0,
          mandatory_rules: 0,
          fresh_research: 0
        }
      };

      const optimalTemplate = await findOptimalTemplate(
        queryEmbedding,
        template_preferences,
        researchSummary
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

// Generate dynamic PRP content using sophisticated template structure
function generateDynamicPRP(
  featureRequest: string,
  template: any,
  assembledContext: any,
  validationStrictness: string
): string {
  const { selected_patterns, prioritized_rules, relevant_research } = assembledContext;

  // Start with sophisticated PRP template structure (based on 212-line prp_base.md)
  let prp = `# Project Requirements and Patterns (PRP)\n\n`;

  prp += `**Template:** Base PRP Template v3 - MongoDB Context Engineering Enhanced\n`;
  prp += `**Generated:** ${new Date().toISOString()}\n`;
  prp += `**Confidence Score:** ${template?.compatibility_score || 0.8}/1.0\n\n`;

  // Core Principles (from original template)
  prp += `## Core Principles\n`;
  prp += `1. **Context is King**: Include ALL necessary documentation, examples, and caveats\n`;
  prp += `2. **Validation Loops**: Provide executable tests/lints the AI can run and fix\n`;
  prp += `3. **Information Dense**: Use keywords and patterns from the codebase\n`;
  prp += `4. **Progressive Success**: Start simple, validate, then enhance\n`;
  prp += `5. **Universal AI Rules**: Follow all universal AI assistant guidelines\n\n`;
  prp += `---\n\n`;

  // Goal section
  prp += `## Goal\n${featureRequest}\n\n`;

  // Why section (enhanced with pattern insights)
  prp += `## Why\n`;
  if (selected_patterns.length > 0) {
    const avgSuccessRate = selected_patterns.reduce((sum: number, p: any) => sum + (p.success_metrics?.success_rate || 0), 0) / selected_patterns.length;
    prp += `- **Proven Success**: Based on patterns with ${Math.round(avgSuccessRate * 100)}% average success rate\n`;
    prp += `- **Community Validated**: Leveraging ${selected_patterns.length} proven implementation patterns\n`;
  }
  prp += `- **MongoDB Intelligence**: Enhanced with collaborative learning and pattern recognition\n`;
  prp += `- **Universal Compatibility**: Works with any AI coding assistant via MCP protocol\n\n`;

  // What section with success criteria
  prp += `## What\n`;
  prp += `Implementation of: ${featureRequest}\n\n`;
  prp += `### Success Criteria\n`;
  prp += `- [ ] Feature implemented according to proven patterns\n`;
  prp += `- [ ] All validation loops pass successfully\n`;
  prp += `- [ ] Code follows universal AI assistant rules\n`;
  if (validationStrictness === 'strict') {
    prp += `- [ ] Success rate above 90% (strict validation)\n`;
    prp += `- [ ] All gotchas addressed with mitigation\n`;
  } else {
    prp += `- [ ] Success rate above 70% (standard validation)\n`;
  }
  prp += `\n`;

  // Universal AI Rules (critical for any AI assistant)
  prp += `## Universal AI Assistant Rules\n\n`;
  prp += `${loadUniversalRules()}\n\n`;
  prp += `---\n\n`;

  // All Needed Context section (from original sophisticated template)
  prp += `## All Needed Context\n\n`;

  // Documentation & References
  prp += `### Documentation & References\n`;
  prp += `\`\`\`yaml\n`;
  prp += `# MUST READ - Include these in your context window\n`;

  if (relevant_research.length > 0) {
    relevant_research.forEach((research: any) => {
      if (research.documentation_urls) {
        research.documentation_urls.forEach((url: string) => {
          prp += `- url: ${url}\n`;
          prp += `  why: ${research.summary || 'Key implementation guidance'}\n`;
        });
      }
    });
  }

  if (selected_patterns.length > 0) {
    selected_patterns.forEach((pattern: any) => {
      if (pattern.example_files) {
        pattern.example_files.forEach((file: string) => {
          prp += `- file: ${file}\n`;
          prp += `  why: Pattern to follow, proven ${Math.round((pattern.success_metrics?.success_rate || 0) * 100)}% success rate\n`;
        });
      }
    });
  }

  prp += `\`\`\`\n\n`;

  // Known Gotchas section (critical from original)
  prp += `### Known Gotchas & Library Quirks\n`;
  prp += `\`\`\`python\n`;
  if (selected_patterns.length > 0) {
    selected_patterns.forEach((pattern: any) => {
      if (pattern.gotchas && pattern.gotchas.length > 0) {
        pattern.gotchas.forEach((gotcha: string) => {
          prp += `# CRITICAL: ${gotcha}\n`;
        });
      }
    });
  }
  prp += `# PATTERN: Follow universal AI assistant rules for consistency\n`;
  prp += `# GOTCHA: Always validate inputs and handle edge cases\n`;
  prp += `\`\`\`\n\n`;

  // Implementation Blueprint section (sophisticated structure)
  prp += `## Implementation Blueprint\n\n`;

  // Add patterns as implementation guidance
  if (selected_patterns.length > 0) {
    prp += `### Proven Implementation Patterns\n\n`;
    selected_patterns.forEach((pattern: any, index: number) => {
      prp += `#### Pattern ${index + 1}: ${pattern.pattern_name || 'Unnamed Pattern'}\n`;
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

  // Validation Loop section (critical from original 212-line template)
  prp += `## Validation Loop\n\n`;

  prp += `### Level 1: Syntax & Style\n`;
  prp += `\`\`\`bash\n`;
  prp += `# Run these FIRST - fix any errors before proceeding\n`;
  prp += `# Adapt these commands to your project's tools:\n`;
  prp += `npm run lint --fix     # Auto-fix what's possible (JavaScript/TypeScript)\n`;
  prp += `ruff check --fix       # Auto-fix what's possible (Python)\n`;
  prp += `npm run type-check     # Type checking (TypeScript)\n`;
  prp += `mypy src/             # Type checking (Python)\n`;
  prp += `\n`;
  prp += `# Expected: No errors. If errors, READ the error and fix.\n`;
  prp += `\`\`\`\n\n`;

  prp += `### Level 2: Unit Tests\n`;
  prp += `\`\`\`bash\n`;
  prp += `# CREATE comprehensive test cases following project patterns:\n`;
  prp += `# - test_happy_path(): Basic functionality works\n`;
  prp += `# - test_validation_error(): Invalid input handled gracefully\n`;
  prp += `# - test_edge_cases(): Boundary conditions covered\n`;
  prp += `# - test_error_handling(): Failures handled appropriately\n`;
  prp += `\n`;
  prp += `# Run and iterate until passing:\n`;
  prp += `npm test              # JavaScript/TypeScript projects\n`;
  prp += `pytest tests/ -v      # Python projects\n`;
  prp += `# If failing: Read error, understand root cause, fix code, re-run\n`;
  prp += `\`\`\`\n\n`;

  prp += `### Level 3: Integration Test\n`;
  prp += `\`\`\`bash\n`;
  prp += `# Test the complete feature in realistic environment\n`;
  prp += `# Adapt these examples to your specific implementation:\n`;
  prp += `\n`;
  prp += `# For web services:\n`;
  prp += `# curl -X POST http://localhost:3000/api/feature \\\n`;
  prp += `#   -H "Content-Type: application/json" \\\n`;
  prp += `#   -d '{"param": "test_value"}'\n`;
  prp += `\n`;
  prp += `# For CLI tools:\n`;
  prp += `# ./your-tool --feature test-input\n`;
  prp += `\n`;
  prp += `# Expected: Success response with expected data structure\n`;
  prp += `# If error: Check logs and debug systematically\n`;
  prp += `\`\`\`\n\n`;

  // Final validation checklist (from original)
  prp += `## Final Validation Checklist\n`;
  prp += `- [ ] All tests pass: Run complete test suite\n`;
  prp += `- [ ] No linting errors: Code follows style guidelines\n`;
  prp += `- [ ] No type errors: Type safety maintained\n`;
  prp += `- [ ] Manual test successful: Feature works as expected\n`;
  prp += `- [ ] Error cases handled gracefully: No unhandled exceptions\n`;
  prp += `- [ ] Logs are informative but not verbose: Appropriate logging level\n`;
  prp += `- [ ] Documentation updated if needed: README, comments, etc.\n`;
  if (validationStrictness === 'strict') {
    prp += `- [ ] Success rate above 90%: Strict validation requirements met\n`;
    prp += `- [ ] All gotchas addressed: Known issues mitigated\n`;
  }
  prp += `\n`;

  // Anti-patterns section (from original)
  prp += `## Anti-Patterns to Avoid\n`;
  prp += `- ❌ Don't create new patterns when existing ones work\n`;
  prp += `- ❌ Don't skip validation because "it should work"\n`;
  prp += `- ❌ Don't ignore failing tests - fix them\n`;
  prp += `- ❌ Don't hardcode values that should be configurable\n`;
  prp += `- ❌ Don't catch all exceptions - be specific\n`;
  prp += `- ❌ Don't ignore universal AI assistant rules\n\n`;

  // MongoDB Context Engineering enhancement
  prp += `---\n\n`;
  prp += `## MongoDB Context Engineering Enhancement\n`;
  prp += `This PRP was generated using MongoDB Context Engineering Platform with:\n`;
  prp += `- **${selected_patterns.length} proven implementation patterns** with average ${Math.round((selected_patterns.reduce((sum: number, p: any) => sum + (p.success_metrics?.success_rate || 0), 0) / Math.max(selected_patterns.length, 1)) * 100)}% success rate\n`;
  prp += `- **${prioritized_rules.length} project rules** for consistency\n`;
  prp += `- **${relevant_research.length} research sources** for best practices\n`;
  prp += `- **Universal AI compatibility** via MCP protocol\n`;
  prp += `- **Collaborative learning** from community patterns\n\n`;

  prp += `🚀 **This represents the evolution from static context to dynamic, intelligent, collaborative intelligence!**\n`;

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
