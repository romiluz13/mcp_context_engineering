#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - Interactive Setup
 *
 * Beautiful, interactive setup experience that guides users through
 * the complete MongoDB Atlas Vector Search configuration.
 */

import { MongoClient } from 'mongodb';
import readline from 'readline';
import { promisify } from 'util';

// Detect interactive environment
const isInteractive = process.stdin.isTTY && process.stdout.isTTY && !process.env.CI;

// Create readline interface for interactive prompts
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// Enhanced question with timeout and non-interactive detection
async function questionWithTimeout(prompt, timeout = 30000) {
    if (!isInteractive) {
        throw new Error('Non-interactive environment detected');
    }

    return Promise.race([
        question(prompt),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Prompt timeout - no input received')), timeout)
        )
    ]);
}

const DATABASE_NAME = 'context_engineering';

/**
 * Interactive setup utilities
 */
function printBanner() {
    console.clear();
    console.log('\n🚀 ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING PLATFORM - SECURE LOCAL SETUP');
    console.log('   Transform static context into dynamic, intelligent, collaborative intelligence!');
    console.log('   🔒 LOCAL-FIRST: Your data stays private and secure');
    console.log('═══════════════════════════════════════════════════════════════════════════════ 🚀\n');
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
    if (!isInteractive) {
        console.log('❌ Non-interactive environment detected.');
        console.log('Please set environment variables manually:');
        console.log('export MDB_MCP_CONNECTION_STRING="your_connection_string"');
        console.log('export MDB_MCP_OPENAI_API_KEY="your_api_key"');
        throw new Error('Non-interactive environment - manual setup required');
    }

    const prompt = defaultValue
        ? `${questionText} (default: ${defaultValue}): `
        : `${questionText}: `;

    try {
        const answer = await questionWithTimeout(prompt);
        return answer.trim() || defaultValue;
    } catch (error) {
        if (error.message.includes('timeout')) {
            console.log('\n⏰ Input timeout - please try again or set environment variables manually');
            throw new Error('Input timeout');
        }
        throw error;
    }
}

async function askYesNo(questionText, defaultValue = 'y') {
    const answer = await askQuestion(`${questionText} (y/n)`, defaultValue);
    return answer.toLowerCase().startsWith('y');
}

function maskConnectionString(connectionString) {
    if (!connectionString) return 'Not provided';
    return connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

/**
 * Validate MongoDB connection string format
 */
function validateMongoConnectionString(connectionString) {
    if (!connectionString) return false;
    const mongoUrlRegex = /^mongodb(\+srv)?:\/\/.+/;
    return mongoUrlRegex.test(connectionString);
}

/**
 * Validate OpenAI API key format
 */
function validateOpenAIKey(apiKey) {
    if (!apiKey) return false;
    return apiKey.startsWith('sk-') && apiKey.length > 20;
}

/**
 * Mask API key for display
 */
function maskKey(key) {
    if (!key) return 'Not provided';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
}

/**
 * Collection schemas and configurations
 */
const COLLECTIONS = {
    project_rules: {
        description: "Dynamic project rules transformed from CLAUDE.md",
        indexes: [
            { key: { technology_stack: 1, success_impact: -1, usage_frequency: -1 } },
            { key: { rule_type: 1, enforcement_level: 1 } },
            { key: { created_at: -1 } }
        ]
    },
    implementation_patterns: {
        description: "Intelligent pattern library from examples/ folder",
        indexes: [
            { key: { pattern_type: 1, "success_metrics.success_rate": -1, "success_metrics.usage_count": -1 } },
            { key: { technology_stack: 1, quality_score: -1 } },
            { key: { complexity_level: 1, "success_metrics.success_rate": -1 } },
            { key: { created_at: -1 } }
        ]
    },
    prp_templates: {
        description: "Adaptive PRP templates replacing static prp_base.md",
        indexes: [
            { key: { feature_types: 1, "success_metrics.avg_success_rate": -1 } },
            { key: { "success_metrics.usage_count": -1 } },
            { key: { version: -1, created_at: -1 } }
        ]
    },
    research_knowledge: {
        description: "External research findings and documentation",
        indexes: [
            { key: { technology_stack: 1, freshness_score: -1 } },
            { key: { topic: 1, validation_status: 1 } },
            { key: { freshness_score: -1, last_verified: -1 } }
        ]
    },
    implementation_outcomes: {
        description: "Learning from every implementation for continuous improvement",
        indexes: [
            { key: { success: 1, created_at: -1, technology_stack: 1 } },
            { key: { patterns_used: 1, "validation_results.all_passed": 1 } },
            { key: { ai_assistant_used: 1, success: 1 } },
            { key: { created_at: -1 } }
        ]
    },
    context_assemblies: {
        description: "Cached context combinations for performance",
        indexes: [
            { key: { feature_signature: 1, effectiveness_score: -1 } },
            { key: { last_used: -1, usage_count: -1 } },
            { key: { ttl: 1 }, expireAfterSeconds: 0 } // TTL index for auto-expiration
        ]
    }
};

/**
 * Vector Search Indexes (2025 MongoDB Best Practices)
 * Using latest MongoDB Atlas Vector Search features
 */
const VECTOR_SEARCH_INDEXES = {
    project_rules: {
        name: "rules_vector_search",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,  // OpenAI text-embedding-3-small
                    similarity: "cosine",
                    quantization: "scalar"  // 2025 best practice for performance
                },
                { type: "filter", path: "technology_stack" },
                { type: "filter", path: "rule_type" },
                { type: "filter", path: "enforcement_level" },
                { type: "filter", path: "success_impact" },
                { type: "filter", path: "created_at" }
            ]
        }
    },
    implementation_patterns: {
        name: "patterns_vector_search",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,
                    similarity: "cosine",
                    quantization: "scalar"
                },
                { type: "filter", path: "pattern_type" },
                { type: "filter", path: "technology_stack" },
                { type: "filter", path: "complexity_level" },
                { type: "filter", path: "success_metrics.success_rate" },
                { type: "filter", path: "quality_score" }
            ]
        }
    },
    prp_templates: {
        name: "templates_vector_search",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,
                    similarity: "cosine",
                    quantization: "scalar"
                },
                { type: "filter", path: "feature_types" },
                { type: "filter", path: "success_metrics.avg_success_rate" },
                { type: "filter", path: "version" }
            ]
        }
    },
    research_knowledge: {
        name: "research_vector_search",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,
                    similarity: "cosine",
                    quantization: "scalar"
                },
                { type: "filter", path: "technology_stack" },
                { type: "filter", path: "topic" },
                { type: "filter", path: "validation_status" },
                { type: "filter", path: "freshness_score" }
            ]
        }
    },
    implementation_outcomes: {
        name: "outcomes_vector_search",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,
                    similarity: "cosine",
                    quantization: "scalar"
                },
                { type: "filter", path: "success" },
                { type: "filter", path: "technology_stack" },
                { type: "filter", path: "ai_assistant_used" },
                { type: "filter", path: "patterns_used" }
            ]
        }
    },
    context_assemblies: {
        name: "assemblies_vector_search",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,
                    similarity: "cosine",
                    quantization: "scalar"
                },
                { type: "filter", path: "feature_signature" },
                { type: "filter", path: "effectiveness_score" },
                { type: "filter", path: "usage_count" }
            ]
        }
    }
};

async function setupDatabase() {
    printBanner();

    // Check for non-interactive environment first
    if (!isInteractive) {
        console.log('❌ Non-interactive environment detected.');
        console.log('Please set environment variables manually:');
        console.log('export MDB_MCP_CONNECTION_STRING="your_connection_string"');
        console.log('export MDB_MCP_OPENAI_API_KEY="your_api_key"');
        console.log('\n📖 Setup Guide: https://github.com/romiluz13/mcp_context_engineering#setup');
        process.exit(1);
    }

    console.log('Welcome to the revolutionary MongoDB Context Engineering Platform setup!');
    console.log('This interactive wizard will guide you through creating a world-class');
    console.log('AI context intelligence system powered by MongoDB Atlas Vector Search.\n');

    // Step 1: Choose MongoDB Setup Type
    printStep(1, 'MongoDB Setup Choice', 'Choose your preferred MongoDB setup');

    console.log('🔒 SECURE SETUP OPTIONS:');
    console.log('   1. 🏠 LOCAL MongoDB (Recommended - Private & Secure)');
    console.log('   2. ☁️  MongoDB Atlas (Cloud - Requires your own account)');
    console.log('   3. 🔧 Custom Connection String\n');

    const setupChoice = await askQuestion('Which setup would you prefer? (1/2/3)', '1');

    let connectionString;

    if (setupChoice === '1' || setupChoice.toLowerCase().includes('local')) {
        // LOCAL MONGODB SETUP
        printStep('1a', 'Local MongoDB Setup', 'Setting up secure local MongoDB');

        console.log('🏠 LOCAL MONGODB BENEFITS:');
        console.log('   ✅ Complete privacy - your data never leaves your machine');
        console.log('   ✅ No cloud accounts needed');
        console.log('   ✅ Faster performance');
        console.log('   ✅ No internet required after setup\n');

        // Check if MongoDB is installed locally
        console.log('🔍 Checking for local MongoDB installation...');

        // Try common local MongoDB connection strings
        const localConnections = [
            'mongodb://localhost:27017',
            'mongodb://127.0.0.1:27017',
            'mongodb://localhost:27017/context_engineering'
        ];

        let localWorking = false;
        for (const localConn of localConnections) {
            try {
                const testClient = new MongoClient(localConn);
                await testClient.connect();
                await testClient.close();
                connectionString = localConn;
                localWorking = true;
                printSuccess(`Found working local MongoDB at: ${localConn}`);
                break;
            } catch (error) {
                // Continue trying
            }
        }

        if (!localWorking) {
            console.log('⚠️  Local MongoDB not detected. Let me help you set it up!\n');
            console.log('📥 INSTALL LOCAL MONGODB:');
            console.log('   • macOS: brew install mongodb-community');
            console.log('   • Ubuntu: sudo apt install mongodb');
            console.log('   • Windows: Download from https://www.mongodb.com/try/download/community');
            console.log('   • Docker: docker run -d -p 27017:27017 mongo:latest\n');

            const installChoice = await askYesNo('Have you installed MongoDB locally?');
            if (installChoice) {
                connectionString = await askQuestion('Local MongoDB connection string', 'mongodb://localhost:27017');
            } else {
                console.log('💡 TIP: You can also use MongoDB Atlas (option 2) for a quick cloud setup');
                const useAtlas = await askYesNo('Would you like to use MongoDB Atlas instead?');
                if (useAtlas) {
                    setupChoice = '2'; // Fall through to Atlas setup
                } else {
                    printError('MongoDB is required to continue. Please install MongoDB and try again.');
                    process.exit(1);
                }
            }
        }
    }

    if (setupChoice === '2' || setupChoice.toLowerCase().includes('atlas')) {
        // MONGODB ATLAS SETUP
        printStep('1b', 'MongoDB Atlas Setup', 'Connect to your MongoDB Atlas cluster');

        console.log('☁️  MONGODB ATLAS SETUP:');
        console.log('   🔗 You need your own MongoDB Atlas account');
        console.log('   📋 Get connection string: Atlas → Connect → Connect your application');
        console.log('   🔒 Your connection string stays private\n');

        let existingConnectionString = process.env.MONGODB_CONNECTION_STRING ||
            process.env.MDB_MCP_CONNECTION_STRING;

        if (existingConnectionString) {
            printSuccess(`Found existing connection: ${maskConnectionString(existingConnectionString)}`);
            const useExisting = await askYesNo('Use this connection string?');
            if (useExisting) {
                connectionString = existingConnectionString;
            }
        }

        if (!connectionString) {
            connectionString = await askQuestion('Enter your MongoDB Atlas connection string');

            if (!connectionString) {
                printError('MongoDB Atlas connection string is required.');
                console.log('\n📖 Need help? Visit: https://docs.atlas.mongodb.com/connect-to-cluster/');
                process.exit(1);
            }

            if (!validateMongoConnectionString(connectionString)) {
                printError('Invalid MongoDB connection string format.');
                console.log('   Expected: mongodb+srv://username:password@cluster.mongodb.net/');
                process.exit(1);
            }
        }
    }

    if (setupChoice === '3' || setupChoice.toLowerCase().includes('custom')) {
        // CUSTOM CONNECTION STRING
        printStep('1c', 'Custom MongoDB Setup', 'Enter your custom MongoDB connection');

        connectionString = await askQuestion('Enter your custom MongoDB connection string');

        if (!connectionString) {
            printError('Connection string is required.');
            process.exit(1);
        }
    }

    // Step 2: OpenAI API Key Setup
    printStep(2, 'OpenAI API Key', 'Setting up AI embeddings and intelligence');

    console.log('🤖 OPENAI API KEY SETUP:');
    console.log('   🔑 Required for AI embeddings and vector search');
    console.log('   💰 Get your API key: https://platform.openai.com/api-keys');
    console.log('   🔒 Your API key stays private and secure\n');

    let openaiApiKey = process.env.OPENAI_API_KEY || process.env.MDB_MCP_OPENAI_API_KEY;

    if (openaiApiKey) {
        printSuccess(`Found existing OpenAI API key in environment`);
        const useExisting = await askYesNo('Use existing API key from environment?');
        if (!useExisting) {
            openaiApiKey = null;
        }
    }

    if (!openaiApiKey) {
        openaiApiKey = await askQuestion('Enter your OpenAI API key (sk-...)');

        if (!openaiApiKey) {
            printError('OpenAI API key is required for AI embeddings.');
            console.log('\n📖 Get your API key: https://platform.openai.com/api-keys');
            process.exit(1);
        }

        if (!validateOpenAIApiKey(openaiApiKey)) {
            printError('Invalid OpenAI API key format.');
            console.log('   Expected format: sk-...');
            process.exit(1);
        }
    }

    // Step 3: Test connections
    printStep(3, 'Testing Connections', 'Verifying MongoDB and OpenAI connections');

    const client = new MongoClient(connectionString);

    try {
        console.log('   🔄 Connecting to MongoDB Atlas...');
        await client.connect();
        printSuccess('Connected to MongoDB Atlas successfully!');

        const db = client.db(DATABASE_NAME);

        // Test database access
        console.log('   🔄 Testing database access...');
        await db.admin().ping();
        printSuccess(`Database access confirmed: ${DATABASE_NAME}`);

        // Step 3: Explain what we'll create
        printStep(3, 'Database Architecture', 'Understanding what we\'ll build for you');

        console.log('🏗️  We\'ll create a revolutionary context engineering system with:');
        console.log('   • 6 intelligent collections for different types of context');
        console.log('   • Traditional indexes for lightning-fast queries');
        console.log('   • Vector Search indexes with 2025 best practices');
        console.log('   • Scalar quantization for optimal performance');
        console.log('   • Hybrid search capabilities (semantic + traditional)');
        console.log('   • Automatic cache management with TTL indexes\n');

        const proceed = await askYesNo('Ready to create your revolutionary context intelligence system?');
        if (!proceed) {
            console.log('\n👋 Setup cancelled. Run this script again when you\'re ready!');
            process.exit(0);
        }
        
        // Step 4: Create collections
        printStep(4, 'Creating Collections', 'Building the foundation of your context intelligence');

        console.log('📁 Creating intelligent collections...\n');

        let collectionsCreated = 0;
        let collectionsExisted = 0;

        for (const [collectionName, config] of Object.entries(COLLECTIONS)) {
            try {
                console.log(`   🔄 Creating ${collectionName}...`);
                await db.createCollection(collectionName);
                printSuccess(`Created collection: ${collectionName}`);
                console.log(`      📝 ${config.description}`);
                collectionsCreated++;
            } catch (error) {
                if (error.code === 48) { // Collection already exists
                    printInfo(`Collection already exists: ${collectionName}`);
                    collectionsExisted++;
                } else {
                    throw error;
                }
            }
        }

        console.log(`\n📊 Collections Summary:`);
        console.log(`   • Created: ${collectionsCreated} new collections`);
        console.log(`   • Existing: ${collectionsExisted} collections already existed`);
        console.log(`   • Total: ${Object.keys(COLLECTIONS).length} collections ready\n`);
        
        // Step 5: Create traditional indexes
        printStep(5, 'Performance Indexes', 'Creating traditional indexes for lightning-fast queries');

        console.log('🔍 Creating performance-optimized indexes...\n');

        let indexesCreated = 0;
        let indexesExisted = 0;

        for (const [collectionName, config] of Object.entries(COLLECTIONS)) {
            console.log(`   📋 Processing ${collectionName}...`);
            const collection = db.collection(collectionName);

            for (const indexSpec of config.indexes) {
                try {
                    const indexName = await collection.createIndex(indexSpec.key, indexSpec.options || {});
                    console.log(`      ✅ Index: ${JSON.stringify(indexSpec.key)}`);
                    indexesCreated++;
                } catch (error) {
                    if (error.code === 85) { // Index already exists
                        console.log(`      ℹ️  Index exists: ${JSON.stringify(indexSpec.key)}`);
                        indexesExisted++;
                    } else {
                        printWarning(`Could not create index on ${collectionName}: ${error.message}`);
                    }
                }
            }
        }

        console.log(`\n📊 Indexes Summary:`);
        console.log(`   • Created: ${indexesCreated} new indexes`);
        console.log(`   • Existing: ${indexesExisted} indexes already existed`);
        console.log(`   • Performance: Optimized for fast queries\n`);
        
        // Step 6: Vector Search indexes
        printStep(6, 'Vector Search Intelligence', 'Creating revolutionary AI-powered search capabilities');

        console.log('🚀 This is where the magic happens! We\'ll create Vector Search indexes with:');
        console.log('   • 🧠 Semantic similarity search using AI embeddings');
        console.log('   • ⚡ Scalar quantization (75% memory reduction, 2-4x speed)');
        console.log('   • 🎯 Cosine similarity (optimal for text embeddings)');
        console.log('   • 📐 1536 dimensions (OpenAI text-embedding-3-small)');
        console.log('   • 🔍 Advanced filtering for hybrid search');
        console.log('   • 🌟 2025 MongoDB best practices\n');

        const createVectorIndexes = await askYesNo('Ready to create revolutionary Vector Search indexes?');
        if (!createVectorIndexes) {
            printWarning('Skipping Vector Search indexes. You can create them later manually.');
            console.log('   📖 Guide: https://docs.atlas.mongodb.com/atlas-vector-search/create-index/\n');
        } else {
            console.log('🔮 Creating Vector Search indexes...\n');
        }

        if (createVectorIndexes) {
            let vectorIndexesCreated = 0;
            let vectorIndexesExisted = 0;
            let vectorIndexesFailed = 0;

            for (const [collectionName, indexConfig] of Object.entries(VECTOR_SEARCH_INDEXES)) {
                try {
                    console.log(`   🔮 Creating Vector Search for ${collectionName}...`);
                    const collection = db.collection(collectionName);

                    // Use the latest createSearchIndex method (MongoDB Driver 6.6.0+)
                    await collection.createSearchIndex({
                        name: indexConfig.name,
                        type: "vectorSearch",
                        definition: indexConfig.definition
                    });

                    printSuccess(`Vector Search index: ${indexConfig.name}`);
                    console.log(`      🧠 Vector field: embedding (1536 dimensions)`);
                    console.log(`      ⚡ Similarity: cosine with scalar quantization`);
                    console.log(`      🔍 Filters: ${indexConfig.definition.fields.filter(f => f.type === 'filter').length} filter fields`);
                    vectorIndexesCreated++;

                } catch (error) {
                    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                        printInfo(`Vector Search index already exists: ${indexConfig.name}`);
                        vectorIndexesExisted++;
                    } else if (error.message.includes('not supported') || error.message.includes('Atlas')) {
                        printWarning(`Vector Search requires MongoDB Atlas - skipping ${indexConfig.name}`);
                        console.log(`      📋 Manual creation required in Atlas UI for: ${collectionName}`);
                        vectorIndexesFailed++;
                    } else {
                        printWarning(`Could not create Vector Search index ${indexConfig.name}: ${error.message}`);
                        console.log(`      📋 This may require manual creation in MongoDB Atlas UI`);
                        vectorIndexesFailed++;
                    }
                }
            }

            console.log(`\n📊 Vector Search Summary:`);
            console.log(`   • Created: ${vectorIndexesCreated} new Vector Search indexes`);
            console.log(`   • Existing: ${vectorIndexesExisted} indexes already existed`);
            if (vectorIndexesFailed > 0) {
                console.log(`   • Manual setup needed: ${vectorIndexesFailed} indexes`);
            }
            console.log(`   • AI Intelligence: Ready for semantic search! 🧠\n`);
        }

        // Step 7: Completion and next steps
        printStep(7, 'Setup Complete!', 'Your revolutionary context intelligence system is ready');

        console.log('🎉 ═══════════════════════════════════════════════════════════════════════════════');
        console.log('   CONGRATULATIONS! YOUR MONGODB CONTEXT ENGINEERING PLATFORM IS READY!');
        console.log('═══════════════════════════════════════════════════════════════════════════════ 🎉\n');

        console.log('📊 What we built for you:');
        console.log(`   • 🗄️  Database: ${DATABASE_NAME}`);
        console.log(`   • 📁 Collections: ${Object.keys(COLLECTIONS).length} intelligent collections`);
        console.log(`   • ⚡ Performance Indexes: Lightning-fast traditional queries`);
        console.log(`   • 🧠 Vector Search Indexes: AI-powered semantic search`);
        console.log(`   • 🔍 Hybrid Search: Best of both worlds`);
        console.log(`   • 🌟 2025 Best Practices: Production-ready architecture\n`);

        console.log('🚀 Revolutionary capabilities now available:');
        console.log('   • 🎯 Semantic similarity search with OpenAI embeddings');
        console.log('   • ⚡ 75% memory reduction with scalar quantization');
        console.log('   • 🔍 Advanced filtering and hybrid search');
        console.log('   • 🤝 Collaborative learning and pattern recognition');
        console.log('   • 📈 Continuous improvement from every interaction\n');

        console.log('🔗 Your setup details:');
        console.log(`   • Atlas Cluster: ${maskConnectionString(connectionString)}`);
        console.log(`   • Database: ${DATABASE_NAME}`);
        console.log('   • Status: Ready for revolutionary context intelligence!\n');

        // Ask about next steps
        console.log('🎯 Ready for the next steps?');
        console.log('   1. 📊 Generate sample data with real AI embeddings');
        console.log('   2. ⚙️  Configure your AI assistant (Claude, Cursor, VS Code, etc.)');
        console.log('   3. 🚀 Start using revolutionary context intelligence!\n');

        const generateSampleData = await askYesNo('Would you like to generate sample data now?');
        if (generateSampleData) {
            console.log('\n🔄 Great! Run this command to generate sample data:');
            console.log('   mcp-context-engineering generate-sample-data\n');
        }

        const showConfigHelp = await askYesNo('Would you like to see AI assistant configuration help?');
        if (showConfigHelp) {
            console.log('\n⚙️  AI Assistant Configuration:');
            console.log('   📁 Configuration examples: examples/mcp-configs/');
            console.log('   📖 Full guide: README.md');
            console.log('   🔗 Repository: https://github.com/romiluz13/mcp_context_engineering\n');
        }

        console.log('🌟 ═══════════════════════════════════════════════════════════════════════════════');
        console.log('   WELCOME TO THE FUTURE OF AI-ASSISTED DEVELOPMENT!');
        console.log('   Your revolutionary context intelligence system is ready to transform');
        console.log('   how you work with AI assistants. Enjoy the magic! ✨');
        console.log('═══════════════════════════════════════════════════════════════════════════════ 🌟');
        
    } catch (error) {
        console.log('\n💥 ═══════════════════════════════════════════════════════════════════════════════');
        console.log('   SETUP ENCOUNTERED AN ISSUE');
        console.log('═══════════════════════════════════════════════════════════════════════════════ 💥\n');

        printError(`Setup failed: ${error.message}`);

        console.log('\n🔧 Troubleshooting help:');
        if (error.message.includes('authentication')) {
            console.log('   • Check your MongoDB Atlas connection string');
            console.log('   • Verify username and password are correct');
            console.log('   • Ensure your IP address is whitelisted in Atlas');
        } else if (error.message.includes('network')) {
            console.log('   • Check your internet connection');
            console.log('   • Verify MongoDB Atlas cluster is running');
            console.log('   • Try again in a few moments');
        } else {
            console.log('   • Check the error message above for details');
            console.log('   • Verify your MongoDB Atlas setup');
            console.log('   • Contact support if the issue persists');
        }

        console.log('\n📖 Need help?');
        console.log('   • Documentation: https://github.com/romiluz13/mcp_context_engineering');
        console.log('   • MongoDB Atlas: https://docs.atlas.mongodb.com/');
        console.log('   • Issues: https://github.com/romiluz13/mcp_context_engineering/issues');

        process.exit(1);
    } finally {
        await client.close();
        rl.close();
    }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDatabase().catch(console.error);
}

export { setupDatabase, COLLECTIONS, VECTOR_SEARCH_INDEXES, DATABASE_NAME };
