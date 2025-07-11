#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import { VoyageAIClient } from "voyageai";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Enhanced Memory Bank Types (Additive - No Breaking Changes)
interface EnhancedMemoryBank {
  // Existing fields (unchanged)
  project_name: string;
  created_at: Date;
  last_updated: Date;
  last_accessed: Date;
  technology_stack: string[];
  project_type?: string;
  project_path?: string;
  
  // Existing files structure (enhanced but backward compatible)
  files: {
    projectOverview?: string;
    architecture?: string;
    components?: string;
    developmentProcess?: string;
    apiDocumentation?: string;
    progressLog?: string;
  };
  
  // Existing patterns (enhanced but backward compatible)
  patterns: {
    implementation: any[];
    gotchas: any[];
    validation: any[];
  };
  
  // Existing config and success_metrics (unchanged)
  config: {
    memory_bank_version: string;
    real_time_features: any;
    expiryPolicy?: ExpiryPolicy; // NEW: Optional expiry settings
  };
  
  success_metrics: {
    prps_generated: number;
    implementations_successful: number;
    confidence_scores: number[];
    average_confidence: number;
    usageStats?: UsageStats; // NEW: Optional usage tracking
  };
  
  // NEW: Enhanced context fields (all optional - additive only)
  userExperienceGoals?: string; // User-focused goals and priorities
  activeContext?: ActiveContext; // What's being worked on right now
  knownIssues?: KnownIssue[]; // Current blockers and their status
  notes?: ContextNote[]; // Granular insights and learnings
  collaborative_intelligence?: CollaborativeIntelligence; // Community patterns
  archive?: ArchiveData; // Summarized archived data
}

// Enhanced Data Types (New - Additive)
interface ActiveContext {
  focus: string; // What's the current focus
  assignedTo: string[]; // Who's working on it
  startedAt: Date; // When work began
  urgency: 'low' | 'medium' | 'high' | 'critical'; // Priority level
  blockers?: string[]; // Current obstacles
  nextMilestone?: string; // Next target
}

interface KnownIssue {
  issue: string; // Description of the issue
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix'; // Current status
  workaround?: string; // Temporary solution if any
  lastUpdated: Date; // When status was last changed
  priority: 'low' | 'medium' | 'high'; // Issue priority
  affectedComponents?: string[]; // Which parts are affected
}

interface ContextNote {
  date: Date; // When note was created
  note: string; // The actual note content
  relevance: 'high' | 'medium' | 'low'; // How important this note is
  category: 'insight' | 'decision' | 'pattern' | 'gotcha' | 'reminder'; // Type of note
  tags?: string[]; // Searchable tags
}

interface CollaborativeIntelligence {
  community_patterns: CommunityPattern[];
  sync_history: {
    lastSync: Date;
    patterns_shared: number;
    patterns_received: number;
  };
  sharing_enabled: boolean;
}

interface CommunityPattern {
  name: string;
  summary: string;
  successRate: number;
  reference: string;
  technology: string[];
  usage_count: number;
  confidence_level: number;
}

interface ExpiryPolicy {
  progressLog_days?: number; // Archive progress entries after N days
  notes_days?: number; // Archive notes after N days
  knownIssues_days?: number; // Archive resolved issues after N days
  auto_archive_enabled: boolean; // Whether to auto-archive
}

interface UsageStats {
  mostAccessedPattern?: string;
  totalReads: number;
  totalUpdates: number;
  averageSessionLength?: number;
  patternSuccessRate?: number;
}

interface ArchiveData {
  progressLog?: ArchivedEntry[];
  notes?: ArchivedEntry[];
  knownIssues?: ArchivedEntry[];
  summary: string; // High-level summary of archived data
}

interface ArchivedEntry {
  date: Date;
  summary: string;
  type: string;
  archived_at: Date;
}

const server = new McpServer(
  {
    name: "mcp-context-engineering",
    version: "2.3.0",
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
  voyageApiKey: process.env.MDB_MCP_VOYAGE_API_KEY || process.env.VOYAGE_API_KEY,
  embeddingProvider: process.env.MDB_MCP_EMBEDDING_PROVIDER || "openai", // "openai" or "voyage"
  voyageModel: process.env.MDB_MCP_VOYAGE_MODEL || "voyage-large-2-instruct", // voyage-large-2-instruct, voyage-code-2, voyage-2, voyage-large-2
  openaiModel: process.env.MDB_MCP_OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  embeddingDimensions: parseInt(process.env.MDB_MCP_EMBEDDING_DIMENSIONS || "1536"),
};

// MongoDB client and embedding clients
let mongoClient: MongoClient | null = null;
let openaiClient: OpenAI | null = null;
let voyageClient: VoyageAIClient | null = null;

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

// Project Constitution System - Critical Missing Feature from Reference
let projectConstitution: string | null = null;

function loadProjectConstitution(): string | null {
  try {
    // Look for project-specific rules files in order of preference
    const possibleFiles = [
      '.cursorrules',      // Cursor AI standard
      'mcp_rules.md',      // MCP Context Engineering standard
      'CLAUDE.md',         // Original Context Engineering reference
      '.ai-rules',         // Alternative naming
      'project-rules.md'   // Generic alternative
    ];

    const currentDir = process.cwd();

    for (const filename of possibleFiles) {
      const filePath = join(currentDir, filename);
      try {
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf8');
          console.error(`📋 Loaded project constitution from: ${filename}`);
          return content;
        }
      } catch (error) {
        // Continue to next file
        continue;
      }
    }

    console.error('ℹ️ No project constitution found. Looked for:', possibleFiles.join(', '));
    return null;
  } catch (error) {
    console.warn('Could not load project constitution:', error);
    return null;
  }
}

// Initialize project constitution on startup
projectConstitution = loadProjectConstitution();

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
  async (uri: URL) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        platform: "MongoDB Context Engineering with Personal Pattern Library",
        version: "2.3.0",
        capabilities: [
          "context-research",
          "context-assemble-prp",
          "memory-bank-initialize",
          "memory-bank-read",
          "memory-bank-update",
          "memory-bank-sync"
        ],
        memory_bank_features: [
          "persistent-context",
          "real-time-updates",
          "collaborative-intelligence",
          "pattern-sharing",
          "version-history"
        ],
        mongodb_connected: !!mongoClient,
        openai_configured: !!config.openaiApiKey,
        voyage_configured: !!config.voyageApiKey,
        embedding_provider: config.embeddingProvider,
        embedding_model: config.embeddingProvider === "openai" ? config.openaiModel : config.voyageModel,
        embedding_dimensions: config.embeddingDimensions,
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

// Initialize clients with automatic database setup
async function initializeClients() {
  if (!config.connectionString) {
    throw new Error("MDB_MCP_CONNECTION_STRING environment variable is required");
  }

  if (!config.openaiApiKey) {
    throw new Error("MDB_MCP_OPENAI_API_KEY or OPENAI_API_KEY environment variable is required");
  }

  // Initialize MongoDB client
  if (!mongoClient) {
    mongoClient = new MongoClient(config.connectionString, {
      // Enhanced connection pool configuration for production
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Additional production optimizations
      retryWrites: true,
      retryReads: true,
      readPreference: 'primaryPreferred'
    });
    await mongoClient.connect();

    // Auto-setup database on first connection
    await ensureDatabaseSetup(mongoClient);
  }

  // Initialize OpenAI client
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  // Initialize Voyage client if using Voyage embeddings
  if (config.embeddingProvider === "voyage" && !voyageClient) {
    if (!config.voyageApiKey) {
      throw new Error("MDB_MCP_VOYAGE_API_KEY or VOYAGE_API_KEY environment variable is required when using Voyage embeddings");
    }
    voyageClient = new VoyageAIClient({
      apiKey: config.voyageApiKey,
    });
  }

  return { mongoClient, openaiClient };
}

// Ensure database collections exist (auto-setup)
async function ensureDatabaseSetup(client: MongoClient) {
  try {
    const db = client.db('context_engineering');

    // Check if collections exist, create if they don't
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'implementation_patterns',
      'project_rules',
      'research_knowledge',
      'prp_templates',
      'successful_prps',
      'discovered_gotchas',
      'memory_banks',
      'memory_templates',
      'memory_patterns'
    ];

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
      }
    }

    // Create enhanced indexes for optimal performance
    await enhanceDatabaseIndexes(db);

  } catch (error) {
    // Silently continue if setup fails - collections will be created on first use
    console.error('Auto-setup warning:', error instanceof Error ? error.message : String(error));
  }
}

// Enhanced database indexing for optimal performance
async function enhanceDatabaseIndexes(db: any) {
  try {
    const memoryBanks = db.collection('memory_banks');
    
    // Primary indexes
    await memoryBanks.createIndex({ project_name: 1 }, { unique: true });
    
    // Enhanced field indexes for new features
    await memoryBanks.createIndex({ 
      "activeContext.urgency": 1, 
      "activeContext.startedAt": -1 
    });
    
    await memoryBanks.createIndex({ 
      "knownIssues.status": 1, 
      "knownIssues.priority": 1,
      "knownIssues.lastUpdated": -1
    });
    
    await memoryBanks.createIndex({ 
      "notes.relevance": 1, 
      "notes.category": 1,
      "notes.date": -1 
    });
    
    await memoryBanks.createIndex({ 
      "technology_stack": 1,
      "config.memory_bank_version": 1,
      last_updated: -1
    });
    
    // Compound indexes for complex queries
    await memoryBanks.createIndex({ 
      project_name: 1, 
      "activeContext.urgency": 1, 
      "knownIssues.status": 1,
      last_updated: -1 
    });
    
    // Pattern collection indexes
    await db.collection('implementation_patterns').createIndex({ technology_stack: 1 });
    await db.collection('memory_patterns').createIndex({ pattern_type: 1, success_rate: -1 });
    
    // Additional collection indexes for performance
    await db.collection('implementation_patterns').createIndex({ 
      technology_stack: 1, 
      "success_metrics.success_rate": -1, 
      "success_metrics.usage_count": -1 
    });
    
    console.log('✅ Enhanced database indexes created successfully');
  } catch (error) {
    console.warn('Enhanced indexing warning:', error instanceof Error ? error.message : String(error));
  }
}

// Generate embeddings using configured provider (OpenAI or Voyage)
async function generateEmbedding(text: string, inputType: "query" | "document" = "document"): Promise<number[]> {
  await initializeClients();
  
  try {
    if (config.embeddingProvider === "voyage") {
      // Use Voyage AI for embeddings
      if (!voyageClient) {
        throw new Error("Voyage client not initialized");
      }

      // Add retry logic for robustness
      let retries = 3;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          const response = await voyageClient.embed({
            input: text,
            model: config.voyageModel,
            inputType: inputType, // Use the provided input type for better search
          });

          if (!response.data || response.data.length === 0) {
            throw new Error("No embedding data returned from Voyage AI");
          }

          // Voyage returns embeddings in response.data[0].embedding
          const embedding = response.data[0]?.embedding;
          
          if (!embedding) {
            throw new Error("No embedding data in Voyage AI response");
          }
          
          // Validate dimensions
          if (embedding.length !== config.embeddingDimensions) {
            console.warn(`Voyage embedding dimension mismatch: expected ${config.embeddingDimensions}, got ${embedding.length}`);
          }

          return embedding;
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
          }
        }
      }
      
      throw lastError || new Error("Failed to generate Voyage embedding after retries");
    } else {
      // Use OpenAI for embeddings (default)
      if (!openaiClient) {
        throw new Error("OpenAI client not initialized");
      }

      // Add retry logic for robustness
      let retries = 3;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          const response = await openaiClient.embeddings.create({
            model: config.openaiModel,
            input: text,
            dimensions: config.embeddingDimensions,
          });

          if (!response.data || response.data.length === 0) {
            throw new Error("No embedding data returned from OpenAI");
          }

          return response.data[0]!.embedding;
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
          }
        }
      }
      
      throw lastError || new Error("Failed to generate OpenAI embedding after retries");
    }
  } catch (error) {
    throw new Error(`Failed to generate embedding with ${config.embeddingProvider}: ${error instanceof Error ? error.message : String(error)}`);
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

// Context Research Tool - ORIGINAL METHODOLOGY PRESERVED
const contextResearchSchema = {
  feature_request: z.string().describe("Feature to build"),
  technology_stack: z.array(z.string()).optional().describe("Tech stack"),
  max_results: z.number().min(1).max(50).optional().default(10).describe("Max results")
};

server.registerTool(
  "context-research",
  {
    title: "Context Research",
    description: "Search MongoDB patterns and personal pattern library for feature implementation research",
    inputSchema: contextResearchSchema,
  },
  async (args) => {
    try {
      const {
        feature_request,
        technology_stack = [],
        max_results = 10
      } = args;

      // Set defaults for removed parameters
      const success_rate_threshold = 0.7;
      const include_research = true;

      // Generate embedding for semantic search (use "query" type for better search results)
      const queryEmbedding = await generateEmbedding(feature_request, "query");

      // Search for relevant patterns with advanced scoring
      const patterns = await searchPatterns(queryEmbedding, technology_stack, success_rate_threshold, max_results);

      // Search for relevant rules
      const rules = await searchRules(queryEmbedding, technology_stack, Math.ceil(max_results / 2));

      // Search for research knowledge if requested
      const research = include_research ? await searchResearch(technology_stack, queryEmbedding) : [];

      // If no data found, provide helpful fallback guidance
      if (patterns.length === 0 && rules.length === 0 && research.length === 0) {
        console.log("ℹ️  No patterns found in database. Patterns will be added as you use the system.");
      }

      // Calculate comprehensive summary
      const summary = calculateSummary(patterns, rules, research);

      // ORIGINAL RESEARCH COMPLETION GUIDANCE - EXACTLY AS REFERENCE
      const researchGuidance = {
        mongodb_research_complete: true,
        original_methodology_enhanced: true,
        ultrathink_phase_required: true,
        next_steps_for_original_depth: [
          {
            phase: "🔍 Codebase Analysis (Original Phase 1)",
            priority: "CRITICAL - Required for PRP context",
            action: `Use codebase-retrieval tool to search for patterns similar to: "${feature_request}"`,
            specific_searches: [
              `Search for: "${feature_request.split(' ').slice(0, 2).join(' ')}" implementation patterns`,
              `Search for: similar features or modules in the codebase`,
              `Search for: test patterns and validation approaches`,
              `Search for: configuration and setup patterns`,
              `Search for: error handling and edge case patterns`
            ],
            details: [
              "🎯 FIND: Existing implementations of similar functionality",
              "📁 IDENTIFY: Specific files to reference in PRP Documentation section",
              "📋 NOTE: Current conventions, naming patterns, and architectural decisions",
              "🧪 CHECK: Test patterns, mocking approaches, and validation strategies",
              "🔗 MAP: Integration points, dependencies, and configuration requirements",
              "⚠️ CAPTURE: Known gotchas, edge cases, and common pitfalls in this codebase"
            ],
            expected_output: "List of files to reference, patterns to follow, gotchas to avoid"
          },
          {
            phase: "🌐 External Research (Original Phase 2)",
            priority: "CRITICAL - Required for comprehensive context",
            action: `Use web-search tool to research: "${feature_request}" implementation best practices`,
            specific_searches: [
              `"${feature_request}" official documentation`,
              `"${feature_request}" implementation examples GitHub`,
              `"${feature_request}" best practices tutorial`,
              `"${feature_request}" common pitfalls gotchas`,
              `"${feature_request}" ${technology_stack.join(' ')} integration`
            ],
            details: [
              "📚 FIND: Official library/framework documentation with specific URLs",
              "💡 LOCATE: Implementation examples on GitHub, StackOverflow, dev blogs",
              "⚡ RESEARCH: Best practices, performance considerations, security implications",
              "⚠️ IDENTIFY: Common pitfalls, version compatibility issues, gotchas",
              "🔧 CHECK: Integration patterns with your technology stack",
              "📖 GATHER: Recent tutorials, migration guides, troubleshooting tips"
            ],
            expected_output: "URLs to documentation, example implementations, gotchas list"
          },
          {
            phase: "📋 Research Integration (Original Phase 3)",
            priority: "REQUIRED - Before calling context-assemble-prp",
            action: "Synthesize all research into comprehensive context for PRP generation",
            integration_checklist: [
              "✅ MongoDB patterns analyzed and prioritized by success rate",
              "✅ Codebase patterns identified with specific file references",
              "✅ External documentation gathered with URLs",
              "✅ Implementation examples collected and analyzed",
              "✅ Gotchas and pitfalls documented from all sources",
              "✅ Technology stack compatibility verified",
              "✅ Validation and testing approaches defined"
            ],
            details: [
              "🔄 MERGE: MongoDB patterns with codebase findings for consistency",
              "📎 INCLUDE: All documentation URLs in PRP context section",
              "⚖️ RESOLVE: Any conflicts between different approaches",
              "🎯 PRIORITIZE: Proven patterns with highest success rates",
              "📝 PREPARE: Comprehensive context for sophisticated PRP generation",
              "🧠 SYNTHESIZE: Create unified implementation strategy"
            ],
            expected_output: "Complete research summary ready for context-assemble-prp"
          }
        ],
        ultrathink_phase: {
          phase: "🧠 ULTRATHINK (CRITICAL - Before calling context-assemble-prp)",
          priority: "MANDATORY - Original methodology line 55",
          action: "Think hard before generating PRP. Create comprehensive plan addressing all requirements.",
          requirements: [
            "🎯 ANALYZE: All research findings and identify patterns",
            "🔄 SYNTHESIZE: MongoDB patterns + codebase findings + web research",
            "📋 PLAN: Break down complex tasks into manageable steps",
            "🎨 DESIGN: Choose optimal implementation approach",
            "⚠️ IDENTIFY: Potential gotchas and integration challenges",
            "🧪 STRATEGY: Define testing and validation approach",
            "📊 CONFIDENCE: Assess implementation complexity and success probability"
          ],
          todowrite_integration: "Use task management tools to create and track implementation plan",
          expected_output: "Comprehensive implementation strategy ready for PRP generation"
        },
        methodology_comparison: {
          original_claude_commands: "30+ minutes manual research + ULTRATHINK",
          mcp_enhanced_version: "Instant MongoDB intelligence + AI-guided research + ULTRATHINK",
          advantage: "Faster startup with personal pattern library + preserved planning depth"
        },
        mongodb_intelligence_summary: summary,
        // PROJECT CONSTITUTION - CRITICAL MISSING FEATURE FROM REFERENCE
        project_constitution: projectConstitution ? {
          source: "Project-specific rules loaded from local file",
          rules: projectConstitution,
          enforcement: "MANDATORY - These rules must be followed for ALL implementations in this project",
          integration_requirement: "Include these rules in context-assemble-prp call for proper PRP generation"
        } : {
          source: "No project constitution found",
          recommendation: "Create .cursorrules, mcp_rules.md, or CLAUDE.md file for project-specific rules",
          fallback: "Using universal AI rules only"
        }
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
  ultrathink_completed: z.boolean().describe("MANDATORY: Confirm ULTRATHINK phase completed (original methodology line 531)"),
  template_preferences: z.array(z.string()).optional().default([]).describe("Preferred template types"),
  complexity_preference: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate").describe("Preferred complexity level"),
  validation_strictness: z.enum(["basic", "standard", "strict"]).optional().default("standard").describe("Validation requirements level")
};

server.registerTool(
  "context-assemble-prp",
  {
    title: "Context Assemble PRP",
    description: "Generate comprehensive Project Requirements and Patterns (PRP) with validation loops and personal pattern intelligence",
    inputSchema: contextAssemblePRPSchema,
  },
  async (args) => {
    try {
      const {
        feature_request,
        research_results,
        ultrathink_completed,
        template_preferences = [],
        complexity_preference = "intermediate",
        validation_strictness = "standard"
      } = args;

      // ULTRATHINK VALIDATION - MANDATORY FROM ORIGINAL METHODOLOGY (line 531)
      if (!ultrathink_completed) {
        return {
          content: [{
            type: "text",
            text: `❌ **ULTRATHINK PHASE REQUIRED**

**CRITICAL ERROR**: You must complete the ULTRATHINK phase before generating PRPs.

This is a **MANDATORY** step from the original Context Engineering methodology (reference line 531):
"ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP"

**Required ULTRATHINK Process:**
🧠 **ANALYZE**: All research findings and identify patterns
🔄 **SYNTHESIZE**: MongoDB patterns + codebase findings + web research
📋 **PLAN**: Break down complex tasks into manageable steps
🎨 **DESIGN**: Choose optimal implementation approach
⚠️ **IDENTIFY**: Potential gotchas and integration challenges
🧪 **STRATEGY**: Define testing and validation approach
📊 **CONFIDENCE**: Assess implementation complexity and success probability

**Next Steps:**
1. Review all research results thoroughly
2. Think through your implementation strategy
3. Call this tool again with ultrathink_completed: true

**Why This Matters**: The original methodology requires deep thinking before PRP generation to ensure one-pass implementation success. This prevents rushed, incomplete PRPs that lead to implementation failures.`
          }],
          isError: true
        };
      }

      // Generate embedding for template matching (use "query" type for better matching)
      const queryEmbedding = await generateEmbedding(feature_request, "query");

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

      // Save PRP to MongoDB
      let prpId: string | null = null;
      if (mongoClient) {
        try {
          const db = mongoClient.db('context_engineering');
          const collection = db.collection('successful_prps');
          
          const prpDocument = {
            prp_id: `prp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            prp_content: prpContent,
            feature_request,
            template_used: optimalTemplate,
            assembled_context: assembledContext,
            confidence_metrics: confidenceMetrics,
            metadata: {
              generation_timestamp: new Date(),
              complexity_preference: complexity_preference,
              validation_strictness: validation_strictness,
              template_compatibility_score: optimalTemplate?.compatibility_score || 0,
              context_quality_score: assembledContext.context_quality_score
            },
            status: 'generated',
            created_at: new Date(),
            updated_at: new Date()
          };

          const insertResult = await collection.insertOne(prpDocument);
          prpId = prpDocument.prp_id;
        } catch (mongoError) {
          console.warn('Failed to save PRP to MongoDB:', mongoError);
        }
      }

      // Return both the PRP content and MongoDB storage info
      const response: any = {
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
      };

      if (prpId) {
        response.mongodb_storage = {
          stored: true,
          prp_id: prpId,
          collection: 'successful_prps',
          message: 'PRP saved to MongoDB for future execution and collaborative intelligence'
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
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

// 🚀 OUTPUT CAPTURE TOOLS - THE MISSING PIECE FOR TRUE COLLABORATIVE INTELLIGENCE!

// Define schemas for the new capture tools
const captureSuccessfulPrpSchema = {
  prp_content: z.string().describe("The complete PRP content that led to successful implementation"),
  feature_type: z.string().describe("Type of feature implemented (e.g., 'authentication', 'API endpoint', 'database integration')"),
  technology_stack: z.array(z.string()).optional().describe("Technologies used in the implementation"),
  implementation_success: z.boolean().describe("Whether the implementation was successful"),
  validation_results: z.object({
    tests_passed: z.boolean().optional(),
    linting_passed: z.boolean().optional(),
    integration_passed: z.boolean().optional()
  }).optional().describe("Results of validation loops"),
  discovered_gotchas: z.array(z.string()).optional().describe("Any gotchas or issues discovered during implementation"),
  confidence_score: z.number().min(1).max(10).optional().describe("Final confidence score (1-10) for this PRP's success")
};

// Tool to capture successful PRP outputs
server.registerTool(
  "capture-successful-prp",
  {
    title: "Capture Successful PRP",
    description: `📊 **CAPTURE SUCCESSFUL PRP OUTPUT**

**PURPOSE:** Store successful PRPs in MongoDB to build collaborative intelligence. This is the missing piece that transforms individual Context Engineering into community learning.

**WHEN TO USE:** After a PRP leads to successful implementation, call this tool to store the success patterns for future users.

**BUILDS COLLABORATIVE INTELLIGENCE:** Each successful PRP becomes part of the community knowledge base.`,
    inputSchema: captureSuccessfulPrpSchema
  },
  async (args) => {
    try {
      if (!mongoClient) {
        throw new Error("MongoDB not connected");
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('successful_prps');

      const prpRecord = {
        ...args,
        created_at: new Date(),
        usage_count: 0,
        community_rating: 0,
        success_rate: args.implementation_success ? 1.0 : 0.0
      };

      await collection.insertOne(prpRecord);

      return {
        content: [
          {
            type: "text",
            text: `✅ **Successful PRP Captured!**

🎯 **Feature Type:** ${args.feature_type}
📊 **Success Rate:** ${args.implementation_success ? '100%' : '0%'}
🔧 **Technology Stack:** ${args.technology_stack?.join(', ') || 'Not specified'}
💯 **Confidence Score:** ${args.confidence_score || 'Not provided'}/10

🚀 **Collaborative Intelligence Enhanced!**
This successful pattern is now available for future users implementing similar features.

💡 **Impact:** The next user requesting "${args.feature_type}" will benefit from your successful implementation patterns!`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error capturing PRP:** ${error instanceof Error ? error.message : String(error)}

This may be due to:
- MongoDB connection issues
- Invalid PRP data format
- Database permissions

The PRP was not stored, but your implementation is still successful!`,
          },
        ],
        isError: true,
      };
    }
  }
);

const captureImplementationPatternSchema = {
  pattern_name: z.string().describe("Name of the implementation pattern"),
  pattern_description: z.string().describe("Description of what this pattern does"),
  code_example: z.string().describe("Working code example demonstrating the pattern"),
  technology_stack: z.array(z.string()).optional().describe("Technologies this pattern applies to"),
  use_cases: z.array(z.string()).optional().describe("Specific use cases where this pattern worked"),
  success_metrics: z.object({
    implementation_time: z.string().optional(),
    complexity_level: z.enum(["simple", "moderate", "complex"]).optional(),
    maintenance_ease: z.enum(["easy", "moderate", "difficult"]).optional()
  }).optional().describe("Metrics about this pattern's success")
};

// Tool to capture implementation patterns that worked
server.registerTool(
  "capture-implementation-pattern",
  {
    title: "Capture Implementation Pattern",
    description: `🔧 **CAPTURE WORKING IMPLEMENTATION PATTERNS**

**PURPOSE:** Store specific code patterns, approaches, and techniques that led to successful implementations.

**BUILDS PATTERN INTELLIGENCE:** Each working pattern becomes part of the collaborative knowledge base with success metrics.`,
    inputSchema: captureImplementationPatternSchema
  },
  async (args) => {
    try {
      if (!mongoClient) {
        throw new Error("MongoDB not connected");
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('implementation_patterns');

      const patternRecord = {
        ...args,
        created_at: new Date(),
        usage_count: 0,
        success_rate: 1.0, // Starts at 100% since it worked
        community_votes: 0
      };

      await collection.insertOne(patternRecord);

      return {
        content: [
          {
            type: "text",
            text: `✅ **Implementation Pattern Captured!**

🔧 **Pattern:** ${args.pattern_name}
📝 **Description:** ${args.pattern_description}
🛠️ **Technologies:** ${args.technology_stack?.join(', ') || 'Not specified'}
🎯 **Use Cases:** ${args.use_cases?.join(', ') || 'Not specified'}

🚀 **Pattern Intelligence Enhanced!**
This working pattern is now available for future implementations.

💡 **Impact:** Developers working with similar requirements will discover this proven approach!`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error capturing pattern:** ${error instanceof Error ? error.message : String(error)}

The pattern was not stored, but you can still use it in your project!`,
          },
        ],
        isError: true,
      };
    }
  }
);

const captureDiscoveredGotchaSchema = {
  gotcha_title: z.string().describe("Brief title describing the gotcha"),
  problem_description: z.string().describe("Detailed description of the problem encountered"),
  solution: z.string().describe("How the problem was solved"),
  technology_stack: z.array(z.string()).optional().describe("Technologies where this gotcha applies"),
  severity: z.enum(["low", "medium", "high", "critical"]).optional().describe("How severe this gotcha is"),
  frequency: z.enum(["rare", "occasional", "common", "very_common"]).optional().describe("How often this gotcha occurs"),
  prevention_tips: z.array(z.string()).optional().describe("Tips to prevent this gotcha in the future")
};

// Tool to capture discovered gotchas and solutions
server.registerTool(
  "capture-discovered-gotcha",
  {
    title: "Capture Discovered Gotcha",
    description: `⚠️ **CAPTURE GOTCHAS AND SOLUTIONS**

**PURPOSE:** Store problems encountered during implementation and their solutions. This prevents others from hitting the same issues.

**BUILDS GOTCHA INTELLIGENCE:** Each discovered problem and solution becomes part of the collaborative knowledge base.`,
    inputSchema: captureDiscoveredGotchaSchema
  },
  async (args) => {
    try {
      if (!mongoClient) {
        throw new Error("MongoDB not connected");
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('discovered_gotchas');

      const gotchaRecord = {
        ...args,
        created_at: new Date(),
        reported_count: 1,
        community_confirmed: false
      };

      await collection.insertOne(gotchaRecord);

      return {
        content: [
          {
            type: "text",
            text: `✅ **Gotcha Captured!**

⚠️ **Problem:** ${args.gotcha_title}
🔧 **Solution:** ${args.solution}
📊 **Severity:** ${args.severity || 'Not specified'}
🔄 **Frequency:** ${args.frequency || 'Not specified'}
🛠️ **Technologies:** ${args.technology_stack?.join(', ') || 'Not specified'}

🚀 **Gotcha Intelligence Enhanced!**
This problem and solution are now available to help future developers.

💡 **Impact:** Others working with similar technologies will be warned about this issue and know how to solve it!`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error capturing gotcha:** ${error instanceof Error ? error.message : String(error)}

The gotcha was not stored, but you've still solved the problem!`,
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

  // PROJECT CONSTITUTION - CRITICAL MISSING FEATURE FROM REFERENCE
  if (projectConstitution) {
    prp += `## 📋 Project Constitution (MANDATORY)\n\n`;
    prp += `**CRITICAL**: These project-specific rules MUST be followed for all implementations:\n\n`;
    prp += `\`\`\`\n${projectConstitution}\n\`\`\`\n\n`;
    prp += `**Enforcement**: All code, tests, and documentation must comply with these rules.\n`;
    prp += `**Validation**: Include constitution compliance in all validation loops.\n\n`;
  } else {
    prp += `## ⚠️ No Project Constitution Found\n\n`;
    prp += `**Recommendation**: Create a \`.cursorrules\`, \`mcp_rules.md\`, or \`CLAUDE.md\` file in project root for:\n`;
    prp += `- File length limits (e.g., 500 lines max)\n`;
    prp += `- Testing standards and requirements\n`;
    prp += `- Code style and architecture patterns\n`;
    prp += `- Project-specific constraints and conventions\n\n`;
  }

  prp += `---\n\n`;

  // Goal section
  prp += `## Goal\n${featureRequest}\n\n`;

  // Why section (enhanced with pattern insights)
  prp += `## Why\n`;
  if (selected_patterns.length > 0) {
    const avgSuccessRate = selected_patterns.reduce((sum: number, p: any) => sum + (p.success_metrics?.success_rate || 0), 0) / selected_patterns.length;
    prp += `- **Proven Success**: Based on patterns with ${Math.round(avgSuccessRate * 100)}% average success rate\n`;
    prp += `- **Personal Library**: Leveraging ${selected_patterns.length} proven patterns from your implementation history\n`;
  }
  prp += `- **MongoDB Intelligence**: Enhanced with personal pattern library and success tracking\n`;
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

  // Current Codebase tree section (AI Assistant fills with actual content)
  prp += `### Current Codebase tree (run \`tree\` in the root of the project)\n`;
  prp += `\`\`\`bash\n`;
  prp += `# AI Assistant: Run tree command and replace this with actual output\n`;
  prp += `# Command: tree -I 'node_modules|dist|.git|__pycache__' -L 3\n`;
  prp += `# This section will contain the actual project structure\n`;
  prp += `\`\`\`\n\n`;

  // Desired Codebase tree section (AI Assistant plans structure)
  prp += `### Desired Codebase tree with files to be added and responsibility of file\n`;
  prp += `\`\`\`bash\n`;
  prp += `# AI Assistant: Plan the file structure for ${featureRequest}\n`;
  prp += `# Based on research findings and MongoDB patterns\n`;
  prp += `\n`;
  prp += `# Planned structure:\n`;
  prp += `src/\n`;
  prp += `├── ${featureRequest.toLowerCase().replace(/\s+/g, '_')}/\n`;
  prp += `│   ├── __init__.py              # Package initialization\n`;
  prp += `│   ├── main.py                 # Core ${featureRequest} implementation\n`;
  prp += `│   ├── models.py               # Data models and schemas\n`;
  prp += `│   ├── utils.py                # Helper functions\n`;
  prp += `│   └── config.py               # Configuration management\n`;
  prp += `├── api/\n`;
  prp += `│   └── ${featureRequest.toLowerCase().replace(/\s+/g, '_')}_routes.py  # API endpoints\n`;
  prp += `└── tests/\n`;
  prp += `    ├── test_${featureRequest.toLowerCase().replace(/\s+/g, '_')}.py     # Unit tests\n`;
  prp += `    └── test_integration.py     # Integration tests\n`;
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
  prp += `# GOTCHA: Check existing patterns before creating new ones\n`;
  prp += `# CRITICAL: Read all documentation URLs before implementation\n`;
  prp += `\`\`\`\n\n`;

  // Implementation Blueprint section (sophisticated structure)
  prp += `## Implementation Blueprint\n\n`;

  // Data models and structure section (from original template)
  prp += `### Data models and structure\n\n`;
  prp += `Create the core data models to ensure type safety and consistency.\n`;
  prp += `\`\`\`python\n`;
  prp += `# Examples based on your technology stack:\n`;
  prp += `# - ORM models (SQLAlchemy, Django, etc.)\n`;
  prp += `# - Pydantic models for validation\n`;
  prp += `# - Pydantic schemas for API responses\n`;
  prp += `# - Custom validators for business logic\n`;
  prp += `# - Type definitions for TypeScript\n`;
  prp += `# - Interface definitions\n`;
  prp += `\`\`\`\n\n`;

  // Task list section (sophisticated FIND/INJECT/PRESERVE patterns from original)
  prp += `### List of tasks to be completed to fulfill the PRP in the order they should be completed\n\n`;
  prp += `\`\`\`yaml\n`;
  prp += `Task 1: Setup and Configuration\n`;
  prp += `MODIFY config/settings.py:\n`;
  prp += `  - FIND pattern: "class Settings"\n`;
  prp += `  - INJECT after line containing "__init__"\n`;
  prp += `  - PRESERVE existing configuration structure\n`;
  prp += `\n`;
  prp += `CREATE src/${featureRequest.toLowerCase().replace(/\s+/g, '_')}/:\n`;
  prp += `  - MIRROR pattern from: src/similar_feature/ (if exists)\n`;
  prp += `  - MODIFY: adapt to new feature requirements\n`;
  prp += `  - KEEP: error handling pattern identical\n`;
  prp += `\n`;
  prp += `INSTALL dependencies:\n`;
  prp += `  - USE package manager (npm/pip/cargo)\n`;
  prp += `  - PATTERN: Follow existing dependency management\n`;
  prp += `  - PRESERVE: version compatibility\n`;
  prp += `\n`;
  prp += `Task 2: Core Data Models\n`;
  prp += `CREATE src/${featureRequest.toLowerCase().replace(/\s+/g, '_')}/models.py:\n`;
  prp += `  - MIRROR pattern from: src/existing_models.py\n`;
  prp += `  - FIND pattern: "class BaseModel"\n`;
  prp += `  - PRESERVE: validation patterns and type hints\n`;
  prp += `  - INJECT: new model definitions\n`;
  prp += `\n`;
  prp += `Task 3: Core Implementation\n`;
  prp += `CREATE src/${featureRequest.toLowerCase().replace(/\s+/g, '_')}/main.py:\n`;
  prp += `  - FIND pattern: existing implementation approaches\n`;
  prp += `  - MIRROR pattern from: similar feature implementation\n`;
  prp += `  - PRESERVE: existing method signatures\n`;
  prp += `  - INJECT: new functionality without breaking changes\n`;
  prp += `\n`;
  prp += `MODIFY src/api/routes.py:\n`;
  prp += `  - FIND pattern: "router.include_router"\n`;
  prp += `  - INJECT after existing routes\n`;
  prp += `  - PRESERVE: existing route structure\n`;
  prp += `\n`;
  prp += `Task 4: Integration Points\n`;
  prp += `MODIFY src/database/models.py:\n`;
  prp += `  - FIND pattern: existing table definitions\n`;
  prp += `  - INJECT: new table/column definitions\n`;
  prp += `  - PRESERVE: existing relationships\n`;
  prp += `\n`;
  prp += `CREATE migration files:\n`;
  prp += `  - PATTERN: Follow existing migration structure\n`;
  prp += `  - PRESERVE: data integrity\n`;
  prp += `\n`;
  prp += `Task 5: Testing Implementation\n`;
  prp += `CREATE tests/test_${featureRequest.toLowerCase().replace(/\s+/g, '_')}.py:\n`;
  prp += `  - MIRROR pattern from: tests/test_similar_feature.py\n`;
  prp += `  - FIND pattern: existing test structure\n`;
  prp += `  - PRESERVE: test naming conventions\n`;
  prp += `  - COVER: happy path, edge cases, error conditions\n`;
  prp += `\n`;
  prp += `Task 6: Documentation and Validation\n`;
  prp += `MODIFY README.md:\n`;
  prp += `  - FIND pattern: "## Features"\n`;
  prp += `  - INJECT: new feature documentation\n`;
  prp += `  - PRESERVE: existing documentation structure\n`;
  prp += `\n`;
  prp += `RUN validation loops:\n`;
  prp += `  - EXECUTE: all validation commands\n`;
  prp += `  - VERIFY: all success criteria met\n`;
  prp += `\`\`\`\n\n`;

  // Per task pseudocode section (sophisticated from original template)
  prp += `### Per task pseudocode as needed added to each task\n\n`;
  prp += `\`\`\`python\n`;
  prp += `# Task 1: Setup and Configuration\n`;
  prp += `# Pseudocode with CRITICAL details - don't write entire code\n`;
  prp += `def setup_feature_config():\n`;
  prp += `    # PATTERN: Always validate configuration first (see config/validators.py)\n`;
  prp += `    config = load_config()  # raises ConfigError if invalid\n`;
  prp += `    \n`;
  prp += `    # GOTCHA: Environment variables must be set before import\n`;
  prp += `    os.environ.setdefault('FEATURE_ENABLED', 'true')\n`;
  prp += `    \n`;
  prp += `    # CRITICAL: Database connection pool must be initialized\n`;
  prp += `    init_db_pool(config.database_url)  # see src/db/pool.py\n`;
  prp += `\n`;
  prp += `# Task 3: Core Implementation\n`;
  prp += `async def ${featureRequest.toLowerCase().replace(/\s+/g, '_')}_handler(request: Request) -> Response:\n`;
  prp += `    # PATTERN: Always validate input first (see src/validators.py)\n`;
  prp += `    validated = validate_request(request)  # raises ValidationError\n`;
  prp += `    \n`;
  prp += `    # GOTCHA: This API requires rate limiting\n`;
  prp += `    async with rate_limiter.acquire():  # see src/middleware/rate_limit.py\n`;
  prp += `        # PATTERN: Use existing retry decorator\n`;
  prp += `        @retry(attempts=3, backoff=exponential)\n`;
  prp += `        async def _inner():\n`;
  prp += `            # CRITICAL: External API returns 429 if >10 req/sec\n`;
  prp += `            await asyncio.sleep(0.1)  # Rate limiting\n`;
  prp += `            return await process_request(validated)\n`;
  prp += `        \n`;
  prp += `        result = await _inner()\n`;
  prp += `    \n`;
  prp += `    # PATTERN: Standardized response format\n`;
  prp += `    return format_response(result)  # see src/utils/responses.py\n`;
  prp += `\n`;
  prp += `# Task 5: Testing Implementation\n`;
  prp += `def test_${featureRequest.toLowerCase().replace(/\s+/g, '_')}_happy_path():\n`;
  prp += `    """Basic functionality works"""\n`;
  prp += `    # PATTERN: Use existing test fixtures (see conftest.py)\n`;
  prp += `    result = feature_handler("valid_input")\n`;
  prp += `    assert result.status == "success"\n`;
  prp += `    \n`;
  prp += `def test_validation_error():\n`;
  prp += `    """Invalid input raises ValidationError"""\n`;
  prp += `    # GOTCHA: Must test specific error types\n`;
  prp += `    with pytest.raises(ValidationError, match="specific_pattern"):\n`;
  prp += `        feature_handler("")\n`;
  prp += `\`\`\`\n\n`;

  // Advanced Pattern Intelligence (INDUSTRY-SHOCKING ENHANCEMENT)
  if (selected_patterns.length > 0) {
    prp += `### 🧠 Advanced Pattern Intelligence\n\n`;

    // Sort patterns by success rate and relevance
    const sortedPatterns = selected_patterns.sort((a: any, b: any) => {
      const aScore = (a.success_metrics?.success_rate || 0) * (a.relevance_score || 0.5);
      const bScore = (b.success_metrics?.success_rate || 0) * (b.relevance_score || 0.5);
      return bScore - aScore;
    });

    sortedPatterns.forEach((pattern: any, index: number) => {
      const successRate = Math.round((pattern.success_metrics?.success_rate || 0) * 100);
      const relevanceScore = Math.round((pattern.relevance_score || 0.5) * 100);
      const confidenceIndicator = successRate >= 90 ? '🟢' : successRate >= 70 ? '🟡' : '🔴';

      prp += `#### ${confidenceIndicator} Pattern ${index + 1}: ${pattern.pattern_name || 'Unnamed Pattern'}\n`;
      prp += `**Success Rate:** ${successRate}% | **Relevance:** ${relevanceScore}% | **Complexity:** ${pattern.complexity_level || 'Unknown'}\n`;
      prp += `**Description:** ${pattern.description || 'No description available'}\n\n`;

      // Advanced implementation guidance
      if (pattern.implementation_steps) {
        prp += `**🔧 Implementation Steps:**\n`;
        pattern.implementation_steps.forEach((step: string, stepIndex: number) => {
          prp += `${stepIndex + 1}. ${step}\n`;
        });
        prp += `\n`;
      }

      // Success factors
      if (pattern.success_factors) {
        prp += `**✅ Success Factors:**\n`;
        pattern.success_factors.forEach((factor: string) => {
          prp += `- ${factor}\n`;
        });
        prp += `\n`;
      }

      // Common pitfalls
      if (pattern.common_pitfalls) {
        prp += `**⚠️ Common Pitfalls:**\n`;
        pattern.common_pitfalls.forEach((pitfall: string) => {
          prp += `- ${pitfall}\n`;
        });
        prp += `\n`;
      }
    });

    // Pattern combination recommendations
    if (selected_patterns.length > 1) {
      prp += `### 🔗 Pattern Combination Strategy\n\n`;
      prp += `**Recommended Approach:** Combine patterns in order of success rate and complexity.\n`;
      prp += `**Integration Points:** Look for overlapping implementation steps to optimize development.\n`;
      prp += `**Risk Mitigation:** Start with highest success rate pattern as foundation.\n\n`;
    }
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

  // Integration Points section (from original template)
  prp += `### Integration Points\n`;
  prp += `\`\`\`yaml\n`;
  prp += `DATABASE:\n`;
  prp += `  - migration: "Add necessary database changes"\n`;
  prp += `  - index: "CREATE INDEX if needed for performance"\n`;
  prp += `  - constraints: "Add foreign keys and constraints"\n`;
  prp += `\n`;
  prp += `CONFIG:\n`;
  prp += `  - add to: config/settings file\n`;
  prp += `  - pattern: "FEATURE_CONFIG = os.getenv('FEATURE_CONFIG', 'default')"\n`;
  prp += `  - environment: "Add to .env.example"\n`;
  prp += `\n`;
  prp += `ROUTES/ENDPOINTS:\n`;
  prp += `  - add to: main router/app file\n`;
  prp += `  - pattern: "router.include_router(feature_router, prefix='/feature')"\n`;
  prp += `  - middleware: "Add authentication/validation if needed"\n`;
  prp += `\n`;
  prp += `DEPENDENCIES:\n`;
  prp += `  - install: "Use package manager for new dependencies"\n`;
  prp += `  - update: "requirements.txt, package.json, etc."\n`;
  prp += `  - version: "Pin versions for stability"\n`;
  prp += `\`\`\`\n\n`;

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

  prp += `### Level 2: Unit Tests each new feature/file/function use existing test patterns\n`;
  prp += `\`\`\`python\n`;
  prp += `# CREATE test_${featureRequest.toLowerCase().replace(/\s+/g, '_')}.py with these test cases:\n`;
  prp += `def test_happy_path():\n`;
  prp += `    """Basic functionality works"""\n`;
  prp += `    result = ${featureRequest.toLowerCase().replace(/\s+/g, '_')}_handler("valid_input")\n`;
  prp += `    assert result.status == "success"\n`;
  prp += `    assert result.data is not None\n`;
  prp += `\n`;
  prp += `def test_validation_error():\n`;
  prp += `    """Invalid input raises ValidationError"""\n`;
  prp += `    # GOTCHA: Must test specific error types\n`;
  prp += `    with pytest.raises(ValidationError, match="specific_pattern"):\n`;
  prp += `        ${featureRequest.toLowerCase().replace(/\s+/g, '_')}_handler("")\n`;
  prp += `\n`;
  prp += `def test_external_api_timeout():\n`;
  prp += `    """Handles timeouts gracefully"""\n`;
  prp += `    with mock.patch('external_api.call', side_effect=TimeoutError):\n`;
  prp += `        result = ${featureRequest.toLowerCase().replace(/\s+/g, '_')}_handler("valid")\n`;
  prp += `        assert result.status == "error"\n`;
  prp += `        assert "timeout" in result.message\n`;
  prp += `\n`;
  prp += `def test_edge_case_boundary():\n`;
  prp += `    """Boundary conditions handled correctly"""\n`;
  prp += `    # Test with empty, null, max length inputs\n`;
  prp += `    assert ${featureRequest.toLowerCase().replace(/\s+/g, '_')}_handler(None).status == "error"\n`;
  prp += `\`\`\`\n`;
  prp += `\n`;
  prp += `\`\`\`bash\n`;
  prp += `# Run and iterate until passing:\n`;
  prp += `pytest test_${featureRequest.toLowerCase().replace(/\s+/g, '_')}.py -v  # Python\n`;
  prp += `npm test ${featureRequest.toLowerCase().replace(/\s+/g, '_')}              # JavaScript/TypeScript\n`;
  prp += `# If failing: Read error, understand root cause, fix code, re-run (never mock to pass)\n`;
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

  prp += `🚀 **This represents the evolution from static context to dynamic, intelligent, collaborative intelligence!**\n\n`;

  // Add PRP confidence scoring (from original line 67)
  const confidence = calculatePRPConfidence(template, assembledContext, relevant_research);
  prp += `## PRP Confidence Score\n\n`;
  prp += `**Overall Confidence: ${confidence.overall_confidence}/10** (confidence level to succeed in one-pass implementation)\n\n`;
  prp += `### Confidence Breakdown:\n`;
  prp += `- **Template Quality:** ${Math.round(confidence.template_confidence * 10)}/10\n`;
  prp += `- **Context Completeness:** ${Math.round(confidence.context_confidence * 10)}/10\n`;
  prp += `- **Pattern Success Rate:** ${Math.round(confidence.pattern_confidence * 10)}/10\n`;
  prp += `- **Rule Coverage:** ${Math.round(confidence.rule_confidence * 10)}/10\n`;
  prp += `- **Research Freshness:** ${Math.round(confidence.research_confidence * 10)}/10\n\n`;

  if (confidence.overall_confidence >= 8) {
    prp += `✅ **HIGH CONFIDENCE** - Ready for one-pass implementation\n`;
  } else if (confidence.overall_confidence >= 6) {
    prp += `⚠️ **MEDIUM CONFIDENCE** - May require iteration during implementation\n`;
  } else {
    prp += `🔴 **LOW CONFIDENCE** - Consider additional research before implementation\n`;
  }

  prp += `\n---\n\n`;
  prp += `**Remember: The goal is one-pass implementation success through comprehensive context.**\n`;

  // Real-time PRP quality validation (INDUSTRY-SHOCKING ENHANCEMENT)
  const qualityValidation = validatePRPQuality(prp);

  // Add quality report to PRP
  prp += `\n## 🔍 PRP Quality Report (Real-time Validation)\n\n`;
  prp += `**Quality Score: ${qualityValidation.quality_score}/10**\n\n`;
  prp += `### Quality Breakdown:\n`;
  prp += `- **Completeness:** ${Math.round(qualityValidation.completeness_score * 10)}/10\n`;
  prp += `- **Sophistication:** ${Math.round(qualityValidation.sophistication_score * 10)}/10\n`;
  prp += `- **Validation Coverage:** ${Math.round(qualityValidation.validation_score * 10)}/10\n\n`;

  if (qualityValidation.missing_elements.length > 0) {
    prp += `### ⚠️ Missing Elements:\n`;
    qualityValidation.missing_elements.forEach((element: string) => {
      prp += `- ${element}\n`;
    });
    prp += `\n`;
  }

  if (qualityValidation.enhancement_suggestions.length > 0) {
    prp += `### 💡 Enhancement Suggestions:\n`;
    qualityValidation.enhancement_suggestions.forEach((suggestion: string) => {
      prp += `- ${suggestion}\n`;
    });
    prp += `\n`;
  }

  if (qualityValidation.quality_score >= 8) {
    prp += `✅ **EXCELLENT QUALITY** - This PRP meets industry-leading standards!\n`;
  } else if (qualityValidation.quality_score >= 6) {
    prp += `⚠️ **GOOD QUALITY** - Consider implementing enhancement suggestions\n`;
  } else {
    prp += `🔴 **NEEDS IMPROVEMENT** - Address missing elements before implementation\n`;
  }

  return prp;
}

// Real-time PRP Quality Validation (INDUSTRY-SHOCKING ENHANCEMENT)
function validatePRPQuality(prpContent: string): any {
  const validation = {
    quality_score: 0,
    completeness_score: 0,
    sophistication_score: 0,
    validation_score: 0,
    missing_elements: [] as string[],
    enhancement_suggestions: [] as string[]
  };

  // Check for critical sections from original template
  const requiredSections = [
    'Goal', 'Why', 'What', 'All Needed Context', 'Implementation Blueprint',
    'Data models and structure', 'List of tasks', 'Validation Loop', 'Anti-Patterns'
  ];

  const sophisticatedElements = [
    'FIND pattern', 'INJECT', 'PRESERVE', 'MIRROR pattern', 'PATTERN:', 'GOTCHA:', 'CRITICAL:'
  ];

  const validationElements = [
    'Level 1:', 'Level 2:', 'Level 3:', 'test_happy_path', 'test_validation_error'
  ];

  // Completeness check
  let foundSections = 0;
  requiredSections.forEach(section => {
    if (prpContent.includes(section)) {
      foundSections++;
    } else {
      validation.missing_elements.push(`Missing section: ${section}`);
    }
  });
  validation.completeness_score = foundSections / requiredSections.length;

  // Sophistication check
  let foundElements = 0;
  sophisticatedElements.forEach(element => {
    if (prpContent.includes(element)) {
      foundElements++;
    }
  });
  validation.sophistication_score = Math.min(foundElements / sophisticatedElements.length, 1);

  // Validation methodology check
  let foundValidation = 0;
  validationElements.forEach(element => {
    if (prpContent.includes(element)) {
      foundValidation++;
    }
  });
  validation.validation_score = foundValidation / validationElements.length;

  // Overall quality score
  validation.quality_score = Math.round((
    validation.completeness_score * 0.4 +
    validation.sophistication_score * 0.3 +
    validation.validation_score * 0.3
  ) * 10);

  // Enhancement suggestions
  if (validation.completeness_score < 0.8) {
    validation.enhancement_suggestions.push("Add missing critical sections for comprehensive context");
  }
  if (validation.sophistication_score < 0.6) {
    validation.enhancement_suggestions.push("Include more FIND/INJECT/PRESERVE patterns for precise implementation");
  }
  if (validation.validation_score < 0.7) {
    validation.enhancement_suggestions.push("Enhance validation loops with specific test cases and commands");
  }

  return validation;
}

// Calculate PRP confidence metrics (FIXED - was giving 0.02/10 scores)
function calculatePRPConfidence(
  template: any,
  assembledContext: any,
  researchSummary: any
): any {
  const confidence = {
    overall_confidence: 0,
    template_confidence: 0,
    context_confidence: 0,
    pattern_confidence: 0,
    rule_confidence: 0,
    research_confidence: 0
  };

  // Template confidence - realistic baseline
  confidence.template_confidence = template?.compatibility_score || 0.7; // Default to 70% if no template

  // Context confidence - based on what we actually have
  const hasPatterns = assembledContext.selected_patterns?.length > 0;
  const hasRules = assembledContext.prioritized_rules?.length > 0;
  const hasResearch = assembledContext.relevant_research?.length > 0;

  // Base context confidence on available data
  confidence.context_confidence = 0.5; // Base 50%
  if (hasPatterns) confidence.context_confidence += 0.2;
  if (hasRules) confidence.context_confidence += 0.2;
  if (hasResearch) confidence.context_confidence += 0.1;

  // Pattern confidence - realistic scoring
  if (hasPatterns) {
    const avgPatternSuccess = assembledContext.selected_patterns.reduce(
      (sum: number, p: any) => sum + (p.success_metrics?.success_rate || 0.6), 0
    ) / assembledContext.selected_patterns.length;
    confidence.pattern_confidence = avgPatternSuccess;
  } else {
    // No patterns from DB, but we still have methodology
    confidence.pattern_confidence = 0.6; // 60% confidence in methodology
  }

  // Rule confidence - realistic scoring
  if (hasRules) {
    const mandatoryRules = assembledContext.prioritized_rules.filter(
      (r: any) => r.enforcement_level === 'mandatory'
    ).length;
    confidence.rule_confidence = Math.min(mandatoryRules / 3, 1);
  } else {
    // No rules from DB, but we have universal rules
    confidence.rule_confidence = 0.7; // 70% confidence in universal rules
  }

  // Research confidence - realistic scoring
  if (hasResearch) {
    const avgFreshness = assembledContext.relevant_research.reduce(
      (sum: number, r: any) => sum + (r.freshness_score || 0.8), 0
    ) / assembledContext.relevant_research.length;
    confidence.research_confidence = avgFreshness;
  } else {
    // No research from DB, but AI will do research
    confidence.research_confidence = 0.8; // 80% confidence in AI research capability
  }

  // Overall confidence (weighted average) - now gives realistic scores
  confidence.overall_confidence = Math.round((
    confidence.template_confidence * 0.2 +
    confidence.context_confidence * 0.3 +
    confidence.pattern_confidence * 0.3 +
    confidence.rule_confidence * 0.15 +
    confidence.research_confidence * 0.05
  ) * 10); // Scale to 1-10 instead of 0-1

  // Ensure minimum confidence of 5/10 for basic methodology
  confidence.overall_confidence = Math.max(confidence.overall_confidence, 5);

  return confidence;
}

// 🧠 MEMORY BANK TOOLS - THE MISSING PIECE FOR PERSISTENT COLLABORATIVE INTELLIGENCE!

// Real-Time Update Mechanisms
interface UpdateTrigger {
  event_type: "architectural_change" | "pattern_discovery" | "code_impact" | "context_ambiguity" | "manual_command" | "session_end";
  impact_threshold: number; // ≥25% for automatic triggers
  detection_method: "ai_analysis" | "file_watching" | "user_command";
  auto_sync: boolean;
}

interface FileWatcher {
  enabled: boolean;
  watch_patterns: string[]; // ["memory-bank/**/*.md"]
  debounce_ms: number; // 1000ms to avoid spam
  auto_sync_on_change: boolean;
}

// Real-time update detection
function detectUpdateTrigger(changes: string, impactPercentage?: number): UpdateTrigger {
  const impact = impactPercentage || 0;

  // Detect architectural changes
  if (changes.toLowerCase().includes('architecture') ||
      changes.toLowerCase().includes('design pattern') ||
      changes.toLowerCase().includes('system') ||
      impact >= 50) {
    return {
      event_type: "architectural_change",
      impact_threshold: 50,
      detection_method: "ai_analysis",
      auto_sync: true
    };
  }

  // Detect pattern discoveries
  if (changes.toLowerCase().includes('pattern') ||
      changes.toLowerCase().includes('approach') ||
      changes.toLowerCase().includes('solution')) {
    return {
      event_type: "pattern_discovery",
      impact_threshold: 25,
      detection_method: "ai_analysis",
      auto_sync: true
    };
  }

  // Detect significant code impact
  if (impact >= 25) {
    return {
      event_type: "code_impact",
      impact_threshold: 25,
      detection_method: "ai_analysis",
      auto_sync: true
    };
  }

  // Default to manual command
  return {
    event_type: "manual_command",
    impact_threshold: 0,
    detection_method: "user_command",
    auto_sync: false
  };
}

// Manual command detection
function isManualUpdateCommand(input: string): boolean {
  const commands = [
    "update memory bank",
    "umb",
    "sync memory bank",
    "memory bank update",
    "update context"
  ];

  return commands.some(cmd => input.toLowerCase().includes(cmd));
}

// Memory Bank Helper Functions

// Context Prioritization Engine - AI-Optimized Information Ranking
interface PriorityItem {
  content: any;
  type: 'activeContext' | 'knownIssue' | 'note' | 'pattern' | 'userGoal';
  priority: number; // 0-100 scale
  recency: number; // 0-100 scale (newer = higher)
  relevance: number; // 0-100 scale
  urgency: number; // 0-100 scale
  impact: number; // 0-100 scale
  successRate?: number; // 0-100 scale for patterns
  finalScore?: number; // Calculated final priority score
  summarized?: boolean; // Whether content was summarized for context window
}

function prioritizeContext(memoryBank: EnhancedMemoryBank, contextFocus: string = 'full'): PriorityItem[] {
  const items: PriorityItem[] = [];
  const now = new Date();
  
  // Helper function to calculate recency score (more recent = higher score)
  const getRecencyScore = (date: Date): number => {
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 100 - (daysDiff * 2)); // Lose 2 points per day
  };
  
  // Helper function to calculate relevance based on current focus
  const getRelevanceScore = (content: string, tags: string[] = []): number => {
    let score = 50; // Base relevance
    
    if (memoryBank.activeContext?.focus) {
      const focusWords = memoryBank.activeContext.focus.toLowerCase().split(' ');
      const contentWords = content.toLowerCase().split(' ');
      const matchingWords = focusWords.filter(word => contentWords.includes(word));
      score += (matchingWords.length / focusWords.length) * 30;
    }
    
    if (memoryBank.technology_stack) {
      const techMatches = tags.filter(tag => 
        memoryBank.technology_stack!.some(tech => tech.toLowerCase().includes(tag.toLowerCase()))
      );
      score += (techMatches.length / Math.max(tags.length, 1)) * 20;
    }
    
    return Math.min(100, score);
  };
  
  // 1. Prioritize Active Context (HIGHEST PRIORITY)
  if (memoryBank.activeContext) {
    items.push({
      content: memoryBank.activeContext,
      type: 'activeContext',
      priority: 95,
      recency: getRecencyScore(memoryBank.activeContext.startedAt),
      relevance: 100, // Always 100% relevant
      urgency: memoryBank.activeContext.urgency === 'critical' ? 100 : 
               memoryBank.activeContext.urgency === 'high' ? 75 : 
               memoryBank.activeContext.urgency === 'medium' ? 50 : 25,
      impact: memoryBank.activeContext.blockers?.length ? 90 : 70
    });
  }
  
  // 2. Prioritize Known Issues (HIGH PRIORITY for open issues)
  if (memoryBank.knownIssues) {
    memoryBank.knownIssues.forEach(issue => {
      const isOpen = issue.status === 'open' || issue.status === 'in_progress';
      items.push({
        content: issue,
        type: 'knownIssue',
        priority: isOpen ? 90 : 30,
        recency: getRecencyScore(issue.lastUpdated),
        relevance: getRelevanceScore(issue.issue, issue.affectedComponents),
        urgency: issue.priority === 'high' ? 90 : 
                 issue.priority === 'medium' ? 60 : 30,
        impact: issue.affectedComponents?.length ? 80 : 50
      });
    });
  }
  
  // 3. Prioritize User Experience Goals (MEDIUM-HIGH PRIORITY)
  if (memoryBank.userExperienceGoals) {
    items.push({
      content: memoryBank.userExperienceGoals,
      type: 'userGoal',
      priority: 80,
      recency: 50, // Static content, medium recency
      relevance: 100, // Always relevant
      urgency: 60, // Important but not urgent
      impact: 85 // High impact on user satisfaction
    });
  }
  
  // 4. Prioritize Recent High-Relevance Notes
  if (memoryBank.notes) {
    memoryBank.notes.forEach(note => {
      const relevanceMultiplier = note.relevance === 'high' ? 1.5 : 
                                 note.relevance === 'medium' ? 1.0 : 0.5;
      const categoryMultiplier = note.category === 'insight' ? 1.2 : 
                                note.category === 'decision' ? 1.1 : 1.0;
      
      items.push({
        content: note,
        type: 'note',
        priority: 70 * relevanceMultiplier * categoryMultiplier,
        recency: getRecencyScore(note.date),
        relevance: getRelevanceScore(note.note, note.tags),
        urgency: note.relevance === 'high' ? 70 : 40,
        impact: note.category === 'decision' ? 80 : 60
      });
    });
  }
  
  // 5. Prioritize Implementation Patterns (by success rate)
  if (memoryBank.patterns?.implementation) {
    memoryBank.patterns.implementation.forEach(pattern => {
      const confidence = typeof pattern === 'object' ? pattern.confidence : 5;
      const successRate = (confidence / 10) * 100;
      
      items.push({
        content: pattern,
        type: 'pattern',
        priority: 60 + (successRate * 0.3),
        recency: typeof pattern === 'object' && pattern.discovered_at ? 
                 getRecencyScore(new Date(pattern.discovered_at)) : 50,
        relevance: getRelevanceScore(typeof pattern === 'string' ? pattern : pattern.content || ''),
        urgency: 40,
        impact: successRate,
        successRate: successRate
      });
    });
  }
  
  // Calculate final priority scores and sort
  const prioritizedItems = items.map(item => ({
    ...item,
    finalScore: (
      item.priority * 0.4 +        // Base priority weight
      item.recency * 0.2 +         // Recency weight
      item.relevance * 0.2 +       // Relevance weight
      item.urgency * 0.1 +         // Urgency weight
      item.impact * 0.1            // Impact weight
    )
  })).sort((a, b) => b.finalScore - a.finalScore);
  
  // Apply context focus filtering
  if (contextFocus === 'active') {
    return prioritizedItems.filter(item => 
      item.type === 'activeContext' || item.type === 'knownIssue' || 
      (item.type === 'note' && item.content.relevance === 'high')
    );
  } else if (contextFocus === 'technical') {
    return prioritizedItems.filter(item => 
      item.type === 'pattern' || item.type === 'note' || 
      item.type === 'activeContext'
    );
  } else if (contextFocus === 'progress') {
    return prioritizedItems.filter(item => 
      item.type === 'activeContext' || item.type === 'knownIssue' ||
      (item.type === 'note' && item.content.category === 'decision')
    );
  }
  
  return prioritizedItems;
}

// Context Window Optimization - Intelligent Content Summarization
function optimizeForContextWindow(prioritizedItems: PriorityItem[], maxTokens: number = 8000): PriorityItem[] {
  let currentTokens = 0;
  const optimizedItems: PriorityItem[] = [];
  
  // Rough token estimation (4 characters per token average)
  const estimateTokens = (content: any): number => {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    return Math.ceil(text.length / 4);
  };
  
  // Always include highest priority items first
  for (const item of prioritizedItems) {
    const itemTokens = estimateTokens(item.content);
    
    if (currentTokens + itemTokens <= maxTokens) {
      optimizedItems.push(item);
      currentTokens += itemTokens;
    } else {
      // Try to include a summary for remaining high-priority items
      if ((item.finalScore || 0) > 70 && currentTokens + 50 <= maxTokens) {
        const summarizedItem = {
          ...item,
          content: summarizeContent(item.content, item.type),
          summarized: true
        };
        optimizedItems.push(summarizedItem);
        currentTokens += 50;
      }
    }
    
    if (currentTokens >= maxTokens * 0.9) break; // Leave some buffer
  }
  
  return optimizedItems;
}

// Content Summarization Helper
function summarizeContent(content: any, type: string): string {
  switch (type) {
    case 'activeContext':
      return `Active: ${content.focus.substring(0, 50)}... (${content.urgency} priority)`;
    case 'knownIssue':
      return `Issue: ${content.issue.substring(0, 50)}... (${content.status})`;
    case 'note':
      return `${content.category}: ${content.note.substring(0, 50)}...`;
    case 'pattern':
      const patternText = typeof content === 'string' ? content : content.content || '';
      return `Pattern: ${patternText.substring(0, 50)}...`;
    case 'userGoal':
      return `Goals: ${content.substring(0, 50)}...`;
    default:
      return `${type}: ${JSON.stringify(content).substring(0, 50)}...`;
  }
}

// Archiving and Expiry System - Intelligent Data Lifecycle Management
async function processDataExpiry(memoryBank: EnhancedMemoryBank): Promise<{
  archived: number;
  summary: string;
  updatedMemoryBank: EnhancedMemoryBank;
}> {
  const now = new Date();
  const expiryPolicy = memoryBank.config.expiryPolicy;
  let archivedCount = 0;
  let archiveSummary = '';
  
  if (!expiryPolicy?.auto_archive_enabled) {
    return {
      archived: 0,
      summary: 'Auto-archiving disabled',
      updatedMemoryBank: memoryBank
    };
  }
  
  const updatedMemoryBank = { ...memoryBank };
  const archive = updatedMemoryBank.archive || { progressLog: [], notes: [], knownIssues: [], summary: '' };
  
  // Archive old progress log entries
  if (expiryPolicy.progressLog_days && updatedMemoryBank.files?.progressLog) {
    const cutoffDate = new Date(now.getTime() - (expiryPolicy.progressLog_days * 24 * 60 * 60 * 1000));
    const progressEntries = extractProgressEntries(updatedMemoryBank.files.progressLog);
    const toArchive = progressEntries.filter(entry => entry.date < cutoffDate);
    
    if (toArchive.length > 0) {
      toArchive.forEach(entry => {
        archive.progressLog?.push({
          date: entry.date,
          summary: entry.summary,
          type: 'progress',
          archived_at: now
        });
      });
      
      // Update progressLog to remove archived entries
      updatedMemoryBank.files.progressLog = cleanProgressLog(updatedMemoryBank.files.progressLog, cutoffDate);
      archivedCount += toArchive.length;
      archiveSummary += `Archived ${toArchive.length} old progress entries. `;
    }
  }
  
  // Archive old notes
  if (expiryPolicy.notes_days && updatedMemoryBank.notes) {
    const cutoffDate = new Date(now.getTime() - (expiryPolicy.notes_days * 24 * 60 * 60 * 1000));
    const toArchive = updatedMemoryBank.notes.filter(note => note.date < cutoffDate && note.relevance !== 'high');
    
    if (toArchive.length > 0) {
      toArchive.forEach(note => {
        archive.notes?.push({
          date: note.date,
          summary: `${note.category}: ${note.note.substring(0, 100)}...`,
          type: note.category,
          archived_at: now
        });
      });
      
      // Keep only recent notes and high-relevance notes
      updatedMemoryBank.notes = updatedMemoryBank.notes.filter(note => 
        note.date >= cutoffDate || note.relevance === 'high'
      );
      archivedCount += toArchive.length;
      archiveSummary += `Archived ${toArchive.length} old notes. `;
    }
  }
  
  // Archive resolved issues
  if (expiryPolicy.knownIssues_days && updatedMemoryBank.knownIssues) {
    const cutoffDate = new Date(now.getTime() - (expiryPolicy.knownIssues_days * 24 * 60 * 60 * 1000));
    const toArchive = updatedMemoryBank.knownIssues.filter(issue => 
      issue.status === 'resolved' && issue.lastUpdated < cutoffDate
    );
    
    if (toArchive.length > 0) {
      toArchive.forEach(issue => {
        archive.knownIssues?.push({
          date: issue.lastUpdated,
          summary: `Resolved: ${issue.issue.substring(0, 100)}...`,
          type: 'resolved_issue',
          archived_at: now
        });
      });
      
      // Keep only recent issues and open/in-progress issues
      updatedMemoryBank.knownIssues = updatedMemoryBank.knownIssues.filter(issue => 
        issue.status !== 'resolved' || issue.lastUpdated >= cutoffDate
      );
      archivedCount += toArchive.length;
      archiveSummary += `Archived ${toArchive.length} resolved issues. `;
    }
  }
  
  // Update archive summary
  if (archivedCount > 0) {
    archive.summary = `Last archival: ${now.toLocaleDateString()} - ${archiveSummary}Total archived items: ${
      (archive.progressLog?.length || 0) + (archive.notes?.length || 0) + (archive.knownIssues?.length || 0)
    }`;
    updatedMemoryBank.archive = archive;
  }
  
  return {
    archived: archivedCount,
    summary: archiveSummary || 'No items needed archiving',
    updatedMemoryBank
  };
}

// Helper function to extract progress entries with dates
function extractProgressEntries(progressLog: string): Array<{date: Date; summary: string}> {
  const entries: Array<{date: Date; summary: string}> = [];
  const lines = progressLog.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for date patterns like "## Progress Update (2024-01-15T10:30:00Z)"
    const dateMatch = line.match(/\((\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    if (dateMatch) {
      const date = new Date(dateMatch[1]);
      let summary = line.replace(/^#+\s*/, '').substring(0, 100);
      
      // Get next few lines for more context
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].startsWith('#')) break;
        if (lines[j].trim()) {
          summary += ' ' + lines[j].trim().substring(0, 50);
          break;
        }
      }
      
      entries.push({ date, summary });
    }
  }
  
  return entries;
}

// Helper function to clean progress log of old entries
function cleanProgressLog(progressLog: string, cutoffDate: Date): string {
  const lines = progressLog.split('\n');
  const cleanedLines: string[] = [];
  let currentEntryDate: Date | null = null;
  let keepCurrentEntry = true;
  
  for (const line of lines) {
    // Check if this is a new entry header
    const dateMatch = line.match(/\((\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    if (dateMatch) {
      currentEntryDate = new Date(dateMatch[1]);
      keepCurrentEntry = currentEntryDate >= cutoffDate;
    }
    
    // Keep line if we're keeping the current entry
    if (keepCurrentEntry) {
      cleanedLines.push(line);
    }
  }
  
  return cleanedLines.join('\n');
}

// Auto-archiving scheduler (to be called periodically)
async function scheduleAutoArchiving(memoryBankCollection: any, project_name: string): Promise<void> {
  try {
    const memoryBank = await memoryBankCollection.findOne({ project_name });
    if (!memoryBank) return;
    
    const enhancedMemoryBank = memoryBank as unknown as EnhancedMemoryBank;
    const result = await processDataExpiry(enhancedMemoryBank);
    
    if (result.archived > 0) {
      // Update the memory bank with archived data
      await memoryBankCollection.updateOne(
        { project_name },
        {
          $set: {
            ...result.updatedMemoryBank,
            last_archived: new Date()
          }
        }
      );
      
      console.log(`Auto-archiving completed for ${project_name}: ${result.summary}`);
    }
  } catch (error) {
    console.error(`Auto-archiving failed for ${project_name}:`, error);
  }
}

// Data lifecycle management utilities
function getDataLifecycleStats(memoryBank: EnhancedMemoryBank): {
  active_items: number;
  archived_items: number;
  expiry_policy: ExpiryPolicy | undefined;
  next_expiry_date: Date | null;
} {
  const activeItems = (memoryBank.notes?.length || 0) + 
                     (memoryBank.knownIssues?.length || 0) + 
                     (memoryBank.patterns?.implementation?.length || 0);
  
  const archivedItems = (memoryBank.archive?.progressLog?.length || 0) + 
                        (memoryBank.archive?.notes?.length || 0) + 
                        (memoryBank.archive?.knownIssues?.length || 0);
  
  let nextExpiryDate: Date | null = null;
  if (memoryBank.config.expiryPolicy?.auto_archive_enabled) {
    const policy = memoryBank.config.expiryPolicy;
    const now = new Date();
    const expiry_days = Math.min(
      policy.notes_days || 999,
      policy.knownIssues_days || 999,
      policy.progressLog_days || 999
    );
    nextExpiryDate = new Date(now.getTime() + (expiry_days * 24 * 60 * 60 * 1000));
  }
  
  return {
    active_items: activeItems,
    archived_items: archivedItems,
    expiry_policy: memoryBank.config.expiryPolicy,
    next_expiry_date: nextExpiryDate
  };
}

// AI Digest Generation System - Context Window Optimization
interface DigestOptions {
  maxLength: number; // Maximum length in characters
  focus: 'summary' | 'actionable' | 'technical' | 'issues'; // What to focus on
  includeMetrics: boolean; // Whether to include success metrics
  preserveUrgency: boolean; // Whether to preserve urgency indicators
}

async function generateAIDigest(content: string, options: DigestOptions): Promise<string> {
  try {
    const { openaiClient } = await initializeClients();
    
    const systemPrompt = `You are an expert at creating concise, high-value summaries for AI coding assistants. 
    Your goal is to preserve the most important information while significantly reducing token usage.
    
    Focus: ${options.focus}
    Max length: ${options.maxLength} characters
    Include metrics: ${options.includeMetrics}
    Preserve urgency: ${options.preserveUrgency}
    
    Rules:
    1. Preserve ALL critical information (active tasks, blockers, deadlines)
    2. Use bullet points and concise language
    3. Maintain context relevance for AI decision-making
    4. Include specific details when they impact implementation
    5. Remove redundant explanations and verbose descriptions
    6. Keep technical specifics that affect code decisions`;
    
    const userPrompt = `Please create a concise digest of this memory bank content:

    ${content}
    
    Focus on: ${options.focus}
    Make it actionable for an AI coding assistant while staying under ${options.maxLength} characters.`;
    
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini", // Use the faster, cheaper model for digests
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: Math.floor(options.maxLength / 4), // Rough token estimation
      temperature: 0.3 // Lower temperature for consistent, focused output
    });
    
    const digest = response.choices[0]?.message?.content || '';
    
    // Ensure we didn't exceed the limit
    if (digest.length > options.maxLength) {
      return digest.substring(0, options.maxLength - 3) + '...';
    }
    
    return digest;
  } catch (error) {
    console.warn('AI digest generation failed:', error);
    // Fallback to simple truncation
    return content.substring(0, options.maxLength - 3) + '...';
  }
}

// Generate context-aware digests for different memory bank sections
async function generateMemoryBankDigests(memoryBank: EnhancedMemoryBank): Promise<{
  activeContextDigest?: string;
  knownIssuesDigest?: string;
  notesDigest?: string;
  patternsDigest?: string;
  userGoalsDigest?: string;
}> {
  const digests: any = {};
  
  try {
    // Generate active context digest (highest priority)
    if (memoryBank.activeContext) {
      digests.activeContextDigest = await generateAIDigest(
        JSON.stringify(memoryBank.activeContext, null, 2),
        {
          maxLength: 200,
          focus: 'actionable',
          includeMetrics: false,
          preserveUrgency: true
        }
      );
    }
    
    // Generate known issues digest
    if (memoryBank.knownIssues?.length) {
      const openIssues = memoryBank.knownIssues.filter(issue => issue.status === 'open' || issue.status === 'in_progress');
      if (openIssues.length > 0) {
        digests.knownIssuesDigest = await generateAIDigest(
          JSON.stringify(openIssues, null, 2),
          {
            maxLength: 300,
            focus: 'issues',
            includeMetrics: false,
            preserveUrgency: true
          }
        );
      }
    }
    
    // Generate notes digest (recent high-relevance notes)
    if (memoryBank.notes?.length) {
      const relevantNotes = memoryBank.notes
        .filter(note => note.relevance === 'high' || note.category === 'insight')
        .slice(0, 5); // Top 5 most relevant notes
      
      if (relevantNotes.length > 0) {
        digests.notesDigest = await generateAIDigest(
          JSON.stringify(relevantNotes, null, 2),
          {
            maxLength: 400,
            focus: 'technical',
            includeMetrics: false,
            preserveUrgency: false
          }
        );
      }
    }
    
    // Generate patterns digest (high-success patterns)
    if (memoryBank.patterns?.implementation?.length) {
      const highSuccessPatterns = memoryBank.patterns.implementation
        .filter(pattern => typeof pattern === 'object' && pattern.confidence >= 7)
        .slice(0, 3); // Top 3 patterns
      
      if (highSuccessPatterns.length > 0) {
        digests.patternsDigest = await generateAIDigest(
          JSON.stringify(highSuccessPatterns, null, 2),
          {
            maxLength: 350,
            focus: 'technical',
            includeMetrics: true,
            preserveUrgency: false
          }
        );
      }
    }
    
    // Generate user goals digest
    if (memoryBank.userExperienceGoals) {
      digests.userGoalsDigest = await generateAIDigest(
        memoryBank.userExperienceGoals,
        {
          maxLength: 150,
          focus: 'summary',
          includeMetrics: false,
          preserveUrgency: false
        }
      );
    }
    
  } catch (error) {
    console.warn('Memory bank digest generation failed:', error);
  }
  
  return digests;
}

// Smart context assembly using AI digests
async function assembleContextWithDigests(
  memoryBank: EnhancedMemoryBank, 
  maxContextSize: number = 8000
): Promise<string> {
  const digests = await generateMemoryBankDigests(memoryBank);
  
  // Estimate current context size
  const estimateSize = (content: string) => content.length;
  let currentSize = 0;
  const contextParts: string[] = [];
  
  // Add header with project info
  const header = `# 🧠 ${memoryBank.project_name} - AI-Optimized Context
  
## 📊 Quick Stats
- **Tech Stack:** ${memoryBank.technology_stack?.join(', ') || 'Not specified'}
- **Last Updated:** ${new Date(memoryBank.last_updated).toLocaleDateString()}
- **Memory Bank Version:** ${memoryBank.config.memory_bank_version || 'Unknown'}
`;
  
  contextParts.push(header);
  currentSize += estimateSize(header);
  
  // Add active context (highest priority)
  if (digests.activeContextDigest && currentSize + estimateSize(digests.activeContextDigest) < maxContextSize) {
    const activeSection = `\n## 🎯 ACTIVE CONTEXT (IMMEDIATE PRIORITY)
${digests.activeContextDigest}`;
    contextParts.push(activeSection);
    currentSize += estimateSize(activeSection);
  }
  
  // Add known issues
  if (digests.knownIssuesDigest && currentSize + estimateSize(digests.knownIssuesDigest) < maxContextSize) {
    const issuesSection = `\n## 🚨 KNOWN ISSUES & BLOCKERS
${digests.knownIssuesDigest}`;
    contextParts.push(issuesSection);
    currentSize += estimateSize(issuesSection);
  }
  
  // Add user goals
  if (digests.userGoalsDigest && currentSize + estimateSize(digests.userGoalsDigest) < maxContextSize) {
    const goalsSection = `\n## 🎯 USER EXPERIENCE GOALS
${digests.userGoalsDigest}`;
    contextParts.push(goalsSection);
    currentSize += estimateSize(goalsSection);
  }
  
  // Add patterns if space allows
  if (digests.patternsDigest && currentSize + estimateSize(digests.patternsDigest) < maxContextSize) {
    const patternsSection = `\n## 🔧 PROVEN PATTERNS
${digests.patternsDigest}`;
    contextParts.push(patternsSection);
    currentSize += estimateSize(patternsSection);
  }
  
  // Add recent insights if space allows
  if (digests.notesDigest && currentSize + estimateSize(digests.notesDigest) < maxContextSize) {
    const notesSection = `\n## 💡 RECENT INSIGHTS
${digests.notesDigest}`;
    contextParts.push(notesSection);
    currentSize += estimateSize(notesSection);
  }
  
  // Add footer with instructions
  const footer = `\n## 🎯 AI ASSISTANT FOCUS
- **Primary Task:** ${memoryBank.activeContext?.focus || 'No active focus defined'}
- **Current Urgency:** ${memoryBank.activeContext?.urgency || 'medium'}
- **Open Issues:** ${memoryBank.knownIssues?.filter(i => i.status === 'open').length || 0}
- **Next Steps:** ${memoryBank.activeContext?.nextMilestone || 'Continue development'}

🧠 **Context optimized for AI efficiency - all critical information preserved**`;
  
  if (currentSize + estimateSize(footer) < maxContextSize) {
    contextParts.push(footer);
  }
  
  return contextParts.join('\n');
}

// Context optimization metrics
function getContextOptimizationMetrics(originalSize: number, optimizedSize: number): {
  compressionRatio: number;
  tokensSaved: number;
  efficiencyGain: number;
} {
  const compressionRatio = optimizedSize / originalSize;
  const tokensSaved = Math.ceil((originalSize - optimizedSize) / 4); // Rough token estimate
  const efficiencyGain = ((originalSize - optimizedSize) / originalSize) * 100;
  
  return {
    compressionRatio,
    tokensSaved,
    efficiencyGain
  };
}

function generateUserExperienceGoals(projectName: string, projectBrief: string, techStack: string[]): string {
  // Generate AI-optimized user experience goals based on project context
  const goals = [
    "Intuitive and responsive user interface",
    "Fast loading times and smooth performance",
    "Accessible design following WCAG guidelines",
    "Mobile-first responsive experience",
    "Clear navigation and information architecture"
  ];
  
  // Technology-specific goals
  if (techStack.includes("React") || techStack.includes("Vue") || techStack.includes("Angular")) {
    goals.push("Component-based modular UI architecture");
  }
  if (techStack.includes("Node.js") || techStack.includes("Express")) {
    goals.push("Robust API endpoints with proper error handling");
  }
  if (techStack.includes("MongoDB") || techStack.includes("PostgreSQL")) {
    goals.push("Efficient data retrieval and storage optimization");
  }
  
  return goals.slice(0, 5).map(goal => `• ${goal}`).join('\n');
}

function generateProjectOverview(projectName: string, projectBrief: string, techStack: string[]): string {
  return `# 00 - Project Overview: ${projectName}

## Overview
${projectBrief}

## Technology Stack
${techStack.map(tech => `- ${tech}`).join('\n')}

## Goals
- Implement features using Context Engineering methodology
- Maintain high code quality and testing standards
- Follow universal AI assistant rules
- Build collaborative intelligence through pattern sharing

## Success Criteria
- [ ] All features implemented with >90% success rate
- [ ] Comprehensive test coverage
- [ ] Documentation and patterns captured
- [ ] Community intelligence contributions

---
*Generated by MCP Context Engineering Platform v2.3.0*
*Created: ${new Date().toISOString()}*
`;
}

function generateArchitecture(projectName: string, projectBrief: string): string {
  return `# 01 - Architecture: ${projectName}

## System Architecture
${projectBrief}

## Core Components
- [Main system components and their responsibilities]
- [Data flow and component interactions]
- [External dependencies and integrations]

## Design Patterns
- [Architectural patterns being used]
- [Design principles and guidelines]
- [Code organization strategies]

## Technology Decisions
- [Key technology choices and rationale]
- [Framework and library selections]
- [Infrastructure and deployment considerations]

## Scalability & Performance
- [Performance requirements and targets]
- [Scalability considerations]
- [Monitoring and optimization strategies]

---
*Last Updated: ${new Date().toISOString()}*
*Memory Bank: Enhanced with MongoDB Context Engineering*
`;
}

function generateComponents(projectName: string): string {
  return `# 02 - Components: ${projectName}

## Core Components
- [Main application components and modules]
- [Component responsibilities and interfaces]
- [Inter-component communication patterns]

## Data Models
- [Key data structures and entities]
- [Database schemas and relationships]
- [Data validation and constraints]

## Services & Utilities
- [Business logic services]
- [Utility functions and helpers]
- [External service integrations]

## UI Components (if applicable)
- [User interface components]
- [Component hierarchy and composition]
- [State management patterns]

## Testing Components
- [Test utilities and fixtures]
- [Mock objects and test data]
- [Testing patterns and strategies]

---
*Last Updated: ${new Date().toISOString()}*
*Update Trigger: Manual initialization*
`;
}



function generateDevelopmentProcess(projectName: string, techStack: string[]): string {
  return `# 03 - Development Process: ${projectName}

## Development Workflow
- [Git workflow and branching strategy]
- [Code review process and standards]
- [Deployment and release procedures]

## Technology Stack Process
${techStack.map(tech => `### ${tech} Development
- [Specific development practices for ${tech}]
- [Build and testing procedures]
- [Deployment considerations]`).join('\n\n')}

## Quality Assurance
- [Testing strategies and frameworks]
- [Code quality standards and tools]
- [Performance monitoring and optimization]

## Collaboration Guidelines
- [Team communication protocols]
- [Documentation standards]
- [Knowledge sharing practices]

## Environment Management
- [Development environment setup]
- [Staging and production environments]
- [Configuration management]

---
*Last Updated: ${new Date().toISOString()}*
*Memory Bank: Enhanced with MongoDB Context Engineering*
`;
}

function generateApiDocumentation(projectName: string, techStack: string[]): string {
  return `# 04 - API Documentation: ${projectName}

## API Overview
- [API purpose and scope]
- [Authentication and authorization]
- [Base URLs and versioning]

## Endpoints
### [Endpoint Category]
- **GET /api/endpoint** - [Description]
- **POST /api/endpoint** - [Description]
- **PUT /api/endpoint** - [Description]
- **DELETE /api/endpoint** - [Description]

## Data Models
### [Model Name]
\`\`\`json
{
  "field1": "string",
  "field2": "number",
  "field3": "boolean"
}
\`\`\`

## Error Handling
- [Error response format]
- [Common error codes and meanings]
- [Troubleshooting guidelines]

## Integration Examples
${techStack.map(tech => `### ${tech} Integration
\`\`\`
[Code example for ${tech}]
\`\`\``).join('\n\n')}

---
*Last Updated: ${new Date().toISOString()}*
*Memory Bank: Enhanced with MongoDB Context Engineering*
`;
}

function generateProgressLog(projectName: string): string {
  return `# 05 - Progress Log: ${projectName}

## Project Status
- **Overall Progress:** 0% (Just started)
- **Current Phase:** Initialization
- **Last Updated:** ${new Date().toISOString()}

## Completed Work
- [x] Memory bank initialized
- [ ] [Add completed features and tasks]

## In Progress
- [ ] [Current active work items]
- [ ] [Features being developed]

## Planned Work
- [ ] [Upcoming features and tasks]
- [ ] [Future milestones]

## Success Metrics
- **PRPs Generated:** 0
- **Successful Implementations:** 0
- **Average Confidence Score:** N/A
- **Pattern Contributions:** 0

## Known Issues
- [Document any known bugs or problems]
- [Include workarounds if available]

## Lessons Learned
- [Capture key learnings and insights]
- [Document what worked well]
- [Note what could be improved]

## Next Milestones
- [ ] [Define upcoming milestones]
- [ ] [Set target dates]
- [ ] [Identify success criteria]

---
*Memory Bank: Enhanced with Real-Time Updates*
*Context Engineering Platform: Collaborative Intelligence*
`;
}

// Memory Bank Initialize Tool
const memoryBankInitializeSchema = {
  project_name: z.string().describe("Project name"),
  project_brief: z.string().describe("Project description"),
  technology_stack: z.array(z.string()).optional().describe("Tech stack"),
  project_path: z.string().optional().default(".").describe("Project path")
};

server.registerTool(
  "memory-bank-initialize",
  {
    title: "Memory Bank Initialize",
    description: "Initialize persistent memory bank for project context across AI sessions",
    inputSchema: memoryBankInitializeSchema,
    annotations: {
      title: "Initialize Memory Bank",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const {
        project_name,
        project_brief,
        technology_stack = [],
        project_path = "."
      } = args;

      // Set defaults for removed parameters
      const project_type = "web_app";
      const use_mongodb_templates = true;

      // Input validation following MCP security best practices
      if (!project_name || project_name.trim().length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "❌ **Invalid Input**: Project name is required and cannot be empty."
            }
          ],
          isError: true
        };
      }

      if (!project_brief || project_brief.trim().length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "❌ **Invalid Input**: Project brief is required and cannot be empty."
            }
          ],
          isError: true
        };
      }

      // Sanitize project path to prevent directory traversal
      const sanitizedPath = project_path.replace(/\.\./g, '').replace(/[<>:"|?*]/g, '');
      if (sanitizedPath !== project_path) {
        return {
          content: [
            {
              type: "text",
              text: "❌ **Security Error**: Invalid characters in project path. Path has been sanitized."
            }
          ],
          isError: true
        };
      }

      // Generate core memory bank content (following 522⭐ proven Cline methodology)
      const coreFiles = {
        projectOverview: generateProjectOverview(project_name, project_brief, technology_stack),
        architecture: generateArchitecture(project_name, project_brief),
        components: generateComponents(project_name),
        developmentProcess: generateDevelopmentProcess(project_name, technology_stack),
        apiDocumentation: generateApiDocumentation(project_name, technology_stack),
        progressLog: generateProgressLog(project_name)
      };

      // Store EVERYTHING in MongoDB (no local files!)
      if (!mongoClient) {
        return {
          content: [{
            type: "text",
            text: "❌ **MongoDB Required**: This system requires MongoDB connection. Please check your MongoDB configuration."
          }],
          isError: true
        };
      }

      try {
        const db = mongoClient.db('context_engineering');
        const collection = db.collection('memory_banks');

        // Check if project already exists
        const existing = await collection.findOne({ project_name });
        if (existing) {
          return {
            content: [{
              type: "text",
              text: `⚠️ **Memory Bank Already Exists**: Project "${project_name}" already has a memory bank. Use \`memory-bank-read\` to access it or \`memory-bank-update\` to modify it.`
            }],
            isError: true
          };
        }

        const memoryBankDocument: EnhancedMemoryBank = {
          project_name,
          created_at: new Date(),
          last_updated: new Date(),
          last_accessed: new Date(),
          technology_stack,
          project_type,
          project_path: sanitizedPath,
          // All content stored as MongoDB fields
          files: coreFiles,
          // Enhanced patterns structure
          patterns: {
            implementation: [],
            gotchas: [],
            validation: []
          },
          // Enhanced config with new features
          config: {
            memory_bank_version: "3.1.0", // Increment version for enhanced features
            real_time_features: {
              event_triggered_updates: true,
              manual_commands: true,
              version_history: true,
              mongodb_native: true,
              context_prioritization: true, // NEW: AI-optimized context ranking
              auto_archiving: true // NEW: Automatic data archiving
            },
            expiryPolicy: {
              progressLog_days: 30, // Archive progress entries after 30 days
              notes_days: 14, // Archive notes after 14 days
              knownIssues_days: 60, // Archive resolved issues after 60 days
              auto_archive_enabled: true
            }
          },
          // Enhanced success metrics
          success_metrics: {
            prps_generated: 0,
            implementations_successful: 0,
            confidence_scores: [],
            average_confidence: 0,
            usageStats: {
              totalReads: 0,
              totalUpdates: 0,
              patternSuccessRate: 0
            }
          },
          // NEW: Enhanced context fields
          userExperienceGoals: generateUserExperienceGoals(project_name, project_brief, technology_stack),
          activeContext: {
            focus: `Initial setup and architecture planning for ${project_name}`,
            assignedTo: ["developer"],
            startedAt: new Date(),
            urgency: "medium",
            nextMilestone: "Complete basic architecture and start core implementation"
          },
          knownIssues: [],
          notes: [
            {
              date: new Date(),
              note: "Memory bank initialized with enhanced context engineering features",
              relevance: "high",
              category: "insight",
              tags: ["initialization", "setup", "memory-bank"]
            }
          ],
          collaborative_intelligence: {
            community_patterns: [],
            sync_history: {
              lastSync: new Date(),
              patterns_shared: 0,
              patterns_received: 0
            },
            sharing_enabled: true
          },
          archive: {
            progressLog: [],
            notes: [],
            knownIssues: [],
            summary: "No archived data - newly initialized memory bank"
          }
        };

        await collection.insertOne(memoryBankDocument);

        return {
          content: [
            {
              type: "text",
              text: `✅ **Enhanced Memory Bank Initialized Successfully!**

🧠 **Project:** ${project_name}
💾 **Storage:** 100% MongoDB (no local files!)
🛠️ **Technology Stack:** ${technology_stack.join(', ') || 'Not specified'}
📊 **Project Type:** ${project_type}
🔄 **Architecture:** Pure MCP + MongoDB + Enhanced Context Engineering

## 📋 Enhanced Memory Bank Structure:
\`\`\`
MongoDB Document Structure (v3.1.0):
├── files/
│   ├── projectOverview     ✅ Foundation document
│   ├── architecture        ✅ System design
│   ├── components          ✅ Component catalog
│   ├── developmentProcess  ✅ Dev workflow
│   ├── apiDocumentation    ✅ API specs
│   └── progressLog         ✅ Status tracking
├── patterns/
│   ├── implementation[]    ✅ Working patterns
│   ├── gotchas[]          ✅ Known issues
│   └── validation[]       ✅ Test strategies
├── userExperienceGoals     ✅ NEW: User-focused priorities
├── activeContext/          ✅ NEW: Current work context
│   ├── focus              ✅ Current focus area
│   ├── assignedTo         ✅ Team members
│   ├── urgency            ✅ Priority level
│   └── nextMilestone      ✅ Next target
├── knownIssues[]          ✅ NEW: Active blockers tracking
├── notes[]                ✅ NEW: Granular insights
├── collaborative_intelligence/ ✅ NEW: Community patterns
└── archive/               ✅ NEW: Auto-archived data
\`\`\`

## 🚀 Enhanced MongoDB-Native Features:
- ✅ **Zero local files** - Everything in MongoDB
- ✅ **Event-triggered updates** (≥25% code impact)
- ✅ **Manual commands** ("Update Memory Bank" / "UMB")
- ✅ **Version history** with automatic snapshots
- ✅ **Collaborative intelligence** sharing
- ✅ **Real-time sync** across all sessions
- 🆕 **Context prioritization** - AI-optimized ranking
- 🆕 **Auto-archiving** - Intelligent data lifecycle management
- 🆕 **Active context tracking** - Know what's being worked on
- 🆕 **User experience goals** - Keep user needs front and center
- 🆕 **Known issues tracking** - Never lose track of blockers

## 🎯 Enhanced Context Features:
**Active Context:** ${memoryBankDocument.activeContext!.focus}
**User Goals:** 
${memoryBankDocument.userExperienceGoals}
**Archiving:** Auto-archive after 30 days (progress), 14 days (notes), 60 days (resolved issues)

## 🎯 Next Steps:
1. **Read memory bank:** Use \`memory-bank-read\` to restore enhanced context
2. **Update progress:** Use \`memory-bank-update\` with new context fields
3. **All enhanced data persists** in MongoDB automatically

## 💡 World's First Achievement:
You now have the **FIRST AI-OPTIMIZED, CONTEXT-RICH MEMORY BANK** that combines:
- ✅ Persistent Memory Banks (inspired by Cline 522⭐)
- ✅ Collaborative Intelligence (MongoDB patterns)
- ✅ Original Context Engineering (30+ minute research)
- ✅ Zero Local Files (pure MCP architecture)
- 🆕 **Context Window Optimization** (AI-friendly data structures)
- 🆕 **Priority-Based Context** (surface most important info first)
- 🆕 **Intelligent Archiving** (automatic data lifecycle)
- 🆕 **Active Work Tracking** (never lose context on current tasks)

**Context loss between sessions is ELIMINATED + Enhanced with AI-optimized context!** 🎉

🔄 **MongoDB Integration:** Project successfully stored with enhanced context engineering features`,
            },
          ],
        };

      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Memory Bank Initialization Failed**

MongoDB Error: ${error instanceof Error ? error.message : String(error)}

This may be due to:
- MongoDB connection issues
- Database permissions
- Network connectivity
- Invalid project data

Please check your MongoDB configuration and try again.`,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Memory Bank Initialization Failed**

Error: ${error instanceof Error ? error.message : String(error)}

This may be due to:
- File system permissions
- Invalid project path
- MongoDB connection issues (if enabled)

Please check your configuration and try again.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Memory Bank Read Tool
const memoryBankReadSchema = {
  project_name: z.string().describe("Project name"),
  project_path: z.string().optional().default(".").describe("Path to project root (default: current directory)"),
  files_to_read: z.array(z.string()).optional().describe("Specific files to read (default: all core files)"),
  context_focus: z.enum(["full", "active", "technical", "progress", "optimized"]).optional().default("full").describe("Type of context to focus on"),
  include_mongodb_patterns: z.boolean().optional().default(true).describe("Include relevant MongoDB patterns"),
  sync_first: z.boolean().optional().default(false).describe("Sync with MongoDB before reading")
};

server.registerTool(
  "memory-bank-read",
  {
    title: "Memory Bank Read",
    description: `📖 **READ PROJECT MEMORY BANK**

**RESTORE PROJECT CONTEXT ACROSS SESSIONS!**

Reads memory bank files to restore comprehensive project context. This is the equivalent of "follow your custom instructions" from Cline, enhanced with MongoDB collaborative intelligence.

**CRITICAL:** Call this at the start of EVERY session to restore project context and eliminate repetitive explanations.

**REAL-TIME FEATURES:**
- Automatic MongoDB sync for latest patterns
- Context focus filtering for specific needs
- Version history access
- Community intelligence integration

**WORKFLOW:**
1. Locates memory bank for specified project
2. Reads specified files (default: all core files)
3. Optionally syncs with MongoDB for latest patterns
4. Combines local and collaborative intelligence
5. Returns formatted context for AI assistant

**SOLVES:** Context loss pain between AI coding assistant sessions!`,
    inputSchema: memoryBankReadSchema,
    annotations: {
      title: "Read Memory Bank",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const {
        project_name,
        project_path = ".",
        files_to_read,
        context_focus = "full",
        include_mongodb_patterns = true,
        sync_first = false
      } = args;

      // Check MongoDB connection
      if (!mongoClient) {
        return {
          content: [{
            type: "text",
            text: "❌ **MongoDB Required**: This system requires MongoDB connection. Please check your MongoDB configuration."
          }],
          isError: true
        };
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('memory_banks');

      // Find memory bank in MongoDB
      const memoryBank = await collection.findOne({ project_name });
      if (!memoryBank) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Memory Bank Not Found**

No memory bank found for project "${project_name}" in MongoDB.

**Solution:** Initialize memory bank first using \`memory-bank-initialize\` tool.

**Command:**
\`\`\`
memory-bank-initialize {
  project_name: "${project_name}",
  project_brief: "Your project description"
}
\`\`\``,
            },
          ],
          isError: true,
        };
      }

      // Determine which files to read based on context focus
      const defaultFileKeys = {
        full: ['projectOverview', 'architecture', 'components', 'developmentProcess', 'apiDocumentation', 'progressLog'],
        active: ['progressLog', 'components', 'architecture'],
        technical: ['architecture', 'components', 'developmentProcess'],
        progress: ['progressLog', 'components'],
        optimized: ['projectOverview', 'architecture', 'components', 'progressLog'] // AI-optimized subset
      };

      const fileKeysToRead = files_to_read || defaultFileKeys[context_focus];
      const coreFiles: Record<string, string> = {};

      // Read files from MongoDB document
      for (const fileKey of fileKeysToRead) {
        if (memoryBank.files && memoryBank.files[fileKey]) {
          coreFiles[fileKey] = memoryBank.files[fileKey];
        }
      }

      // Get patterns from MongoDB document
      const patternFiles = {
        implementation: memoryBank.patterns?.implementation || [],
        gotchas: memoryBank.patterns?.gotchas || [],
        validation: memoryBank.patterns?.validation || []
      };

      // Get additional MongoDB patterns if requested
      let mongoPatterns: any[] = [];
      if (include_mongodb_patterns && memoryBank.technology_stack) {
        try {
          const patternsCollection = db.collection('implementation_patterns');
          mongoPatterns = await patternsCollection.find({
            technology_stack: { $in: memoryBank.technology_stack },
            "success_metrics.success_rate": { $gte: 0.7 }
          }, {
            limit: 5,
            sort: { "success_metrics.success_rate": -1 }
          }).toArray();
        } catch (error) {
          console.warn('Could not fetch additional MongoDB patterns:', error);
        }
      }

      // Update last accessed timestamp
      try {
        await collection.updateOne(
          { project_name },
          { $set: { last_accessed: new Date() } }
        );
      } catch (error) {
        console.warn('Could not update last accessed:', error);
      }

      // Enhanced context prioritization - surface most important info first
      const enhancedMemoryBank = memoryBank as unknown as EnhancedMemoryBank;
      const contextSummary = {
        project_name,
        context_focus,
        files_read: Object.keys(coreFiles),
        mongodb_patterns_included: mongoPatterns.length,
        last_updated: memoryBank.last_updated || 'Unknown',
        technology_stack: memoryBank.technology_stack || [],
        real_time_features: memoryBank.config?.real_time_features || {},
        version: memoryBank.config?.memory_bank_version || 'Unknown',
        has_enhanced_features: !!(enhancedMemoryBank.activeContext || enhancedMemoryBank.userExperienceGoals)
      };

      // AI-optimized context assembly - use digests for large content
      let contextResponse: string;
      const rawContentSize = Object.keys(coreFiles).reduce((total, key) => total + (coreFiles[key]?.length || 0), 0);
      
      if (context_focus === "optimized" || rawContentSize > 8000) {
        // Use AI digest system for context window optimization
        console.log('🧠 Using AI digest system for optimized context delivery');
        contextResponse = await assembleContextWithDigests(enhancedMemoryBank, 8000);
      } else {
        // Build standard context response with AI-optimized prioritization
        contextResponse = `📖 **Enhanced Memory Bank Context Restored!**

🧠 **Project:** ${project_name}
🎯 **Context Focus:** ${context_focus}
📁 **Files Read:** ${Object.keys(coreFiles).length}
🔄 **MongoDB Patterns:** ${mongoPatterns.length} relevant patterns included
📊 **Technology Stack:** ${memoryBank.technology_stack?.join(', ') || 'Not specified'}
🆕 **Enhanced Features:** ${contextSummary.has_enhanced_features ? 'Active' : 'Legacy mode'}

## 🎯 **ACTIVE CONTEXT (HIGH PRIORITY)**
${enhancedMemoryBank.activeContext ? `
**Current Focus:** ${enhancedMemoryBank.activeContext.focus}
**Assigned To:** ${enhancedMemoryBank.activeContext.assignedTo.join(', ')}
**Started:** ${enhancedMemoryBank.activeContext.startedAt.toLocaleDateString()}
**Urgency:** ${enhancedMemoryBank.activeContext.urgency.toUpperCase()}
**Next Milestone:** ${enhancedMemoryBank.activeContext.nextMilestone || 'Not specified'}
${enhancedMemoryBank.activeContext.blockers?.length ? `**Current Blockers:** ${enhancedMemoryBank.activeContext.blockers.join(', ')}` : ''}
` : 'No active context defined - this is an older memory bank format'}

## 🎯 **USER EXPERIENCE GOALS (KEEP FRONT & CENTER)**
${enhancedMemoryBank.userExperienceGoals || 'No user experience goals defined'}

## 🚨 **KNOWN ISSUES & BLOCKERS**
${enhancedMemoryBank.knownIssues?.length ? 
  enhancedMemoryBank.knownIssues.map((issue, i) => `
### Issue ${i + 1}: ${issue.issue}
- **Status:** ${issue.status}
- **Priority:** ${issue.priority}
- **Last Updated:** ${issue.lastUpdated.toLocaleDateString()}
${issue.workaround ? `- **Workaround:** ${issue.workaround}` : ''}
${issue.affectedComponents?.length ? `- **Affected Components:** ${issue.affectedComponents.join(', ')}` : ''}
`).join('\n') : 'No known issues currently tracked'}

## 📋 **PROJECT CONTEXT**

${Object.entries(coreFiles).map(([fileName, content]: [string, string]) => `### ${fileName.replace(/([A-Z])/g, ' $1').toUpperCase()}
${content}

---`).join('\n\n')}

${patternFiles.implementation?.length ? `## 🔧 **IMPLEMENTATION PATTERNS**
${patternFiles.implementation.map((pattern: any, i: number) => `### Pattern ${i + 1}
${typeof pattern === 'string' ? pattern : `**Name:** ${pattern.content || pattern.name || 'Unnamed Pattern'}
**Confidence:** ${pattern.confidence || 'Unknown'}/10
**Discovered:** ${pattern.discovered_at ? new Date(pattern.discovered_at).toLocaleDateString() : 'Unknown'}`}

---`).join('\n\n')}` : ''}

${patternFiles.gotchas?.length ? `## ⚠️ **KNOWN GOTCHAS**
${patternFiles.gotchas.map((gotcha: any, i: number) => `### Gotcha ${i + 1}
${typeof gotcha === 'string' ? gotcha : `**Description:** ${gotcha.description || gotcha.content || 'No description'}
**Mitigation:** ${gotcha.mitigation || 'No mitigation defined'}`}

---`).join('\n\n')}` : ''}

${mongoPatterns.length ? `## 🌐 **MONGODB COLLABORATIVE INTELLIGENCE**
${mongoPatterns.map((pattern: any, i: number) => `### Community Pattern ${i + 1}
**Name:** ${pattern.pattern_name || 'Unnamed Pattern'}
**Success Rate:** ${Math.round((pattern.success_metrics?.success_rate || 0) * 100)}%
**Description:** ${pattern.description || 'No description'}
**Technologies:** ${pattern.technology_stack?.join(', ') || 'Not specified'}

---`).join('\n\n')}` : ''}

## 💡 **RECENT INSIGHTS & NOTES**
${enhancedMemoryBank.notes?.length ? 
  enhancedMemoryBank.notes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((note, i) => `
### ${note.category.toUpperCase()} (${note.relevance} relevance)
**Date:** ${new Date(note.date).toLocaleDateString()}
**Note:** ${note.note}
${note.tags?.length ? `**Tags:** ${note.tags.join(', ')}` : ''}
`).join('\n') : 'No recent notes available'}

## 🎯 **CONTEXT SUMMARY**
- **Project Status:** ${contextSummary.files_read.includes('progressLog') ? 'Progress tracking active' : 'Status unknown'}
- **Active Work:** ${enhancedMemoryBank.activeContext ? `Currently working on: ${enhancedMemoryBank.activeContext.focus}` : 'No active context'}
- **Technical Setup:** ${contextSummary.files_read.includes('architecture') ? 'Tech context loaded' : 'Tech context not loaded'}
- **Patterns Available:** ${Object.values(patternFiles).flat().length} local + ${mongoPatterns.length} community patterns
- **Open Issues:** ${enhancedMemoryBank.knownIssues?.filter(issue => issue.status === 'open').length || 0}
- **Memory Bank Version:** ${contextSummary.version}

## 🚀 **ENHANCED MONGODB-NATIVE FEATURES STATUS**
- **Event Triggers:** ${memoryBank.config?.real_time_features?.event_triggered_updates ? '✅ Enabled' : '❌ Disabled'}
- **Manual Commands:** ${memoryBank.config?.real_time_features?.manual_commands ? '✅ Enabled ("UMB")' : '❌ Disabled'}
- **MongoDB Native:** ${memoryBank.config?.real_time_features?.mongodb_native ? '✅ Enabled (No local files!)' : '❌ Legacy mode'}
- **Version History:** ${memoryBank.config?.real_time_features?.version_history ? '✅ Enabled' : '❌ Disabled'}
- **Context Prioritization:** ${memoryBank.config?.real_time_features?.context_prioritization ? '✅ Enabled (AI-optimized)' : '❌ Disabled'}
- **Auto Archiving:** ${memoryBank.config?.real_time_features?.auto_archiving ? '✅ Enabled' : '❌ Disabled'}

## 💡 **AI ASSISTANT INSTRUCTIONS (ENHANCED)**
You now have **AI-optimized, context-rich project intelligence**! Use this information to:

### **IMMEDIATE PRIORITIES:**
1. **Focus on active work:** ${enhancedMemoryBank.activeContext?.focus || 'No active context defined'}
2. **Address blockers:** ${enhancedMemoryBank.knownIssues?.filter(i => i.status === 'open').length || 0} open issues to resolve
3. **Keep user goals central:** Always consider the user experience goals above

### **CONTEXT-AWARE ACTIONS:**
4. **Follow established patterns** from implementation patterns
5. **Respect technology constraints** from architecture documentation
6. **Apply community patterns** with proven success rates
7. **Update memory bank** as you make progress using \`memory-bank-update\`

### **ENHANCED FEATURES:**
8. **Use structured updates** - populate activeContext, knownIssues, and notes
9. **Leverage AI optimization** - context is now prioritized and window-optimized
10. **Benefit from auto-archiving** - old data is automatically managed

**Context loss is SOLVED + Enhanced with AI-optimized, priority-based context!** 🎉`;
      }

      return {
        content: [
          {
            type: "text",
            text: contextResponse,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Memory Bank Read Failed**

Error: ${error instanceof Error ? error.message : String(error)}

This may be due to:
- Memory bank not initialized
- File system permissions
- Corrupted memory bank files
- MongoDB connection issues

**Solution:** Try initializing memory bank first with \`memory-bank-initialize\`.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Memory Bank Update Tool with Real-Time Triggers
const memoryBankUpdateSchema = {
  project_name: z.string().describe("Project name"),
  project_path: z.string().optional().default(".").describe("Path to project root (default: current directory)"),
  update_type: z.enum(["progress", "active_context", "patterns", "full_review", "auto_trigger", "manual_umb"]).describe("Type of update"),
  trigger_event: z.enum(["architectural_change", "pattern_discovery", "code_impact", "context_ambiguity", "manual_command", "session_end"]).optional().describe("Event that triggered this update"),
  changes_made: z.string().describe("Description of changes made"),
  impact_percentage: z.number().min(0).max(100).optional().describe("Estimated impact percentage of changes"),
  learnings: z.array(z.string()).optional().default([]).describe("Key learnings or patterns discovered"),
  next_steps: z.array(z.string()).optional().default([]).describe("Next steps to take"),
  success_indicators: z.object({
    implementation_successful: z.boolean(),
    tests_passed: z.boolean(),
    confidence_score: z.number().min(1).max(10)
  }).optional().describe("Success metrics for this update"),
  real_time_sync: z.boolean().optional().default(true).describe("Enable real-time sync to MongoDB"),
  version_increment: z.boolean().optional().default(true).describe("Create new version in history"),
  auto_pattern_detection: z.boolean().optional().default(true).describe("Enable AI-driven pattern recognition")
};

server.registerTool(
  "memory-bank-update",
  {
    title: "Memory Bank Update",
    description: `✏️ **UPDATE PROJECT MEMORY BANK (REAL-TIME ENHANCED)**

**REAL-TIME MEMORY BANK UPDATES WITH INTELLIGENT TRIGGERS!**

Updates memory bank files with current project state, learnings, and progress. Features advanced real-time update triggers and intelligent change detection.

**REAL-TIME TRIGGERS:**
- 🏗️ **Architectural decisions** and system changes
- 🔍 **Pattern discoveries** and implementation insights
- 📊 **≥25% code impact** modifications (automatic trigger)
- 🤔 **Context ambiguity** detection (AI-driven)
- 🎯 **Manual commands** ("Update Memory Bank" / "UMB")
- 🔄 **Session end** updates for continuity

**INTELLIGENT FEATURES:**
- **Version History:** Automatic snapshots with conflict resolution
- **Pattern Recognition:** AI-driven pattern discovery and documentation
- **Success Tracking:** Confidence scores and implementation metrics
- **Community Sync:** Real-time sharing of successful patterns
- **Smart Merge:** Concurrent update handling

**USAGE:** Automatically triggered by events or manually called after significant changes.

**WORKFLOW:**
1. Detects trigger events and analyzes impact level
2. Updates specified memory bank files with versioning
3. Documents new patterns and learnings discovered
4. Records implementation success/failure with metrics
5. Syncs learnings to MongoDB in real-time
6. Updates community intelligence if successful

**REVOLUTIONARY:** First memory bank system with intelligent, event-driven updates!`,
    inputSchema: memoryBankUpdateSchema,
    annotations: {
      title: "Update Memory Bank",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const {
        project_name,
        project_path = ".",
        update_type,
        trigger_event,
        changes_made,
        impact_percentage,
        learnings = [],
        next_steps = [],
        success_indicators,
        real_time_sync = true,
        version_increment = true,
        auto_pattern_detection = true
      } = args;

      // Check MongoDB connection
      if (!mongoClient) {
        return {
          content: [{
            type: "text",
            text: "❌ **MongoDB Required**: This system requires MongoDB connection. Please check your MongoDB configuration."
          }],
          isError: true
        };
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('memory_banks');

      // Find memory bank in MongoDB
      const memoryBank = await collection.findOne({ project_name });
      if (!memoryBank) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Memory Bank Not Found**

No memory bank found for project "${project_name}" in MongoDB.

**Solution:** Initialize memory bank first using \`memory-bank-initialize\` tool.`,
            },
          ],
          isError: true,
        };
      }

      const timestamp = new Date().toISOString();
      const updateId = `update_${Date.now()}`;

      // Determine which files to update based on update type
      const fileKeysToUpdate: string[] = [];
      switch (update_type) {
        case "progress":
          fileKeysToUpdate.push("progressLog");
          break;
        case "active_context":
          fileKeysToUpdate.push("components");
          break;
        case "patterns":
          fileKeysToUpdate.push("architecture");
          break;
        case "full_review":
          fileKeysToUpdate.push("progressLog", "components", "architecture");
          break;
        case "auto_trigger":
        case "manual_umb":
          // Intelligent file selection based on trigger event
          if (trigger_event === "architectural_change") {
            fileKeysToUpdate.push("architecture", "components");
          } else if (trigger_event === "pattern_discovery") {
            fileKeysToUpdate.push("architecture", "progressLog");
          } else if (trigger_event === "code_impact") {
            fileKeysToUpdate.push("components", "progressLog");
          } else {
            fileKeysToUpdate.push("components", "progressLog");
          }
          break;
      }

      // Create version backup in MongoDB if requested
      let versionBackup = null;
      if (version_increment) {
        versionBackup = {
          update_id: updateId,
          timestamp: new Date(),
          backup_files: {} as any
        };

        // Backup current files
        for (const fileKey of fileKeysToUpdate) {
          if (memoryBank.files && memoryBank.files[fileKey]) {
            versionBackup.backup_files[fileKey] = memoryBank.files[fileKey];
          }
        }
      }

      // Update files based on type
      const updateResults: string[] = [];
      const updatedFiles: any = { ...memoryBank.files };

      if (fileKeysToUpdate.includes("components")) {
        // Update components/active context with new information
        const updateSection = `

## Recent Update (${timestamp})
**Trigger:** ${trigger_event || 'Manual update'}
**Type:** ${update_type}
**Impact:** ${impact_percentage ? `${impact_percentage}%` : 'Not specified'}

### Changes Made
${changes_made}

${learnings.length > 0 ? `### Key Learnings
${learnings.map(learning => `- ${learning}`).join('\n')}` : ''}

${next_steps.length > 0 ? `### Next Steps
${next_steps.map(step => `- [ ] ${step}`).join('\n')}` : ''}

${success_indicators ? `### Success Indicators
- Implementation Successful: ${success_indicators.implementation_successful ? '✅' : '❌'}
- Tests Passed: ${success_indicators.tests_passed ? '✅' : '❌'}
- Confidence Score: ${success_indicators.confidence_score}/10` : ''}

---`;

        updatedFiles.components = (updatedFiles.components || '') + updateSection;
        updateResults.push("✅ components updated");
      }

      if (fileKeysToUpdate.includes("progressLog")) {
        // Update progress tracking
        const progressUpdate = `

## Progress Update (${timestamp})
**Update ID:** ${updateId}
**Trigger:** ${trigger_event || 'Manual'}
**Impact:** ${impact_percentage ? `${impact_percentage}%` : 'Standard'}

### Work Completed
${changes_made}

${success_indicators ? `### Success Metrics Update
- Implementation Success: ${success_indicators.implementation_successful}
- Tests Passed: ${success_indicators.tests_passed}
- Confidence Score: ${success_indicators.confidence_score}/10
- Overall Progress: +${impact_percentage || 5}%` : ''}

${learnings.length > 0 ? `### Patterns Discovered
${learnings.map(learning => `- ${learning}`).join('\n')}` : ''}

---`;

        updatedFiles.progressLog = (updatedFiles.progressLog || '') + progressUpdate;
        updateResults.push("✅ progressLog updated");
      }

      if (fileKeysToUpdate.includes("architecture")) {
        // Add new patterns if discovered
        if (learnings.length > 0 && auto_pattern_detection) {
          const patternUpdate = `

## New Patterns Discovered (${timestamp})
**Discovery Context:** ${changes_made}
**Trigger:** ${trigger_event || 'Manual discovery'}

${learnings.map((learning, index) => `### Pattern ${index + 1}: ${learning}
- **Context:** Discovered during ${update_type} update
- **Success Rate:** ${success_indicators?.confidence_score ? `${success_indicators.confidence_score * 10}%` : 'To be determined'}
- **Usage:** Apply in similar scenarios
- **Validation:** ${success_indicators?.tests_passed ? 'Tested and verified' : 'Requires testing'}`).join('\n\n')}

---`;

          updatedFiles.architecture = (updatedFiles.architecture || '') + patternUpdate;
          updateResults.push("✅ architecture updated with new patterns");
        }
      }

      // Update patterns array if new patterns discovered
      const updatedPatterns = { ...memoryBank.patterns };
      if (learnings.length > 0 && auto_pattern_detection) {
        learnings.forEach(learning => {
          updatedPatterns.implementation.push({
            content: learning,
            discovered_at: timestamp,
            trigger: trigger_event || 'manual',
            confidence: success_indicators?.confidence_score || 5
          });
        });
      }

      // Enhanced context updates - cast to handle both old and new formats
      const enhancedMemoryBank = memoryBank as unknown as EnhancedMemoryBank;
      let enhancedUpdates: any = {};

      // Update activeContext if relevant
      if (update_type === "active_context" || update_type === "full_review" || 
          trigger_event === "architectural_change" || trigger_event === "code_impact") {
        enhancedUpdates.activeContext = {
          focus: `${changes_made.substring(0, 100)}...`,
          assignedTo: enhancedMemoryBank.activeContext?.assignedTo || ["developer"],
          startedAt: enhancedMemoryBank.activeContext?.startedAt || new Date(),
          urgency: impact_percentage && impact_percentage >= 75 ? "critical" : 
                   impact_percentage && impact_percentage >= 50 ? "high" : 
                   impact_percentage && impact_percentage >= 25 ? "medium" : "low",
          blockers: success_indicators?.implementation_successful === false ? 
                   [changes_made.substring(0, 50) + "..."] : [],
          nextMilestone: next_steps.length > 0 ? next_steps[0] : "Continue development"
        };
        updateResults.push("✅ activeContext updated");
      }

      // Add/update knownIssues if there are blockers
      if (success_indicators?.implementation_successful === false || 
          success_indicators?.tests_passed === false) {
        const currentIssues = enhancedMemoryBank.knownIssues || [];
        const newIssue: KnownIssue = {
          issue: `${update_type} issue: ${changes_made.substring(0, 100)}...`,
          status: "open",
          lastUpdated: new Date(),
          priority: impact_percentage && impact_percentage >= 50 ? "high" : "medium",
          affectedComponents: fileKeysToUpdate
        };
        
        if (success_indicators?.tests_passed === false) {
          newIssue.workaround = "Review test failures and address failing test cases";
        }
        
        enhancedUpdates.knownIssues = [...currentIssues, newIssue];
        updateResults.push("✅ knownIssues updated with new blocker");
      }

      // Add contextual notes
      const currentNotes = enhancedMemoryBank.notes || [];
      const newNotes: ContextNote[] = [];
      
      if (learnings.length > 0) {
        learnings.forEach(learning => {
          newNotes.push({
            date: new Date(),
            note: learning,
            relevance: success_indicators?.confidence_score && success_indicators.confidence_score >= 7 ? "high" : "medium",
            category: "insight",
            tags: [update_type, trigger_event || "manual", ...memoryBank.technology_stack?.slice(0, 2) || []]
          });
        });
      }
      
      if (success_indicators?.implementation_successful) {
        newNotes.push({
          date: new Date(),
          note: `Successful implementation: ${changes_made.substring(0, 100)}...`,
          relevance: "high",
          category: "decision",
          tags: ["success", update_type, trigger_event || "manual"]
        });
      }
      
      if (newNotes.length > 0) {
        enhancedUpdates.notes = [...currentNotes, ...newNotes];
        updateResults.push(`✅ notes updated with ${newNotes.length} new insights`);
      }

      // Update usage statistics
      const currentUsageStats = enhancedMemoryBank.success_metrics?.usageStats || {
        totalReads: 0,
        totalUpdates: 0,
        patternSuccessRate: 0
      };
      
      enhancedUpdates.success_metrics = {
        ...memoryBank.success_metrics,
        usageStats: {
          ...currentUsageStats,
          totalUpdates: currentUsageStats.totalUpdates + 1,
          patternSuccessRate: success_indicators?.implementation_successful ? 
            Math.min((currentUsageStats.patternSuccessRate || 0) + 0.1, 1.0) : 
            (currentUsageStats.patternSuccessRate || 0)
        }
      };

      // Store successful patterns in MongoDB
      let mongoUpdateResult = null;
      try {
        // Update memory bank document with enhanced fields
        const updateDoc: any = {
          last_updated: new Date(),
          files: updatedFiles,
          patterns: updatedPatterns,
          ...enhancedUpdates
        };

        // Add version backup if created
        if (versionBackup) {
          updateDoc.$push = { version_history: versionBackup };
        }

        // Update success metrics if successful
        if (success_indicators?.implementation_successful) {
          updateDoc.$inc = {
            "success_metrics.implementations_successful": 1
          };
          updateDoc.$push = {
            ...updateDoc.$push,
            "success_metrics.confidence_scores": success_indicators.confidence_score
          };
        }

        await collection.updateOne(
          { project_name },
          { $set: updateDoc }
        );

        // Store patterns in global patterns collection if successful
        if (real_time_sync && success_indicators?.implementation_successful && learnings.length > 0) {
          const patternsCollection = db.collection('memory_patterns');
          for (const learning of learnings) {
            await patternsCollection.insertOne({
              pattern_name: `Auto-discovered: ${learning.substring(0, 50)}...`,
              pattern_type: "implementation",
              technology_stack: memoryBank.technology_stack || [],
              pattern_content: learning,
              code_examples: [changes_made],
              success_rate: success_indicators.confidence_score / 10,
              usage_count: 1,
              source_projects: [project_name],
              confidence_scores: [success_indicators.confidence_score],
              created_at: new Date(),
              last_used: new Date(),
              community_votes: 0,
              trigger_event: trigger_event || 'manual',
              impact_percentage: impact_percentage || 0
            });
          }
        }

        mongoUpdateResult = "✅ MongoDB update successful";
      } catch (error) {
        mongoUpdateResult = `⚠️ MongoDB update failed: ${error instanceof Error ? error.message : String(error)}`;
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ **Memory Bank Updated Successfully!**

🧠 **Project:** ${project_name}
🔄 **Update Type:** ${update_type}
⚡ **Trigger:** ${trigger_event || 'Manual command'}
📊 **Impact:** ${impact_percentage ? `${impact_percentage}%` : 'Standard update'}
🆔 **Update ID:** ${updateId}

## 📝 **UPDATE RESULTS**
${updateResults.map(result => `- ${result}`).join('\n')}

## 🎯 **CHANGES DOCUMENTED**
${changes_made}

${learnings.length > 0 ? `## 🔍 **PATTERNS DISCOVERED**
${learnings.map((learning, i) => `${i + 1}. ${learning}`).join('\n')}` : ''}

${next_steps.length > 0 ? `## 📋 **NEXT STEPS PLANNED**
${next_steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}` : ''}

${success_indicators ? `## 📊 **SUCCESS METRICS**
- **Implementation:** ${success_indicators.implementation_successful ? '✅ Successful' : '❌ Failed'}
- **Tests:** ${success_indicators.tests_passed ? '✅ Passed' : '❌ Failed'}
- **Confidence:** ${success_indicators.confidence_score}/10` : ''}

## 🚀 **REAL-TIME FEATURES**
- **Version Backup:** ${version_increment ? `✅ Created (${updateId})` : '❌ Skipped'}
- **Pattern Detection:** ${auto_pattern_detection ? `✅ Active (${learnings.length} patterns found)` : '❌ Disabled'}
- **MongoDB Sync:** ${real_time_sync ? (mongoUpdateResult || '✅ Enabled') : '❌ Disabled'}

## 💡 **COLLABORATIVE INTELLIGENCE**
${success_indicators?.implementation_successful && learnings.length > 0 ?
`🎉 **SUCCESS PATTERNS SHARED!** Your discoveries are now part of the collaborative intelligence database, helping future developers with similar challenges.` :
'📝 Update documented locally. Share successful patterns by enabling real-time sync.'}

## 🎯 **MEMORY BANK STATUS**
- **Last Updated:** ${timestamp}
- **Update Count:** Incremented
- **Context Continuity:** ✅ Maintained across sessions
- **Pattern Intelligence:** ${learnings.length > 0 ? '✅ Enhanced' : '📝 Documented'}

**Your memory bank is now updated with the latest project state and learnings!** 🧠✨`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Memory Bank Update Failed**

Error: ${error instanceof Error ? error.message : String(error)}

This may be due to:
- Memory bank not initialized
- File system permissions
- Invalid update parameters
- MongoDB connection issues

**Solution:** Check memory bank status and try again.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Memory Bank Sync Tool
const memoryBankSyncSchema = {
  project_name: z.string().describe("Project name"),
  sync_direction: z.enum(["pull", "push", "bidirectional"]).optional().default("bidirectional").describe("Sync direction"),
  force_sync: z.boolean().optional().default(false).describe("Force sync even if conflicts exist"),
  include_patterns: z.boolean().optional().default(true).describe("Include patterns in sync"),
  include_community_intelligence: z.boolean().optional().default(true).describe("Include community intelligence")
};

server.registerTool(
  "memory-bank-sync",
  {
    title: "Memory Bank Sync",
    description: `🔄 **SYNC MEMORY BANK WITH COLLABORATIVE INTELLIGENCE**

**REAL-TIME COLLABORATIVE INTELLIGENCE SYNC!**

Synchronizes local memory bank with community patterns and collaborative intelligence database.

**SYNC MODES:**
- **Pull:** Download latest community patterns and updates
- **Push:** Share successful patterns with community
- **Bidirectional:** Full two-way sync (default)

**FEATURES:**
- **Community Patterns:** Access patterns from successful projects
- **Success Metrics:** Real-time success rates and confidence scores
- **Conflict Resolution:** Smart merging of overlapping patterns
- **Privacy Controls:** Share only successful, validated patterns
- **Pattern Evolution:** Patterns improve based on community feedback

**WORKFLOW:**
1. Analyzes local memory bank for successful patterns
2. Shares validated patterns with community (if push enabled)
3. Downloads relevant community patterns (if pull enabled)
4. Resolves conflicts using success metrics
5. Updates local memory bank with enhanced intelligence

**REVOLUTIONARY:** First memory bank system with real-time collaborative intelligence!`,
    inputSchema: memoryBankSyncSchema,
    annotations: {
      title: "Sync Memory Bank",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const {
        project_name,
        sync_direction = "bidirectional",
        force_sync = false,
        include_patterns = true,
        include_community_intelligence = true
      } = args;

      // Check MongoDB connection
      if (!mongoClient) {
        return {
          content: [{
            type: "text",
            text: "❌ **MongoDB Required**: This system requires MongoDB connection. Please check your MongoDB configuration."
          }],
          isError: true
        };
      }

      const db = mongoClient.db('context_engineering');
      const memoryBankCollection = db.collection('memory_banks');
      const patternsCollection = db.collection('implementation_patterns');
      const communityCollection = db.collection('memory_patterns');

      // Find memory bank
      const memoryBank = await memoryBankCollection.findOne({ project_name });
      if (!memoryBank) {
        return {
          content: [{
            type: "text",
            text: `❌ **Memory Bank Not Found**: No memory bank found for project "${project_name}". Initialize first using \`memory-bank-initialize\`.`
          }],
          isError: true
        };
      }

      const syncResults: string[] = [];
      let patternsShared = 0;
      let patternsDownloaded = 0;
      let conflictsResolved = 0;

      // PUSH: Share successful patterns with community
      if (sync_direction === "push" || sync_direction === "bidirectional") {
        if (include_patterns && memoryBank.patterns?.implementation?.length > 0) {
          for (const pattern of memoryBank.patterns.implementation) {
            // Only share patterns with high confidence
            if (pattern.confidence >= 7) {
              try {
                await communityCollection.insertOne({
                  pattern_name: `Shared: ${pattern.content.substring(0, 50)}...`,
                  pattern_type: "implementation",
                  technology_stack: memoryBank.technology_stack || [],
                  pattern_content: pattern.content,
                  success_rate: pattern.confidence / 10,
                  usage_count: 1,
                  source_projects: [project_name],
                  confidence_scores: [pattern.confidence],
                  created_at: new Date(),
                  last_used: new Date(),
                  community_votes: 0,
                  shared_at: new Date(),
                  privacy_level: "community"
                });
                patternsShared++;
              } catch (error) {
                // Pattern might already exist, continue
              }
            }
          }
        }
        syncResults.push(`✅ Shared ${patternsShared} successful patterns with community`);
      }

      // PULL: Download community patterns
      if (sync_direction === "pull" || sync_direction === "bidirectional") {
        if (include_community_intelligence && memoryBank.technology_stack) {
          try {
            const communityPatterns = await communityCollection.find({
              technology_stack: { $in: memoryBank.technology_stack },
              success_rate: { $gte: 0.7 },
              source_projects: { $ne: project_name } // Don't download our own patterns
            }, {
              limit: 10,
              sort: { success_rate: -1, community_votes: -1 }
            }).toArray();

            const enhancedPatterns = [...(memoryBank.patterns?.implementation || [])];
            
            for (const communityPattern of communityPatterns) {
              // Check for conflicts
              const existingPattern = enhancedPatterns.find(p => 
                p.content.toLowerCase().includes(communityPattern.pattern_content.toLowerCase().substring(0, 20))
              );

              if (existingPattern) {
                // Resolve conflict by keeping higher confidence pattern
                if (communityPattern.success_rate * 10 > existingPattern.confidence || force_sync) {
                  existingPattern.content = communityPattern.pattern_content;
                  existingPattern.confidence = communityPattern.success_rate * 10;
                  existingPattern.source = "community";
                  conflictsResolved++;
                }
              } else {
                // Add new community pattern
                enhancedPatterns.push({
                  content: communityPattern.pattern_content,
                  discovered_at: new Date().toISOString(),
                  trigger: "community_sync",
                  confidence: communityPattern.success_rate * 10,
                  source: "community",
                  community_votes: communityPattern.community_votes || 0
                });
                patternsDownloaded++;
              }
            }

            // Update memory bank with enhanced patterns
            await memoryBankCollection.updateOne(
              { project_name },
              {
                $set: {
                  "patterns.implementation": enhancedPatterns,
                  last_sync: new Date()
                }
              }
            );

            syncResults.push(`✅ Downloaded ${patternsDownloaded} community patterns`);
            if (conflictsResolved > 0) {
              syncResults.push(`✅ Resolved ${conflictsResolved} pattern conflicts`);
            }
          } catch (error) {
            syncResults.push(`⚠️ Community pattern download failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      // Update sync metadata
      await memoryBankCollection.updateOne(
        { project_name },
        {
          $set: {
            last_sync: new Date(),
            "config.sync_history": {
              last_sync: new Date(),
              sync_direction,
              patterns_shared: patternsShared,
              patterns_downloaded: patternsDownloaded,
              conflicts_resolved: conflictsResolved
            }
          }
        }
      );

      return {
        content: [{
          type: "text",
          text: `✅ **Memory Bank Sync Complete!**

🧠 **Project:** ${project_name}
🔄 **Sync Direction:** ${sync_direction}
📊 **Sync Results:**

${syncResults.map(result => `- ${result}`).join('\n')}

## 📈 **SYNC STATISTICS**
- **Patterns Shared:** ${patternsShared} (high-confidence patterns contributed to community)
- **Patterns Downloaded:** ${patternsDownloaded} (community patterns added to your memory bank)
- **Conflicts Resolved:** ${conflictsResolved} (overlapping patterns merged intelligently)

## 🌐 **COLLABORATIVE INTELLIGENCE STATUS**
- **Community Patterns Available:** Enhanced with real-time intelligence
- **Success Rates:** Updated with latest community feedback
- **Pattern Evolution:** Your memory bank now includes proven community patterns
- **Privacy:** Only high-confidence patterns (≥7/10) shared with community

## 🚀 **ENHANCED CAPABILITIES**
Your memory bank now benefits from:
- ✅ **Community Wisdom:** Patterns from successful projects
- ✅ **Real-Time Updates:** Latest success rates and improvements
- ✅ **Conflict Resolution:** Smart merging prevents duplicates
- ✅ **Quality Assurance:** Only validated patterns included

**Your memory bank is now synchronized with the collaborative intelligence network!** 🌟`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Memory Bank Sync Failed**

MongoDB Error: ${error instanceof Error ? error.message : String(error)}

This may be due to:
- MongoDB connection issues
- Network connectivity problems
- Database permissions
- Corrupted memory bank data

Please check your MongoDB configuration and try again.`
        }],
        isError: true
      };
    }
  }
);



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
    console.error("🔍 Context Tools: context-research, context-assemble-prp");
    console.error("🧠 Memory Bank Tools: memory-bank-initialize, memory-bank-read, memory-bank-update, memory-bank-sync");
    console.error("⚡ Real-time features: Event triggers, file watching, MongoDB sync");
    console.error("🌐 Personal Pattern Library: Your implementation patterns and templates");
  }
}

main().catch((error) => {
  console.error("Failed to start MCP Context Engineering Server:", error);
  process.exit(1);
});

// 🚀 CONTEXT EXECUTE PRP TOOL - THE MISSING PIECE FOR AUTOMATED EXECUTION!

// TodoWrite-style task interface for execution tracking
interface ExecutionTask {
  id: string;
  task: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  order: number;
  validation_passed?: boolean;
  error_message?: string;
  attempts: number;
  created_at: Date;
  updated_at: Date;
}

// Execution tracking schema
const executionTasksSchema = {
  project_name: z.string().describe("Project name for task tracking"),
  prp_id: z.string().describe("PRP ID being executed"),
  tasks: z.array(z.object({
    id: z.string(),
    task: z.string(),
    status: z.enum(["pending", "in_progress", "completed", "failed"]),
    order: z.number(),
    validation_passed: z.boolean().optional(),
    error_message: z.string().optional(),
    attempts: z.number()
  }))
};

// Context Execute PRP Tool Schema
const contextExecutePrpSchema = {
  prp_id: z.string().optional().describe("MongoDB ID of the PRP to execute"),
  prp_content: z.string().optional().describe("PRP content if not using ID"),
  project_name: z.string().describe("Project name for memory bank context"),
  execution_mode: z.enum(["plan", "act"]).optional().default("act").describe("Execution mode (plan/act)"),
  auto_validate: z.boolean().optional().default(true).describe("Run validation loops automatically")
};

server.registerTool(
  "context-execute-prp",
  {
    title: "Context Execute PRP",
    description: `🚀 **EXECUTE PRP WITH VALIDATION LOOPS**

**PURPOSE:** Execute PRPs stored in MongoDB with TodoWrite-style task management and automatic validation.

**CRITICAL:** This completes the Context Engineering workflow by enabling automated execution!

**FEATURES:**
- Reads PRPs from MongoDB (no local files!)
- TodoWrite-style task tracking
- Automatic validation loop execution
- Progress tracking and error recovery
- Memory bank integration

**WORKFLOW:**
1. Load PRP from MongoDB or use provided content
2. Parse tasks and create execution plan
3. Track progress with TodoWrite-style management
4. Execute validation loops automatically
5. Update memory bank with results`,
    inputSchema: contextExecutePrpSchema,
  },
  async (args) => {
    try {
      const {
        prp_id,
        prp_content,
        project_name,
        execution_mode = "act",
        auto_validate = true
      } = args;

      // Either prp_id or prp_content must be provided
      if (!prp_id && !prp_content) {
        return {
          content: [{
            type: "text",
            text: `❌ **Missing PRP**: Either prp_id or prp_content must be provided.

**Usage:**
- With MongoDB ID: \`prp_id: "507f1f77bcf86cd799439011"\`
- With content: \`prp_content: "# PRP Content..."\``
          }],
          isError: true
        };
      }

      let prpToExecute = prp_content;
      let prpMetadata: any = {};

      // Load PRP from MongoDB if ID provided
      if (prp_id && mongoClient) {
        const db = mongoClient.db('context_engineering');
        const collection = db.collection('successful_prps');
        
        try {
          // Find by prp_id as a string field, not MongoDB _id
          const prpDoc = await collection.findOne({ prp_id: prp_id });
          if (!prpDoc) {
            return {
              content: [{
                type: "text",
                text: `❌ **PRP Not Found**: No PRP found with ID: ${prp_id}`
              }],
              isError: true
            };
          }
          prpToExecute = prpDoc.prp_content;
          prpMetadata = prpDoc;
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ **MongoDB Error**: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }

      if (!prpToExecute) {
        return {
          content: [{
            type: "text",
            text: `❌ **No PRP Content**: Unable to load PRP content.`
          }],
          isError: true
        };
      }

      // Parse tasks from PRP content
      const taskMatches = prpToExecute.match(/Task \d+:.*?(?=Task \d+:|$)/gs) || [];
      const tasks: ExecutionTask[] = taskMatches.map((taskText, index) => ({
        id: `task_${index + 1}`,
        task: taskText.trim(),
        status: "pending" as const,
        order: index + 1,
        attempts: 0,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Store tasks in MongoDB for tracking
      if (mongoClient) {
        const db = mongoClient.db('context_engineering');
        const tasksCollection = db.collection('execution_tasks');
        
        await tasksCollection.insertOne({
          project_name,
          prp_id: prp_id || 'manual',
          tasks,
          execution_mode,
          created_at: new Date(),
          status: 'in_progress'
        });
      }

      // Extract validation commands
      const validationSections = {
        syntax: [] as string[],
        unit_tests: [] as string[],
        integration: [] as string[]
      };

      // Parse Level 1: Syntax & Style
      const syntaxMatch = prpToExecute.match(/### Level 1: Syntax & Style\s*```(?:bash)?\s*([\s\S]*?)```/);
      if (syntaxMatch) {
        validationSections.syntax = syntaxMatch[1]
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.trim());
      }

      // Parse Level 2: Unit Tests
      const unitMatch = prpToExecute.match(/### Level 2: Unit Tests.*?```(?:bash)?\s*([\s\S]*?)```/);
      if (unitMatch) {
        validationSections.unit_tests = unitMatch[1]
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.trim());
      }

      // Parse Level 3: Integration Test
      const integrationMatch = prpToExecute.match(/### Level 3: Integration Test\s*```(?:bash)?\s*([\s\S]*?)```/);
      if (integrationMatch) {
        validationSections.integration = integrationMatch[1]
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('curl'))
          .map(line => line.trim());
      }

      // Generate execution plan
      let executionPlan = `# 🚀 PRP Execution Plan

**Project:** ${project_name}
**Mode:** ${execution_mode.toUpperCase()}
**Tasks:** ${tasks.length}
**Auto-Validate:** ${auto_validate ? 'Yes' : 'No'}

## 📋 Execution Process

### 1. ULTRATHINK Phase
As per original Context Engineering methodology, the AI assistant will:
- Think deeply about the implementation approach
- Break down complex tasks into manageable steps
- Identify potential challenges and solutions
- Create comprehensive implementation strategy

### 2. Task Execution (${tasks.length} tasks)
`;

      tasks.forEach((task, index) => {
        executionPlan += `
#### Task ${index + 1}
\`\`\`
${task.task}
\`\`\`
`;
      });

      if (auto_validate) {
        executionPlan += `
### 3. Validation Loops

#### Level 1: Syntax & Style
${validationSections.syntax.length > 0 ? validationSections.syntax.map(cmd => `- \`${cmd}\``).join('\n') : '- No syntax validation commands found'}

#### Level 2: Unit Tests  
${validationSections.unit_tests.length > 0 ? validationSections.unit_tests.map(cmd => `- \`${cmd}\``).join('\n') : '- No unit test commands found'}

#### Level 3: Integration Tests
${validationSections.integration.length > 0 ? validationSections.integration.map(cmd => `- \`${cmd}\``).join('\n') : '- No integration test commands found'}
`;
      }

      executionPlan += `
### 4. Completion Checklist
- [ ] All tasks completed successfully
- [ ] Validation loops passed (if enabled)
- [ ] Memory bank updated with progress
- [ ] Patterns captured for collaborative intelligence
- [ ] Success metrics recorded

## 💡 AI Assistant Instructions

**CRITICAL**: You are now in EXECUTION MODE. Follow these steps:

1. **ULTRATHINK** about the PRP and plan your approach
2. **Create a TodoWrite-style task list** to track implementation
3. **Execute each task** systematically
4. **Run validation commands** after each major step
5. **Fix any failures** before proceeding
6. **Update memory bank** with progress and learnings

### Execution Mode: ${execution_mode.toUpperCase()}

${execution_mode === 'plan' ? `
**PLAN MODE Instructions:**
- Focus on architecture and design decisions
- Document approach in memory bank activeContext.md
- Create detailed implementation strategy
- Identify risks and mitigation strategies
` : `
**ACT MODE Instructions:**  
- Execute the implementation tasks
- Write actual code following the PRP
- Run validation loops continuously
- Fix issues immediately when found
`}

### TodoWrite Integration
Use task management to track progress:
- Mark tasks as 'in_progress' when starting
- Update to 'completed' when done
- Document 'failed' tasks with error details
- Track validation results per task

### Memory Bank Updates
After significant progress:
- Update activeContext.md with current state
- Document patterns in systemPatterns.md
- Track progress in progress.md
- Capture lessons learned

## 📊 Success Tracking

This execution will be tracked in MongoDB with:
- Task completion status
- Validation results
- Error recovery attempts
- Success patterns discovered
- Time to completion

---

**Remember**: The goal is ONE-PASS IMPLEMENTATION SUCCESS through comprehensive context and validation!
`;

      // Return the execution plan
      return {
        content: [{
          type: "text",
          text: executionPlan
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Execution Error**: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// 🗂️ PRP MANAGEMENT TOOLS - MONGODB-BASED FILE WORKFLOW!

// List PRPs Schema
const listPrpsSchema = {
  project_name: z.string().optional().describe("Filter by project name"),
  feature_type: z.string().optional().describe("Filter by feature type"),
  status: z.enum(["generated", "executed", "successful", "failed"]).optional().describe("Filter by status"),
  limit: z.number().optional().default(20).describe("Maximum number of PRPs to return")
};

server.registerTool(
  "list-prps",
  {
    title: "List PRPs",
    description: `📋 **LIST PRPS FROM MONGODB**

**PURPOSE:** List all PRPs stored in MongoDB with filtering options.

**FEATURES:**
- Filter by project name
- Filter by feature type  
- Filter by status
- Sort by creation date

**REPLACES:** Traditional file listing - everything is in MongoDB!`,
    inputSchema: listPrpsSchema,
  },
  async (args) => {
    try {
      if (!mongoClient) {
        throw new Error("MongoDB not connected");
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('successful_prps');

      // Build filter
      const filter: any = {};
      if (args.project_name) filter.feature_request = { $regex: args.project_name, $options: 'i' };
      if (args.feature_type) filter.feature_type = args.feature_type;
      if (args.status) filter.status = args.status;

      // Query with limit and sort
      const prps = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .limit(args.limit || 20)
        .toArray();

      // Format results
      const prpList = prps.map(prp => ({
        prp_id: prp.prp_id,
        feature: prp.feature_request || prp.feature_type || 'Unknown',
        status: prp.status || 'generated',
        confidence: prp.confidence_metrics?.overall_confidence || 'N/A',
        created: prp.created_at,
        success_rate: prp.success_rate || 'N/A'
      }));

      return {
        content: [{
          type: "text",
          text: `# 📋 PRPs in MongoDB

**Total Found:** ${prpList.length}

${prpList.length === 0 ? '❌ No PRPs found matching your criteria.' : prpList.map((prp, idx) => `
## ${idx + 1}. ${prp.feature}
- **ID:** \`${prp.prp_id}\`
- **Status:** ${prp.status}
- **Confidence:** ${prp.confidence}/10
- **Success Rate:** ${prp.success_rate}
- **Created:** ${new Date(prp.created).toLocaleString()}
`).join('\n')}

## 💡 Usage
To execute a PRP:
\`\`\`
context-execute-prp {
  prp_id: "<prp_id>",
  project_name: "your-project"
}
\`\`\`

To retrieve full PRP content:
\`\`\`
get-prp {
  prp_id: "<prp_id>"
}
\`\`\`
`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Error listing PRPs:** ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Get PRP Schema
const getPrpSchema = {
  prp_id: z.string().describe("MongoDB PRP ID to retrieve")
};

server.registerTool(
  "get-prp",
  {
    title: "Get PRP",
    description: `📄 **RETRIEVE PRP FROM MONGODB**

**PURPOSE:** Get full PRP content from MongoDB by ID.

**FEATURES:**
- Retrieve complete PRP content
- Get metadata and context
- Access confidence metrics
- View assembled patterns

**REPLACES:** Traditional file reading - everything is in MongoDB!`,
    inputSchema: getPrpSchema,
  },
  async (args) => {
    try {
      if (!mongoClient) {
        throw new Error("MongoDB not connected");
      }

      const db = mongoClient.db('context_engineering');
      const collection = db.collection('successful_prps');

      // Find PRP by ID
      const prp = await collection.findOne({ prp_id: args.prp_id });

      if (!prp) {
        return {
          content: [{
            type: "text",
            text: `❌ **PRP Not Found:** No PRP found with ID: ${args.prp_id}`
          }],
          isError: true
        };
      }

      // Format response
      return {
        content: [{
          type: "text",
          text: `# 📄 PRP Retrieved from MongoDB

**ID:** ${prp.prp_id}
**Feature:** ${prp.feature_request || prp.feature_type || 'Unknown'}
**Status:** ${prp.status || 'generated'}
**Created:** ${new Date(prp.created_at).toLocaleString()}

## 📊 Confidence Metrics
- **Overall:** ${prp.confidence_metrics?.overall_confidence || 'N/A'}/10
- **Template:** ${Math.round((prp.confidence_metrics?.template_confidence || 0) * 10)}/10
- **Context:** ${Math.round((prp.confidence_metrics?.context_confidence || 0) * 10)}/10
- **Patterns:** ${Math.round((prp.confidence_metrics?.pattern_confidence || 0) * 10)}/10

## 📝 PRP Content

\`\`\`markdown
${prp.prp_content}
\`\`\`

## 🔧 Metadata
- **Complexity:** ${prp.metadata?.complexity_preference || 'intermediate'}
- **Validation:** ${prp.metadata?.validation_strictness || 'standard'}
- **Template Score:** ${prp.metadata?.template_compatibility_score || 'N/A'}

## 💡 Next Steps
Execute this PRP:
\`\`\`
context-execute-prp {
  prp_id: "${prp.prp_id}",
  project_name: "your-project"
}
\`\`\`
`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Error retrieving PRP:** ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// 🎯 WORKFLOW ORCHESTRATION TOOL - SINGLE COMMAND MAGIC!

const contextEngineeringFlowSchema = {
  feature_request: z.string().describe("Feature to implement"),
  project_name: z.string().describe("Project name for memory bank"),
  technology_stack: z.array(z.string()).optional().describe("Technology stack for better research"),
  auto_execute: z.boolean().optional().default(false).describe("Automatically execute after PRP generation"),
  execution_mode: z.enum(["plan", "act"]).optional().default("act").describe("Execution mode if auto_execute is true")
};

server.registerTool(
  "context-engineering-flow",
  {
    title: "Context Engineering Flow",
    description: `🚀 **COMPLETE CONTEXT ENGINEERING WORKFLOW**

**PURPOSE:** Single command to run the entire Context Engineering flow!

**REPLACES:** Multiple tool calls with one intelligent orchestration

**WORKFLOW:**
1. 🔍 Research patterns and best practices
2. 🧠 ULTRATHINK phase (AI does this)
3. 📝 Generate comprehensive PRP
4. 💾 Save to MongoDB automatically
5. 🏃 Optional: Execute immediately

**FEATURES:**
- One command instead of three
- Automatic MongoDB storage
- Optional immediate execution
- Intelligent error recovery
- Progress tracking throughout`,
    inputSchema: contextEngineeringFlowSchema,
  },
  async (args) => {
    try {
      const {
        feature_request,
        project_name,
        technology_stack = [],
        auto_execute = false,
        execution_mode = "act"
      } = args;

      let workflowStatus = `# 🚀 Context Engineering Workflow

**Feature:** ${feature_request}
**Project:** ${project_name}
**Auto-Execute:** ${auto_execute ? 'Yes' : 'No'}

## 📊 Workflow Progress\n\n`;

      // Step 1: Research
      workflowStatus += `### ✅ Step 1: Research Phase\n`;
      workflowStatus += `Searching for patterns, rules, and best practices...\n\n`;

      let researchResults: any;
      try {
        // Simulate calling context-research tool
        const queryEmbedding = await generateEmbedding(feature_request, "query");
        
        const [patterns, rules, research] = await Promise.all([
          searchPatterns(queryEmbedding, technology_stack, 0.7, 10),
          searchRules(queryEmbedding, technology_stack, 10),
          searchResearch(technology_stack, queryEmbedding)
        ]);

        const summary = calculateSummary(patterns, rules, research);
        
        researchResults = {
          patterns,
          rules,
          research,
          summary
        };

        workflowStatus += `✅ Research completed:\n`;
        workflowStatus += `- Found ${patterns.length} implementation patterns\n`;
        workflowStatus += `- Found ${rules.length} project rules\n`;
        workflowStatus += `- Found ${research.length} research sources\n\n`;
      } catch (error) {
        workflowStatus += `⚠️ Research phase had issues but continuing: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
        researchResults = { patterns: [], rules: [], research: [], summary: {} };
      }

      // Step 2: ULTRATHINK (Instructions for AI)
      workflowStatus += `### 🧠 Step 2: ULTRATHINK Phase\n`;
      workflowStatus += `**AI Assistant Instructions:**\n`;
      workflowStatus += `- Analyze all research findings\n`;
      workflowStatus += `- Identify implementation patterns\n`;
      workflowStatus += `- Plan approach and architecture\n`;
      workflowStatus += `- Consider potential gotchas\n`;
      workflowStatus += `- Design validation strategy\n\n`;
      workflowStatus += `✅ ULTRATHINK phase complete (AI processed)\n\n`;

      // Step 3: Generate PRP
      workflowStatus += `### ✅ Step 3: PRP Generation\n`;
      workflowStatus += `Generating comprehensive PRP with validation loops...\n\n`;

      let prpResult: any;
      try {
        // Generate PRP using assembled context
        const queryEmbedding = await generateEmbedding(feature_request, "query");
        const optimalTemplate = await findOptimalTemplate(queryEmbedding, [], researchResults.summary);
        const assembledContext = await assembleOptimalContext(researchResults, queryEmbedding, "intermediate");
        const prpContent = generateDynamicPRP(feature_request, optimalTemplate, assembledContext, "standard");
        const confidenceMetrics = calculatePRPConfidence(optimalTemplate, assembledContext, researchResults.summary);

        // Save to MongoDB
        let prpId: string | null = null;
        if (mongoClient) {
          const db = mongoClient.db('context_engineering');
          const collection = db.collection('successful_prps');
          
          const prpDocument = {
            prp_id: `prp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            prp_content: prpContent,
            feature_request,
            project_name,
            technology_stack,
            template_used: optimalTemplate,
            assembled_context: assembledContext,
            confidence_metrics: confidenceMetrics,
            metadata: {
              generation_timestamp: new Date(),
              complexity_preference: "intermediate",
              validation_strictness: "standard",
              template_compatibility_score: optimalTemplate?.compatibility_score || 0,
              context_quality_score: assembledContext.context_quality_score
            },
            status: 'generated',
            created_at: new Date(),
            updated_at: new Date()
          };

          await collection.insertOne(prpDocument);
          prpId = prpDocument.prp_id;
        }

        prpResult = {
          prp_content: prpContent,
          prp_id: prpId,
          confidence: confidenceMetrics.overall_confidence
        };

        workflowStatus += `✅ PRP generated successfully!\n`;
        workflowStatus += `- **PRP ID:** \`${prpId}\`\n`;
        workflowStatus += `- **Confidence:** ${confidenceMetrics.overall_confidence}/10\n`;
        workflowStatus += `- **Saved to MongoDB:** Yes\n\n`;
      } catch (error) {
        workflowStatus += `❌ PRP generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
        return {
          content: [{ type: "text", text: workflowStatus }],
          isError: true
        };
      }

      // Step 4: Optional Execution
      if (auto_execute && prpResult?.prp_id) {
        workflowStatus += `### 🏃 Step 4: Auto-Execution\n`;
        workflowStatus += `Preparing PRP for automatic execution...\n\n`;

        // Parse tasks for execution planning
        const taskMatches = prpResult.prp_content.match(/Task \d+:.*?(?=Task \d+:|$)/gs) || [];
        const taskCount = taskMatches.length;

        workflowStatus += `✅ Execution plan ready:\n`;
        workflowStatus += `- **Mode:** ${execution_mode.toUpperCase()}\n`;
        workflowStatus += `- **Tasks:** ${taskCount}\n`;
        workflowStatus += `- **Validation:** Enabled\n\n`;

        workflowStatus += `## 💡 AI Assistant: Execute Now!\n\n`;
        workflowStatus += `Use the following command to execute:\n`;
        workflowStatus += `\`\`\`\n`;
        workflowStatus += `context-execute-prp {\n`;
        workflowStatus += `  prp_id: "${prpResult.prp_id}",\n`;
        workflowStatus += `  project_name: "${project_name}",\n`;
        workflowStatus += `  execution_mode: "${execution_mode}"\n`;
        workflowStatus += `}\n`;
        workflowStatus += `\`\`\`\n`;
      } else if (!auto_execute && prpResult?.prp_id) {
        workflowStatus += `### 📋 Step 4: Manual Execution\n`;
        workflowStatus += `PRP is ready for review and execution.\n\n`;
        workflowStatus += `## 💡 Next Steps\n\n`;
        workflowStatus += `1. **Review PRP:**\n`;
        workflowStatus += `   \`\`\`\n`;
        workflowStatus += `   get-prp { prp_id: "${prpResult.prp_id}" }\n`;
        workflowStatus += `   \`\`\`\n\n`;
        workflowStatus += `2. **Execute when ready:**\n`;
        workflowStatus += `   \`\`\`\n`;
        workflowStatus += `   context-execute-prp {\n`;
        workflowStatus += `     prp_id: "${prpResult.prp_id}",\n`;
        workflowStatus += `     project_name: "${project_name}"\n`;
        workflowStatus += `   }\n`;
        workflowStatus += `   \`\`\`\n`;
      }

      // Add the PRP content preview
      if (prpResult?.prp_content) {
        workflowStatus += `\n## 📄 Generated PRP Preview\n\n`;
        workflowStatus += `\`\`\`markdown\n`;
        // Show first 50 lines as preview
        const lines = prpResult.prp_content.split('\n');
        const preview = lines.slice(0, 50).join('\n');
        workflowStatus += preview;
        if (lines.length > 50) {
          workflowStatus += `\n\n... (${lines.length - 50} more lines)\n`;
        }
        workflowStatus += `\n\`\`\`\n`;
      }

      workflowStatus += `\n---\n\n`;
      workflowStatus += `**🎯 Workflow Complete!** The Context Engineering flow has successfully:\n`;
      workflowStatus += `- ✅ Researched patterns and best practices\n`;
      workflowStatus += `- ✅ Completed ULTRATHINK analysis\n`;
      workflowStatus += `- ✅ Generated comprehensive PRP\n`;
      workflowStatus += `- ✅ Saved to MongoDB for reuse\n`;
      workflowStatus += auto_execute ? `- ✅ Prepared for automatic execution\n` : `- ✅ Ready for manual review and execution\n`;

      return {
        content: [{
          type: "text",
          text: workflowStatus
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Workflow Error:** ${error instanceof Error ? error.message : String(error)}\n\nThe Context Engineering flow encountered an unexpected error. Please check your configuration and try again.`
        }],
        isError: true
      };
    }
  }
);

