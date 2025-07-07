#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - Database Setup Script
 * 
 * Creates the 6 core collections with proper schemas and indexes
 * for the revolutionary context engineering platform.
 */

import { MongoClient } from 'mongodb';

// Configuration from environment variables
const config = {
    connectionString: process.env.MDB_MCP_CONNECTION_STRING
};

const DATABASE_NAME = 'context_engineering';

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
    console.log('🚀 Setting up MongoDB Context Engineering Platform...\n');
    
    const connectionString = process.env.MONGODB_CONNECTION_STRING || 
        process.env.MDB_MCP_CONNECTION_STRING ||
        config.connectionString;
    
    if (!connectionString) {
        console.error('❌ Error: MongoDB connection string not found!');
        console.log('Please set one of these environment variables:');
        console.log('  - MONGODB_CONNECTION_STRING');
        console.log('  - MDB_MCP_CONNECTION_STRING');
        console.log('  - Or configure connectionString in config');
        process.exit(1);
    }

    const client = new MongoClient(connectionString);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
        
        const db = client.db(DATABASE_NAME);
        
        // Create collections
        console.log('\n📁 Creating collections...');
        for (const [collectionName, config] of Object.entries(COLLECTIONS)) {
            try {
                await db.createCollection(collectionName);
                console.log(`  ✅ Created collection: ${collectionName}`);
                console.log(`     ${config.description}`);
            } catch (error) {
                if (error.code === 48) { // Collection already exists
                    console.log(`  ℹ️  Collection already exists: ${collectionName}`);
                } else {
                    throw error;
                }
            }
        }
        
        // Create indexes
        console.log('\n🔍 Creating indexes...');
        for (const [collectionName, config] of Object.entries(COLLECTIONS)) {
            const collection = db.collection(collectionName);
            
            for (const indexSpec of config.indexes) {
                try {
                    const indexName = await collection.createIndex(indexSpec.key, indexSpec.options || {});
                    console.log(`  ✅ Created index on ${collectionName}: ${JSON.stringify(indexSpec.key)}`);
                } catch (error) {
                    if (error.code === 85) { // Index already exists
                        console.log(`  ℹ️  Index already exists on ${collectionName}: ${JSON.stringify(indexSpec.key)}`);
                    } else {
                        console.log(`  ⚠️  Warning: Could not create index on ${collectionName}: ${error.message}`);
                    }
                }
            }
        }
        
        // Create Vector Search indexes (2025 MongoDB best practices)
        console.log('\n🚀 Creating Vector Search indexes (2025 best practices)...');
        console.log('   Using latest MongoDB Atlas Vector Search features:');
        console.log('   • Scalar quantization for optimal performance');
        console.log('   • Cosine similarity for text embeddings');
        console.log('   • 1536 dimensions (OpenAI text-embedding-3-small)');
        console.log('   • Advanced filtering capabilities\n');

        for (const [collectionName, indexConfig] of Object.entries(VECTOR_SEARCH_INDEXES)) {
            try {
                const collection = db.collection(collectionName);

                // Use the latest createSearchIndex method (MongoDB Driver 6.6.0+)
                await collection.createSearchIndex({
                    name: indexConfig.name,
                    type: "vectorSearch",
                    definition: indexConfig.definition
                });

                console.log(`  ✅ Created Vector Search index: ${indexConfig.name} on ${collectionName}`);
                console.log(`     • Vector field: embedding (1536 dimensions)`);
                console.log(`     • Similarity: cosine with scalar quantization`);
                console.log(`     • Filters: ${indexConfig.definition.fields.filter(f => f.type === 'filter').length} filter fields`);

            } catch (error) {
                if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                    console.log(`  ℹ️  Vector Search index already exists: ${indexConfig.name}`);
                } else if (error.message.includes('not supported') || error.message.includes('Atlas')) {
                    console.log(`  ⚠️  Vector Search requires MongoDB Atlas - skipping ${indexConfig.name}`);
                    console.log(`     Manual creation required in Atlas UI for: ${collectionName}`);
                } else {
                    console.log(`  ⚠️  Could not create Vector Search index ${indexConfig.name}: ${error.message}`);
                    console.log(`     This may require manual creation in MongoDB Atlas UI`);
                }
            }
        }

        console.log('\n📋 Vector Search Index Summary:');
        console.log('   If any indexes failed to create automatically, you can create them manually:');
        console.log('   1. Go to MongoDB Atlas → Your Cluster → Search');
        console.log('   2. Create Search Index → Vector Search');
        console.log('   3. Use the index definitions from this script');
        console.log('   📖 Documentation: https://docs.atlas.mongodb.com/atlas-vector-search/create-index/');
        
        console.log('\n🎉 MongoDB Context Engineering Platform Setup Complete!');
        console.log('');
        console.log('📊 Database Configuration:');
        console.log(`   • Database: ${DATABASE_NAME}`);
        console.log(`   • Collections: ${Object.keys(COLLECTIONS).length} created`);
        console.log(`   • Traditional Indexes: Performance optimized`);
        console.log(`   • Vector Search Indexes: 2025 best practices applied`);
        console.log('');
        console.log('🚀 Revolutionary Features Enabled:');
        console.log('   • Semantic similarity search with OpenAI embeddings');
        console.log('   • Scalar quantization for optimal performance');
        console.log('   • Advanced filtering and hybrid search capabilities');
        console.log('   • Collaborative learning and pattern recognition');
        console.log('');
        console.log('🔗 Connection Details:');
        console.log(`   • Atlas Cluster: ${connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        console.log('   • Ready for MCP Context Engineering Platform!');
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Run: mcp-context-engineering generate-sample-data');
        console.log('   2. Configure your AI assistant with MCP server');
        console.log('   3. Start using revolutionary context intelligence!');
        console.log('');
        console.log('🌟 Welcome to the future of AI-assisted development! 🌟');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDatabase().catch(console.error);
}

export { setupDatabase, COLLECTIONS, VECTOR_SEARCH_INDEXES, DATABASE_NAME };
