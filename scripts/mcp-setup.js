#!/usr/bin/env node

/**
 * 🚀 MCP Context Engineering - Revolutionary Setup
 * 
 * ONE PERFECT SETUP that matches exactly what our MCP server needs.
 * No confusion, no legacy scripts, just what works.
 * 
 * Creates the exact collections and indexes that our MCP tools expect.
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

const connectionString = process.env.MDB_MCP_CONNECTION_STRING;
const openaiApiKey = process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

console.log('🚀 MCP Context Engineering - Revolutionary Setup\n');

if (!connectionString) {
    console.error('❌ MDB_MCP_CONNECTION_STRING environment variable is required');
    console.error('💡 Get MongoDB Atlas free: https://cloud.mongodb.com/');
    console.error('📖 Format: mongodb+srv://username:password@cluster.mongodb.net/');
    process.exit(1);
}

if (!openaiApiKey) {
    console.error('❌ OpenAI API key is required for embeddings');
    console.error('💡 Set MDB_MCP_OPENAI_API_KEY or OPENAI_API_KEY in your environment');
    console.error('📖 Get your key: https://platform.openai.com/api-keys');
    process.exit(1);
}

async function revolutionarySetup() {
    const client = new MongoClient(connectionString);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
        
        const db = client.db('context_engineering');
        
        // EXACT collections our MCP server expects (from src/index.ts line 248)
        console.log('📚 Creating MCP collections...');
        
        const requiredCollections = [
            'implementation_patterns',  // Personal pattern library
            'project_rules',           // Project constitution rules
            'research_knowledge',      // Research methodology data
            'prp_templates',          // PRP generation templates
            'successful_prps',        // Successful implementation records
            'discovered_gotchas',     // Known issues and solutions
            'memory_banks',           // Project memory storage
            'memory_templates',       // Memory bank templates
            'memory_patterns'         // Cross-project patterns
        ];
        
        for (const collectionName of requiredCollections) {
            try {
                await db.createCollection(collectionName);
                console.log(`✅ Created: ${collectionName}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️  Exists: ${collectionName}`);
                } else {
                    throw error;
                }
            }
        }
        
        // EXACT indexes our MCP server creates (from src/index.ts line 267)
        console.log('\n🔍 Creating performance indexes...');
        
        await db.collection('implementation_patterns').createIndex({ technology_stack: 1 });
        await db.collection('memory_banks').createIndex({ project_name: 1 }, { unique: true });
        await db.collection('memory_patterns').createIndex({ pattern_type: 1, success_rate: -1 });
        
        console.log('✅ Performance indexes created');
        
        // Test OpenAI connection
        console.log('\n🤖 Testing OpenAI connection...');
        
        try {
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: openaiApiKey });
            
            await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: "test connection"
            });
            
            console.log('✅ OpenAI connection successful');
        } catch (error) {
            console.error('❌ OpenAI connection failed:', error.message);
            console.error('💡 Check your API key and try again');
            process.exit(1);
        }
        
        // Success summary
        console.log('\n🎉 MCP Context Engineering Setup Complete!\n');
        console.log('📊 What we created:');
        console.log(`   • Database: context_engineering`);
        console.log(`   • Collections: ${requiredCollections.length} MCP-ready collections`);
        console.log(`   • Indexes: Performance-optimized`);
        console.log(`   • OpenAI: Connection verified\n`);
        
        console.log('🚀 Next steps:');
        console.log('   1. Configure MCP in your AI assistant');
        console.log('   2. Start using: "Help me build [feature] using MongoDB Context Engineering"');
        console.log('   3. Your personal pattern library will grow automatically!\n');
        
        console.log('📖 Documentation: https://github.com/romiluz13/mcp_context_engineering');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\n💡 Common solutions:');
        console.error('   • Check your MongoDB connection string');
        console.error('   • Verify network connectivity');
        console.error('   • Ensure MongoDB Atlas cluster is running');
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Run the revolutionary setup
revolutionarySetup().catch(console.error);
