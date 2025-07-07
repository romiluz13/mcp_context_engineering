#!/usr/bin/env node

const { MongoClient } = require('mongodb');

async function generateSampleData() {
  const connectionString = process.env.MDB_MCP_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ MDB_MCP_CONNECTION_STRING environment variable is required');
    process.exit(1);
  }

  console.log('🔗 Connecting to MongoDB...');
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db('context_engineering');
    
    console.log('📊 Generating sample data...');
    
    // Universal AI Rules
    const universalRules = [
      {
        rule_id: "universal_ai_rule_001",
        rule_type: "project_awareness",
        title: "Project Awareness & Context",
        content: "Always understand project structure before making changes - read documentation, examine existing patterns, maintain consistency with naming conventions and architecture.",
        technology_stack: ["universal"],
        ai_assistants: ["cursor", "vscode-copilot", "claude-desktop", "windsurf", "github-copilot", "all"],
        enforcement_level: "high",
        success_impact: 0.9,
        usage_frequency: 1,
        auto_enforcement: true,
        created_at: new Date(),
        updated_at: new Date(),
        version: 1
      },
      {
        rule_id: "universal_ai_rule_002", 
        rule_type: "code_structure",
        title: "Code Structure & Modularity",
        content: "Keep files manageable (<500 lines), organize by responsibility, use consistent imports, separate concerns clearly (core logic, configuration, business logic, presentation).",
        technology_stack: ["universal"],
        ai_assistants: ["cursor", "vscode-copilot", "claude-desktop", "windsurf", "github-copilot", "all"],
        enforcement_level: "high",
        success_impact: 0.8,
        usage_frequency: 1,
        auto_enforcement: true,
        created_at: new Date(),
        updated_at: new Date(),
        version: 1
      },
      {
        rule_id: "universal_ai_rule_003",
        rule_type: "testing",
        title: "Testing & Reliability", 
        content: "Write tests for new features using project's testing framework, update existing tests when modifying functionality, include comprehensive coverage (happy path, edge cases, error handling).",
        technology_stack: ["universal"],
        ai_assistants: ["cursor", "vscode-copilot", "claude-desktop", "windsurf", "github-copilot", "all"],
        enforcement_level: "high",
        success_impact: 0.85,
        usage_frequency: 1,
        auto_enforcement: false,
        created_at: new Date(),
        updated_at: new Date(),
        version: 1
      }
    ];
    
    // Implementation Patterns
    const implementationPatterns = [
      {
        pattern_id: "universal_multi_agent_001",
        pattern_name: "Universal Multi-Agent System Pattern",
        pattern_type: "multi_agent_system",
        description: "Multi-agent system pattern that works with any AI assistant and technology stack",
        technology_stack: ["universal", "multi-language"],
        ai_assistants: ["cursor", "vscode-copilot", "claude-desktop", "windsurf", "github-copilot"],
        complexity_level: "intermediate",
        success_rate: 0.85,
        usage_frequency: 15,
        implementation_time_hours: 8,
        gotchas: [
          "Ensure proper agent communication protocols",
          "Handle agent failure scenarios gracefully", 
          "Implement proper state management between agents"
        ],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        pattern_id: "universal_api_integration_001",
        pattern_name: "Universal API Integration Pattern",
        pattern_type: "api_integration",
        description: "Robust API integration pattern with error handling, retries, and monitoring",
        technology_stack: ["universal", "rest", "graphql"],
        ai_assistants: ["cursor", "vscode-copilot", "claude-desktop", "windsurf", "github-copilot"],
        complexity_level: "simple",
        success_rate: 0.92,
        usage_frequency: 45,
        implementation_time_hours: 4,
        gotchas: [
          "Always implement proper rate limiting",
          "Handle network timeouts gracefully",
          "Log API responses for debugging"
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // PRP Templates
    const prpTemplates = [
      {
        template_id: "universal_intermediate_001",
        template_name: "Universal Intermediate Implementation Template",
        complexity_level: "intermediate",
        success_rate: 0.88,
        usage_frequency: 25,
        template_structure: {
          goal: "Clear problem statement and objectives",
          context: "All needed context including patterns and constraints", 
          implementation: "Step-by-step implementation blueprint",
          validation: "Testing and validation strategies"
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Research Knowledge
    const researchKnowledge = [
      {
        research_id: "context_engineering_001",
        title: "Context Engineering Best Practices",
        source: "AI Development Research",
        summary: "Comprehensive guide to context engineering principles for AI-assisted development",
        freshness_score: 0.95,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Insert data
    console.log('📝 Inserting universal AI rules...');
    await db.collection('project_rules').insertMany(universalRules);
    
    console.log('📋 Inserting implementation patterns...');
    await db.collection('implementation_patterns').insertMany(implementationPatterns);
    
    console.log('📄 Inserting PRP templates...');
    await db.collection('prp_templates').insertMany(prpTemplates);
    
    console.log('📚 Inserting research knowledge...');
    await db.collection('research_knowledge').insertMany(researchKnowledge);
    
    console.log('✅ Sample data generated successfully!');
    console.log(`📊 Generated: ${universalRules.length} rules, ${implementationPatterns.length} patterns, ${prpTemplates.length} templates, ${researchKnowledge.length} research items`);
    
  } catch (error) {
    console.error('❌ Sample data generation failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

generateSampleData();
