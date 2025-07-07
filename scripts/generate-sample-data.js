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
        console.log('   Example: export MDB_MCP_CONNECTION_STRING="mongodb+srv://..."');
        process.exit(1);
    }
    printSuccess('MongoDB connection string found');

    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.MDB_MCP_OPENAI_API_KEY;
    if (!openaiApiKey) {
        printError('OpenAI API key not found!');
        console.log('   Please set MDB_MCP_OPENAI_API_KEY environment variable');
        console.log('   Example: export MDB_MCP_OPENAI_API_KEY="sk-..."');
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
        
        await patternsCollection.deleteMany({ contributed_by: "sample_data_generator" });
        const patternsResult = await patternsCollection.insertMany(SAMPLE_PATTERNS);
        console.log(`   ✅ Generated ${patternsResult.insertedCount} implementation patterns`);
        
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
        
        await researchCollection.deleteMany({ knowledge_id: { $in: SAMPLE_RESEARCH.map(r => r.knowledge_id) } });
        const researchResult = await researchCollection.insertMany(SAMPLE_RESEARCH);
        console.log(`   ✅ Generated ${researchResult.insertedCount} research knowledge entries`);
        
        console.log('\n🎉 Sample data generation complete!');
        console.log('📊 Ready for testing context engineering tools');
        
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
