#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default configurations
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'context_engineering';

// Required collections
const REQUIRED_COLLECTIONS = [
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

async function setupMongoDB(connectionString) {
  console.log('🚀 Setting up MongoDB for Context Engineering...\n');

  const client = new MongoClient(connectionString);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Determine if it's Atlas or local
    const isAtlas = connectionString.includes('mongodb+srv://') || connectionString.includes('mongodb.net');
    console.log(`📍 Using ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}`);

    // Get database
    const db = client.db(DB_NAME);
    console.log(`✅ Using database: ${DB_NAME}`);

    // Create collections
    console.log('\n📦 Creating collections...');
    for (const collectionName of REQUIRED_COLLECTIONS) {
      try {
        await db.createCollection(collectionName);
        console.log(`  ✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`  ℹ️  Collection already exists: ${collectionName}`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes
    console.log('\n🔍 Creating indexes...');
    
    // Memory banks indexes
    const memoryBanks = db.collection('memory_banks');
    await memoryBanks.createIndex({ project_name: 1 }, { unique: true });
    console.log('  ✅ Created unique index on memory_banks.project_name');
    
    await memoryBanks.createIndex({ 
      "activeContext.urgency": 1, 
      "activeContext.startedAt": -1 
    });
    console.log('  ✅ Created compound index for active context');
    
    await memoryBanks.createIndex({ 
      "knownIssues.status": 1, 
      "knownIssues.priority": 1,
      "knownIssues.lastUpdated": -1
    });
    console.log('  ✅ Created compound index for known issues');
    
    // Pattern collection indexes
    await db.collection('implementation_patterns').createIndex({ 
      technology_stack: 1, 
      "success_metrics.success_rate": -1 
    });
    console.log('  ✅ Created index on implementation patterns');

    // Add some initial templates
    console.log('\n📝 Adding initial PRP templates...');
    const templates = db.collection('prp_templates');
    
    const defaultTemplate = {
      name: "Standard Feature Implementation",
      type: "feature",
      structure: {
        overview: true,
        requirements: true,
        implementation_steps: true,
        validation_loops: true,
        testing_strategy: true
      },
      complexity: "intermediate",
      created_at: new Date(),
      usage_count: 0
    };

    try {
      await templates.insertOne(defaultTemplate);
      console.log('  ✅ Added default PRP template');
    } catch (error) {
      if (error.code === 11000) {
        console.log('  ℹ️  Default template already exists');
      }
    }

    // Show summary
    console.log('\n🎉 Setup complete!\n');
    console.log('📋 Summary:');
    console.log(`  - Database: ${DB_NAME}`);
    console.log(`  - Collections: ${REQUIRED_COLLECTIONS.length} created/verified`);
    console.log(`  - Connection: ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}`);
    
    if (isAtlas) {
      console.log('\n⚠️  MongoDB Atlas Notes:');
      console.log('  - Make sure your IP address is whitelisted in Atlas');
      console.log('  - Vector search indexes must be created manually in Atlas UI');
      console.log('  - See docs/vector-search-setup.md for Atlas vector search setup');
    }
    
    console.log('\n🔧 Next steps:');
    console.log('  1. Make sure your MCP configuration has the correct connection string');
    console.log('  2. Ensure your OpenAI API key is set in the MCP config');
    console.log('  3. Restart Cursor/Claude Desktop to load the configuration');
    console.log('  4. Use "memory-bank-initialize" to create your first project memory bank');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    if (error.message.includes('Server selection timed out')) {
      console.error('\n💡 Connection timeout - possible causes:');
      console.error('  - For Atlas: Your IP address may not be whitelisted');
      console.error('  - For local: MongoDB service may not be running');
      console.error('  - Network connectivity issues');
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let connectionString = LOCAL_MONGODB_URI;

// Check for connection string argument
if (args.length > 0 && args[0].startsWith('mongodb')) {
  connectionString = args[0];
} else if (process.env.MDB_MCP_CONNECTION_STRING) {
  connectionString = process.env.MDB_MCP_CONNECTION_STRING;
} else {
  console.log('📌 No connection string provided, using local MongoDB');
  console.log('   To use MongoDB Atlas, run:');
  console.log('   node scripts/setup-local-mongodb.js "mongodb+srv://..."');
  console.log('');
}

// Run setup
setupMongoDB(connectionString).catch(console.error); 