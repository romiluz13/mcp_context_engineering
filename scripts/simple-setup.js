#!/usr/bin/env node

/**
 * MongoDB Context Engineering - Simple Non-Interactive Setup
 * 
 * Sets up MongoDB collections and indexes using environment variables.
 * No interactive prompts - perfect for programmatic use.
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

const connectionString = process.env.MDB_MCP_CONNECTION_STRING;
const openaiApiKey = process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

console.log('🚀 MongoDB Context Engineering - Simple Setup\n');

if (!connectionString) {
    console.error('❌ MDB_MCP_CONNECTION_STRING environment variable is required');
    console.error('💡 Set it in your environment or .env file');
    console.error('📖 Format: mongodb+srv://username:password@cluster.mongodb.net/');
    process.exit(1);
}

if (!openaiApiKey) {
    console.error('❌ OpenAI API key is required for embeddings');
    console.error('💡 Set MDB_MCP_OPENAI_API_KEY or OPENAI_API_KEY in your environment');
    console.error('📖 Get your key: https://platform.openai.com/api-keys');
    process.exit(1);
}

async function simpleSetup() {
    const client = new MongoClient(connectionString);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('context_engineering');
        
        // Create collections
        console.log('📚 Creating collections...');
        
        const collections = [
            'templates',
            'successful_prps', 
            'implementation_patterns',
            'discovered_gotchas',
            'validation_approaches'
        ];
        
        for (const collectionName of collections) {
            try {
                await db.createCollection(collectionName);
                console.log(`✅ Created collection: ${collectionName}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️  Collection already exists: ${collectionName}`);
                } else {
                    throw error;
                }
            }
        }
        
        // Create indexes
        console.log('🔍 Creating indexes...');
        
        await db.collection('successful_prps').createIndex({ 'feature_type': 1, 'success_rate': -1 });
        await db.collection('implementation_patterns').createIndex({ 'pattern_name': 1, 'success_rate': -1 });
        await db.collection('discovered_gotchas').createIndex({ 'technology_stack': 1, 'frequency': -1 });
        
        console.log('✅ Created indexes');
        
        // Test OpenAI connection
        console.log('🤖 Testing OpenAI connection...');
        
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
        
        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📋 What was created:');
        console.log('   📚 MongoDB collections for storing collaborative intelligence');
        console.log('   🔍 Database indexes for efficient querying');
        console.log('   🤖 Verified OpenAI API connection');
        
        console.log('\n🚀 Next steps:');
        console.log('   1. Run: node scripts/initialize-real-data.js');
        console.log('   2. Configure MCP in your AI assistant');
        console.log('   3. Start using: "Help me build X using MongoDB Context Engineering"');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        
        if (error.message.includes('authentication')) {
            console.error('💡 Check your MongoDB connection string and credentials');
        } else if (error.message.includes('network')) {
            console.error('💡 Check your internet connection and MongoDB Atlas status');
        }
        
        process.exit(1);
    } finally {
        await client.close();
    }
}

simpleSetup();
