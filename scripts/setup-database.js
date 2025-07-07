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
 * Vector search indexes (for Phase 2)
 * These will be created manually in MongoDB Atlas UI for now
 */
const VECTOR_SEARCH_INDEXES = {
    project_rules: {
        name: "rules_vector_index",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536,
                    similarity: "cosine"
                },
                { type: "filter", path: "technology_stack" },
                { type: "filter", path: "rule_type" },
                { type: "filter", path: "enforcement_level" }
            ]
        }
    },
    implementation_patterns: {
        name: "patterns_vector_index", 
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding", 
                    numDimensions: 1536,
                    similarity: "cosine"
                },
                { type: "filter", path: "pattern_type" },
                { type: "filter", path: "technology_stack" },
                { type: "filter", path: "success_metrics.success_rate" }
            ]
        }
    },
    prp_templates: {
        name: "templates_vector_index",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 1536, 
                    similarity: "cosine"
                },
                { type: "filter", path: "feature_types" },
                { type: "filter", path: "success_metrics.avg_success_rate" }
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
        
        // Display vector search index information
        console.log('\n🔮 Vector Search Indexes (Phase 2):');
        console.log('   These need to be created manually in MongoDB Atlas UI:');
        for (const [collectionName, indexConfig] of Object.entries(VECTOR_SEARCH_INDEXES)) {
            console.log(`   📋 ${collectionName}: ${indexConfig.name}`);
        }
        console.log('   📖 See: https://docs.atlas.mongodb.com/atlas-vector-search/create-index/');
        
        console.log('\n🎉 Database setup complete!');
        console.log(`📊 Database: ${DATABASE_NAME}`);
        console.log(`🔗 Connection: ${connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        
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
