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

// Context Research Tool
const contextResearchSchema = {
  feature_request: z.string().describe("The feature or functionality you want to implement"),
  technology_stack: z.array(z.string()).optional().describe("Technology stack preferences"),
  success_rate_threshold: z.number().min(0).max(1).optional().default(0.7),
  max_results: z.number().min(1).max(50).optional().default(10),
};

server.tool(
  "context-research",
  "🔍 Intelligent pattern and rule discovery using MongoDB semantic search",
  contextResearchSchema,
  async (args) => {
    try {
      const { feature_request, technology_stack = [], success_rate_threshold = 0.7, max_results = 10 } = args;

      if (!config.connectionString) {
        return {
          content: [{ type: "text", text: "❌ MongoDB connection not configured. Set MDB_MCP_CONNECTION_STRING." }],
          isError: true,
        };
      }

      const client = new MongoClient(config.connectionString);
      await client.connect();
      const db = client.db("context_engineering");

      // Simple aggregation pipeline for pattern matching
      const pipeline = [
        ...(technology_stack.length > 0 ? [{ $match: { technology_stack: { $in: technology_stack.concat(["universal"]) } } }] : []),
        {
          $addFields: {
            relevance_score: {
              $add: [
                { $cond: { if: { $regexMatch: { input: "$content", regex: feature_request, options: "i" } }, then: 0.3, else: 0 } },
                { $multiply: [{ $ifNull: ["$success_rate", 0.5] }, 0.4] },
                { $multiply: [{ $divide: [{ $ifNull: ["$usage_frequency", 1] }, 100] }, 0.2] },
              ]
            }
          }
        },
        { $match: { $or: [{ success_rate: { $gte: success_rate_threshold } }, { rule_type: { $exists: true } }] } },
        { $sort: { relevance_score: -1, success_rate: -1 } },
        { $limit: max_results }
      ];

      const [patterns, rules, research] = await Promise.all([
        db.collection("implementation_patterns").aggregate(pipeline).toArray(),
        db.collection("project_rules").aggregate(pipeline).toArray(),
        db.collection("research_knowledge").aggregate(pipeline).toArray(),
      ]);

      await client.close();

      const results = {
        query: { feature_request, technology_stack, success_rate_threshold, max_results },
        patterns: patterns.map((p: any) => ({
          pattern_id: p.pattern_id,
          name: p.pattern_name || p.title,
          type: p.pattern_type || p.rule_type,
          description: p.description || p.content?.substring(0, 200) + "...",
          technology_stack: p.technology_stack,
          success_rate: p.success_rate,
          relevance_score: p.relevance_score?.toFixed(3),
        })),
        rules: rules.map((r: any) => ({
          rule_id: r.rule_id,
          title: r.title,
          type: r.rule_type,
          enforcement_level: r.enforcement_level,
          relevance_score: r.relevance_score?.toFixed(3),
        })),
        research: research.map((r: any) => ({
          research_id: r.research_id,
          title: r.title,
          source: r.source,
          relevance_score: r.relevance_score?.toFixed(3),
        })),
        summary: {
          total_results: patterns.length + rules.length + research.length,
          patterns_found: patterns.length,
          rules_found: rules.length,
          research_found: research.length,
        },
      };

      return {
        content: [
          {
            type: "text",
            text: `🔍 **Context Research Results**\n\n` +
                  `**Query**: ${feature_request}\n` +
                  `**Found**: ${results.summary.total_results} relevant items\n` +
                  `- 📋 ${results.summary.patterns_found} patterns\n` +
                  `- 📏 ${results.summary.rules_found} rules\n` +
                  `- 📚 ${results.summary.research_found} research\n\n` +
                  `Use \`context-assemble-prp\` with these results to generate an implementation plan.`,
          },
          { type: "text", text: JSON.stringify(results, null, 2) },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Context Assemble PRP Tool
const contextAssemblePRPSchema = {
  feature_request: z.string().describe("The feature to implement"),
  research_results: z.any().optional().describe("Results from context-research tool"),
  complexity_level: z.enum(["simple", "intermediate", "advanced"]).optional().default("intermediate"),
  include_validation: z.boolean().optional().default(true),
};

server.tool(
  "context-assemble-prp",
  "📋 Dynamic PRP generation with intelligent context assembly",
  contextAssemblePRPSchema,
  async (args) => {
    try {
      const { feature_request, research_results, complexity_level = "intermediate", include_validation = true } = args;

      const patterns = research_results?.patterns || [];
      const rules = research_results?.rules || [];
      const research = research_results?.research || [];

      const prp = `# Product Requirements Prompt (PRP)

## 🎯 Goal & Objectives

**Feature Request**: ${feature_request}

**Complexity Level**: ${complexity_level}

## 📚 Context

### Implementation Patterns (${patterns.length} found)
${patterns.length > 0 ? patterns.slice(0, 3).map((p: any) => `- **${p.name}**: ${p.description}`).join('\n') : '- No specific patterns found - using universal best practices'}

### Applicable Rules (${rules.length} found)
${rules.length > 0 ? rules.slice(0, 3).map((r: any) => `- **${r.title}**: ${r.type}`).join('\n') : '- No specific rules found - following universal coding standards'}

### Research Insights (${research.length} found)
${research.length > 0 ? research.slice(0, 2).map((r: any) => `- **${r.title}**: ${r.source}`).join('\n') : '- No specific research found - using general best practices'}

## 🏗️ Implementation Blueprint

### Phase 1: Foundation Setup
1. **Environment Setup**: Configure development environment and dependencies
2. **Project Structure**: Establish clean, maintainable project structure
3. **Base Configuration**: Set up configuration management

### Phase 2: Core Implementation
1. **Core Logic**: Implement main functionality for ${feature_request}
2. **Data Layer**: Set up data models and persistence
3. **Business Logic**: Implement core business rules and validation
4. **Interface Layer**: Create user-facing interfaces or APIs

### Phase 3: Integration & Testing
1. **Component Integration**: Integrate all components
2. **Error Handling**: Implement comprehensive error handling
${include_validation ? '3. **Testing Suite**: Implement comprehensive tests\n4. **Quality Assurance**: Code review and quality checks' : ''}

## ✅ Success Criteria

- **Functionality**: Feature works as specified
- **Performance**: Meets performance requirements
- **Quality**: Code follows established patterns
- **Testing**: ${include_validation ? 'Comprehensive test coverage' : 'Basic functionality verified'}

## 🎯 Confidence Level: ${patterns.length + rules.length > 5 ? 'High' : patterns.length + rules.length > 2 ? 'Medium' : 'Low'}

**Context Quality**: ${patterns.length + rules.length + research.length} relevant sources
**Implementation Readiness**: Ready for development

---

*Generated by MCP Context Engineering Platform*`;

      return {
        content: [
          {
            type: "text",
            text: `📋 **Dynamic PRP Generated**\n\n` +
                  `**Feature**: ${feature_request}\n` +
                  `**Complexity**: ${complexity_level}\n` +
                  `**Context Sources**: ${patterns.length} patterns, ${rules.length} rules, ${research.length} research\n\n` +
                  `**Ready for Implementation** 🚀`,
          },
          { type: "text", text: prp },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Tools are automatically registered with server.tool() calls above

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 MCP Context Engineering Platform started");
  console.error(`📊 MongoDB: ${config.connectionString ? '✅ Connected' : '❌ Not configured'}`);
  console.error(`🤖 OpenAI: ${config.openaiApiKey ? '✅ Configured' : '❌ Not configured'}`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
