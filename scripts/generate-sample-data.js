#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - Interactive Sample Data Generator
 *
 * Beautiful, interactive experience for generating sample data with real
 * OpenAI embeddings to test the revolutionary context engineering platform.
 */

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import readline from 'readline';
import { promisify } from 'util';

// Create readline interface for interactive prompts
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// Configuration from environment variables
const config = {
    connectionString: process.env.MDB_MCP_CONNECTION_STRING,
    openaiApiKey: process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY
};

const DATABASE_NAME = 'context_engineering';

/**
 * Robust upsert function to handle duplicate keys gracefully
 */
async function upsertSampleData(collection, data, uniqueField) {
    try {
        const operations = data.map(doc => ({
            updateOne: {
                filter: { [uniqueField]: doc[uniqueField] },
                update: { $setOnInsert: doc },
                upsert: true
            }
        }));

        const result = await collection.bulkWrite(operations, { ordered: false });
        return {
            insertedCount: result.upsertedCount,
            existingCount: result.matchedCount,
            totalProcessed: data.length
        };
    } catch (error) {
        console.log(`⚠️ Some duplicate keys skipped in ${collection.collectionName} (expected for sample data)`);
        return {
            insertedCount: 0,
            existingCount: data.length,
            totalProcessed: data.length,
            error: error.message
        };
    }
}

/**
 * Generate unique pattern ID
 */
function generateUniqueId(type, index) {
    return `${type}_${Date.now()}_${index}`;
}

/**
 * Verify vector search index readiness
 */
async function verifyVectorIndexReadiness(collection, indexName) {
    const maxRetries = 5;
    const retryDelay = 10000; // 10 seconds

    console.log(`   🔍 Verifying vector index ${indexName} readiness...`);

    for (let i = 0; i < maxRetries; i++) {
        try {
            // Test vector search with a simple query
            const testResult = await collection.aggregate([
                {
                    $vectorSearch: {
                        index: indexName,
                        path: "embedding",
                        queryVector: new Array(1536).fill(0.1), // Test vector
                        numCandidates: 1,
                        limit: 1
                    }
                }
            ]).toArray();

            console.log(`   ✅ Vector index ${indexName} is ready for queries`);
            return true;
        } catch (error) {
            console.log(`   ⏳ Vector index ${indexName} not ready yet (${i + 1}/${maxRetries}) - ${error.message.substring(0, 50)}...`);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    console.log(`   ⚠️ Vector index ${indexName} may need more time to be fully ready`);
    console.log(`   💡 This is normal for new Atlas Vector Search indexes - they can take 5-10 minutes`);
    return false;
}

/**
 * Interactive utilities
 */
function printBanner() {
    console.clear();
    console.log('\n🧠 ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING - SAMPLE DATA GENERATOR');
    console.log('   Generate intelligent sample data with real OpenAI embeddings!');
    console.log('═══════════════════════════════════════════════════════════════════════════════ 🧠\n');
}

function printStep(step, title, description) {
    console.log(`\n📋 STEP ${step}: ${title}`);
    console.log(`   ${description}\n`);
}

function printSuccess(message) {
    console.log(`✅ ${message}`);
}

function printWarning(message) {
    console.log(`⚠️  ${message}`);
}

function printError(message) {
    console.log(`❌ ${message}`);
}

function printInfo(message) {
    console.log(`ℹ️  ${message}`);
}

async function askQuestion(questionText, defaultValue = null) {
    const prompt = defaultValue
        ? `${questionText} (default: ${defaultValue}): `
        : `${questionText}: `;

    const answer = await question(prompt);
    return answer.trim() || defaultValue;
}

async function askYesNo(questionText, defaultValue = 'y') {
    const answer = await askQuestion(`${questionText} (y/n)`, defaultValue);
    return answer.toLowerCase().startsWith('y');
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.MDB_MCP_OPENAI_API_KEY
});

/**
 * Generate embeddings for text content
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            dimensions: 1536,
        });
        
        if (!response.data || response.data.length === 0) {
            throw new Error("No embedding data returned from OpenAI");
        }
        
        return response.data[0].embedding;
    } catch (error) {
        console.warn(`⚠️  Warning: Could not generate embedding: ${error.message}`);
        return null;
    }
}

/**
 * Sample implementation patterns
 */
const SAMPLE_PATTERNS = [
    {
        pattern_id: "pydantic_ai_multi_agent_001",
        pattern_type: "agent",
        title: "Pydantic AI Multi-Agent with Tool Pattern",
        description: "Pattern for creating primary agent with sub-agent as tool for complex workflows",
        code_snippet: `@research_agent.tool
async def email_draft_tool(ctx: RunContext[AgentDeps], topic: str) -> str:
    """Draft email using email agent as a tool"""
    return await email_agent.run(f"Draft email about: {topic}", deps=ctx.deps)`,
        technology_stack: ["python", "pydantic-ai", "asyncio"],
        file_path: "examples/agent/multi_agent.py",
        success_metrics: {
            usage_count: 89,
            success_rate: 0.94,
            avg_implementation_time: 45,
            total_success: 84,
            total_failures: 5
        },
        gotchas: [
            "Always use async/await for agent tools",
            "Dependencies must be properly typed",
            "Agent-as-tool pattern requires careful context passing"
        ],
        validation_commands: ["pytest tests/", "ruff check", "mypy ."],
        complexity_level: "intermediate",
        quality_score: 0.91
    },
    {
        pattern_id: "fastapi_crud_001",
        pattern_type: "api",
        title: "FastAPI CRUD with Pydantic Models",
        description: "Standard CRUD operations with proper validation and error handling",
        code_snippet: `@app.post("/items/", response_model=ItemResponse)
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Create new item with validation"""
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item`,
        technology_stack: ["python", "fastapi", "pydantic", "sqlalchemy"],
        file_path: "examples/api/crud.py",
        success_metrics: {
            usage_count: 156,
            success_rate: 0.97,
            avg_implementation_time: 30,
            total_success: 151,
            total_failures: 5
        },
        gotchas: [
            "Always use Depends() for database sessions",
            "Validate input with Pydantic models",
            "Handle database exceptions properly"
        ],
        validation_commands: ["pytest tests/test_api.py", "ruff check", "mypy ."],
        complexity_level: "beginner",
        quality_score: 0.95
    },
    {
        pattern_id: "cli_argparse_001",
        pattern_type: "cli",
        title: "CLI with Argparse and Rich Output",
        description: "Command-line interface with proper argument parsing and rich console output",
        code_snippet: `import argparse
from rich.console import Console

def main():
    parser = argparse.ArgumentParser(description="Context Engineering CLI")
    parser.add_argument("--feature", required=True, help="Feature to implement")
    args = parser.parse_args()
    
    console = Console()
    console.print(f"[green]Processing feature:[/green] {args.feature}")`,
        technology_stack: ["python", "argparse", "rich"],
        file_path: "examples/cli/main.py",
        success_metrics: {
            usage_count: 67,
            success_rate: 0.91,
            avg_implementation_time: 20,
            total_success: 61,
            total_failures: 6
        },
        gotchas: [
            "Use rich for better console output",
            "Always validate CLI arguments",
            "Provide helpful error messages"
        ],
        validation_commands: ["pytest tests/test_cli.py", "ruff check"],
        complexity_level: "beginner",
        quality_score: 0.88
    }
];

/**
 * Sample research knowledge
 */
const SAMPLE_RESEARCH = [
    {
        knowledge_id: "pydantic_ai_multi_agent_001",
        topic: "pydantic_ai_multi_agent",
        title: "Pydantic AI Multi-Agent System Patterns",
        documentation_urls: [
            {
                url: "https://ai.pydantic.dev/multi-agent-applications/",
                section: "Agent-as-tool pattern",
                critical_insights: ["Pass usage context for token tracking", "Use RunContext for dependency injection"],
                last_validated: new Date()
            }
        ],
        key_insights: [
            "Agent-as-tool pattern requires passing ctx.usage for token tracking",
            "Multi-agent systems need careful error handling between agents",
            "Dependencies should be injected via RunContext pattern"
        ],
        common_pitfalls: [
            "Forgetting to pass usage context between agents",
            "Using sync functions in async agent context",
            "Not handling API rate limits properly"
        ],
        code_examples: [
            {
                title: "Agent-as-tool registration",
                code: "@research_agent.tool\nasync def email_tool(ctx: RunContext[Deps], topic: str)...",
                source: "official_docs"
            }
        ],
        technology_stack: ["pydantic-ai", "python"],
        freshness_score: 0.95,
        validation_status: "verified"
    },
    {
        knowledge_id: "fastapi_best_practices_001",
        topic: "fastapi_best_practices",
        title: "FastAPI Production Best Practices",
        documentation_urls: [
            {
                url: "https://fastapi.tiangolo.com/tutorial/dependencies/",
                section: "Dependency Injection",
                critical_insights: ["Use Depends() for shared logic", "Database sessions should be dependencies"],
                last_validated: new Date()
            }
        ],
        key_insights: [
            "Always use dependency injection for database sessions",
            "Pydantic models provide automatic validation",
            "Use response_model for consistent API responses"
        ],
        common_pitfalls: [
            "Not closing database connections properly",
            "Missing input validation",
            "Inconsistent error handling"
        ],
        technology_stack: ["fastapi", "python", "pydantic"],
        freshness_score: 0.92,
        validation_status: "verified"
    }
];

/**
 * Sample project rules
 */
const SAMPLE_RULES = [
    {
        rule_id: "universal_ai_001",
        rule_type: "coding_standard",
        title: "Universal AI Assistant Compatibility",
        description: "All code must work with any AI coding assistant, not just Claude",
        rule_text: "Use universal patterns and avoid AI-specific references in code comments or documentation",
        enforcement_level: "mandatory",
        technology_stack: ["python", "javascript", "typescript", "universal"],
        priority: 1,
        rationale: "Ensures maximum compatibility across AI assistants and prevents vendor lock-in",
        examples: [
            "✅ Good: # AI assistant will implement this function",
            "❌ Bad: # Claude will implement this function"
        ],
        violations_to_avoid: [
            "AI-specific naming in code",
            "Assistant-specific assumptions in logic",
            "Platform-dependent implementations"
        ],
        success_metrics: {
            compliance_rate: 0.98,
            adoption_count: 245
        }
    },
    {
        rule_id: "fastapi_validation_001",
        rule_type: "validation",
        title: "FastAPI Input Validation",
        description: "All FastAPI endpoints must use Pydantic models for request validation",
        rule_text: "Every POST/PUT endpoint must define a Pydantic model for input validation with proper error handling",
        enforcement_level: "mandatory",
        technology_stack: ["python", "fastapi", "pydantic"],
        priority: 2,
        rationale: "Prevents runtime errors and provides automatic API documentation",
        examples: [
            "✅ Good: @app.post('/items/', response_model=ItemResponse)\\nasync def create_item(item: ItemCreate):",
            "❌ Bad: @app.post('/items/')\\nasync def create_item(data: dict):"
        ],
        violations_to_avoid: [
            "Using dict for request bodies",
            "Missing response models",
            "No input validation"
        ],
        success_metrics: {
            compliance_rate: 0.95,
            adoption_count: 189
        }
    },
    {
        rule_id: "error_handling_001",
        rule_type: "error_handling",
        title: "Comprehensive Error Handling",
        description: "All functions must handle errors gracefully with informative messages",
        rule_text: "Use try-catch blocks with specific error types and user-friendly error messages",
        enforcement_level: "recommended",
        technology_stack: ["python", "javascript", "typescript", "universal"],
        priority: 3,
        rationale: "Improves user experience and debugging capabilities",
        examples: [
            "✅ Good: try:\\n    result = risky_operation()\\nexcept SpecificError as e:\\n    logger.error(f'Operation failed: {e}')\\n    return {'error': 'User-friendly message'}",
            "❌ Bad: result = risky_operation()  # No error handling"
        ],
        violations_to_avoid: [
            "Bare except clauses",
            "Silent failures",
            "Generic error messages"
        ],
        success_metrics: {
            compliance_rate: 0.87,
            adoption_count: 156
        }
    }
];

/**
 * Generate sample data
 */
async function generateSampleData() {
    printBanner();

    console.log('Welcome to the intelligent sample data generator!');
    console.log('This will create realistic sample data with real OpenAI embeddings');
    console.log('to test your revolutionary context engineering platform.\n');

    // Step 1: Check connections
    printStep(1, 'Environment Check', 'Verifying MongoDB and OpenAI connections');

    const connectionString = process.env.MONGODB_CONNECTION_STRING ||
        process.env.MDB_MCP_CONNECTION_STRING ||
        config.connectionString;

    if (!connectionString) {
        printError('MongoDB connection string not found!');
        console.log('   Please set MDB_MCP_CONNECTION_STRING environment variable');
        console.log('   💡 Copy-paste ready: export MDB_MCP_CONNECTION_STRING=\'your-mongodb-connection-string\'');
        console.log('   Just replace your-mongodb-connection-string with your actual Atlas connection string');
        process.exit(1);
    }
    printSuccess('MongoDB connection string found');

    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.MDB_MCP_OPENAI_API_KEY;
    if (!openaiApiKey) {
        printError('OpenAI API key not found!');
        console.log('   Please set MDB_MCP_OPENAI_API_KEY environment variable');
        console.log('   💡 Copy-paste ready: export MDB_MCP_OPENAI_API_KEY=\'your-openai-api-key\'');
        console.log('   Just replace your-openai-api-key with your actual OpenAI API key (starts with sk-)');
        process.exit(1);
    }
    printSuccess('OpenAI API key found');

    // Step 2: Explain what we'll generate
    printStep(2, 'Sample Data Overview', 'Understanding what we\'ll create for you');

    console.log('🎲 We\'ll generate intelligent sample data including:');
    console.log('   • 📋 Implementation patterns with success metrics');
    console.log('   • 📚 Research knowledge with validation status');
    console.log('   • 🧠 Real OpenAI embeddings for semantic search');
    console.log('   • 🔍 Filter fields for hybrid search testing');
    console.log('   • 📊 Realistic usage statistics and confidence scores\n');

    const proceed = await askYesNo('Ready to generate revolutionary sample data?');
    if (!proceed) {
        console.log('\n👋 Sample data generation cancelled. Run this script again when ready!');
        process.exit(0);
    }

    const client = new MongoClient(connectionString);
    
    try {
        // Step 3: Connect to database
        printStep(3, 'Database Connection', 'Connecting to your MongoDB Atlas cluster');

        console.log('   🔄 Connecting to MongoDB Atlas...');
        await client.connect();
        printSuccess('Connected to MongoDB Atlas successfully!');

        const db = client.db(DATABASE_NAME);

        // Test database access
        console.log('   🔄 Testing database access...');
        await db.admin().ping();
        printSuccess(`Database access confirmed: ${DATABASE_NAME}`);

        // Step 4: Generate implementation patterns
        printStep(4, 'Implementation Patterns', 'Creating intelligent patterns with real embeddings');

        console.log('🔧 Generating implementation patterns with AI embeddings...');
        const patternsCollection = db.collection('implementation_patterns');
        
        for (const pattern of SAMPLE_PATTERNS) {
            console.log(`   🔮 Generating embedding for: ${pattern.title}`);
            pattern.embedding = await generateEmbedding(`${pattern.title}\n${pattern.description}\n${pattern.code_snippet}`);
            pattern.created_at = new Date();
            pattern.updated_at = new Date();
            pattern.contributed_by = "sample_data_generator";
        }
        
        // Use upsert to handle duplicates gracefully
        const patternsResult = await upsertSampleData(patternsCollection, SAMPLE_PATTERNS, 'pattern_id');
        console.log(`   ✅ Generated ${patternsResult.insertedCount} new patterns, ${patternsResult.existingCount} already existed`);
        
        // Generate research knowledge
        console.log('\n📚 Generating research knowledge...');
        const researchCollection = db.collection('research_knowledge');
        
        for (const research of SAMPLE_RESEARCH) {
            console.log(`   🔮 Generating embedding for: ${research.title}`);
            research.embedding = await generateEmbedding(`${research.title}\n${research.key_insights.join(' ')}`);
            research.created_at = new Date();
            research.updated_at = new Date();
            research.last_verified = new Date();
        }
        
        // Use upsert to handle duplicates gracefully
        const researchResult = await upsertSampleData(researchCollection, SAMPLE_RESEARCH, 'knowledge_id');
        console.log(`   ✅ Generated ${researchResult.insertedCount} new research entries, ${researchResult.existingCount} already existed`);

        // Generate project rules
        console.log('\n📏 Generating project rules...');
        const rulesCollection = db.collection('project_rules');

        for (const rule of SAMPLE_RULES) {
            console.log(`   🔮 Generating embedding for: ${rule.title}`);
            rule.embedding = await generateEmbedding(`${rule.title}\n${rule.description}\n${rule.rule_text}`);
            rule.created_at = new Date();
            rule.updated_at = new Date();
            rule.last_reviewed = new Date();
        }

        // Use upsert to handle duplicates gracefully
        const rulesResult = await upsertSampleData(rulesCollection, SAMPLE_RULES, 'rule_id');
        console.log(`   ✅ Generated ${rulesResult.insertedCount} new rules, ${rulesResult.existingCount} already existed`);

        // Generate PRP templates (Original context engineering templates)
        console.log('\n📋 Generating PRP templates...');
        const templatesCollection = db.collection('prp_templates');

        const originalPRPTemplate = {
            template_name: "Universal PRP Template v3",
            description: "Original context engineering template enhanced with MongoDB intelligence",
            template_content: `## Purpose
MongoDB-powered template optimized for AI agents to implement features with comprehensive context intelligence, self-validation capabilities, and collaborative learning from the context engineering platform.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the MongoDB knowledge base
4. **Progressive Success**: Start simple, validate, then enhance
5. **Universal AI Rules**: Follow all rules in UNIVERSAL_AI_RULES.md
6. **MongoDB Intelligence**: Leverage collaborative learning and pattern discovery

---

## Goal
[What needs to be built - clear, specific, actionable]

## Why
[Business value and user impact]
[Integration with existing features]
[Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]
- [ ] [Quality gates that must pass]
- [ ] [Performance requirements]

## All Needed Context

### Documentation & References
\`\`\`yaml
# MUST READ - Critical documentation
- url: [specific documentation URL]
  why: [what specific information is needed]

- url: [API reference URL]
  why: [what methods/patterns to use]
\`\`\`

### Current Codebase Analysis
\`\`\`bash
# Run tree command to get project structure
tree -I 'node_modules|dist|.git' -L 3
\`\`\`

### MongoDB Intelligence Insights
\`\`\`yaml
SIMILAR_PATTERNS_FOUND: [number]
RESEARCH_KNOWLEDGE_AVAILABLE: [number]
CONFIDENCE_SCORE: [score]/10

RECOMMENDED_APPROACH:
[MongoDB-enhanced development patterns]
\`\`\`

## Implementation Blueprint

### Data Models and Structure
\`\`\`typescript
// Enhanced with MongoDB pattern insights
interface FeatureConfig {
    // Define core data structures
    // Ensure type safety and consistency
}
\`\`\`

### Implementation Tasks (MongoDB-Optimized)
\`\`\`yaml
Task 1: Setup and Configuration
  - Review MongoDB pattern insights
  - Set up development environment
  - Configure necessary dependencies

Task 2: Core Implementation
  - Implement main feature logic
  - Follow discovered patterns
  - Apply MongoDB intelligence recommendations

Task 3: Testing and Validation
  - Create comprehensive test suite
  - Implement validation loops
  - Ensure quality gates pass

Task 4: Integration and Documentation
  - Integrate with existing systems
  - Update documentation
  - Store implementation outcome in MongoDB for learning
\`\`\`

## Validation Loop (Enhanced from Original)

### Level 1: Syntax & Style
\`\`\`bash
# Universal validation commands
npm run lint        # or appropriate linter
npm run type-check  # or appropriate type checker
npm run format      # or appropriate formatter

# Expected: No errors. If errors, READ and fix.
\`\`\`

### Level 2: Unit Tests
\`\`\`bash
# Run comprehensive test suite
npm test           # or appropriate test command
npm run test:coverage  # ensure adequate coverage

# If failing: Read error, understand root cause, fix code, re-run
\`\`\`

### Level 3: Integration Test
\`\`\`bash
# Test the complete feature
npm run test:integration

# Manual verification
# [Add specific commands for this feature]
\`\`\`

## Final Validation Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] No type errors
- [ ] Manual test successful
- [ ] Error cases handled gracefully
- [ ] Documentation updated
- [ ] Implementation outcome stored in MongoDB for learning

## MongoDB Learning Integration
- [ ] Store implementation success/failure in implementation_outcomes collection
- [ ] Update pattern success metrics based on outcome
- [ ] Contribute learnings back to collaborative knowledge base

---

## Anti-Patterns to Avoid (MongoDB-Enhanced)
- ❌ Don't ignore MongoDB pattern recommendations
- ❌ Don't skip validation loops
- ❌ Don't forget to contribute learnings back
- ❌ Don't ignore existing patterns
- ❌ Don't forget error handling
- ❌ Don't skip documentation updates

## Confidence Score: [calculated]/10

Generated: [timestamp]
MongoDB Context Engineering Platform v1.0.1`,
            success_metrics: { avg_success_rate: 0.89, usage_count: 156 },
            feature_types: ["general", "backend", "frontend"],
            complexity_level: "intermediate",
            original_source: "PRPs/templates/prp_base.md (212 lines)",
            created_at: new Date(),
            updated_at: new Date()
        };

        console.log(`   🔮 Generating embedding for: ${originalPRPTemplate.template_name}`);
        originalPRPTemplate.embedding = await generateEmbedding(`${originalPRPTemplate.template_name}\n${originalPRPTemplate.description}\nPRP template validation loops MongoDB intelligence`);

        await templatesCollection.deleteMany({ template_name: "Universal PRP Template v3" });
        const templateResult = await templatesCollection.insertOne(originalPRPTemplate);
        console.log(`   ✅ Generated original PRP template with MongoDB enhancements`);

        // Verify vector search readiness
        console.log('\n🔍 Verifying vector search readiness...');
        await verifyVectorIndexReadiness(patternsCollection, 'patterns_vector_search');

        console.log('\n🎉 Sample data generation complete!');
        console.log('📊 Ready for testing context engineering tools');
        console.log('💡 If vector search queries return empty results initially, wait 5-10 minutes for Atlas indexing');
        
    } catch (error) {
        console.error('❌ Sample data generation failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
    generateSampleData().catch(console.error);
}

export { generateSampleData };
