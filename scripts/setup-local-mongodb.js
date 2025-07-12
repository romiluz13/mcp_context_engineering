#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Local MongoDB connection
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

async function setupLocalMongoDB() {
  console.log('🚀 Setting up local MongoDB for Context Engineering...\n');

  const client = new MongoClient(LOCAL_MONGODB_URI);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to local MongoDB');

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

    // Create MCP configuration file
    console.log('\n⚙️  Creating MCP configuration...');
    
    const mcpConfig = {
      mcpServers: {
        "mcp-context-engineering": {
          command: "mcp-context-engineering",
          env: {
            MDB_MCP_CONNECTION_STRING: `${LOCAL_MONGODB_URI}/${DB_NAME}`,
            MDB_MCP_OPENAI_API_KEY: process.env.OPENAI_API_KEY || "your-openai-api-key-here"
          }
        }
      }
    };

    const configPath = join(homedir(), '.config', 'mcp', 'mcp.json');
    const configDir = dirname(configPath);

    // Create directory if it doesn't exist
    if (!existsSync(configDir)) {
      const { mkdirSync } = await import('fs');
      mkdirSync(configDir, { recursive: true });
      console.log(`  ✅ Created config directory: ${configDir}`);
    }

    // Write configuration
    writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
    console.log(`  ✅ Created MCP config at: ${configPath}`);

    // Show summary
    console.log('\n🎉 Setup complete!\n');
    console.log('📋 Summary:');
    console.log(`  - Database: ${DB_NAME}`);
    console.log(`  - Collections: ${REQUIRED_COLLECTIONS.length} created`);
    console.log(`  - Connection: ${LOCAL_MONGODB_URI}/${DB_NAME}`);
    console.log(`  - MCP Config: ${configPath}`);
    
    console.log('\n🔧 Next steps:');
    console.log('  1. Make sure you have your OpenAI API key set');
    console.log('  2. Restart Cursor to load the new MCP configuration');
    console.log('  3. Use "memory-bank-initialize" to create your first project memory bank');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('\n⚠️  Warning: OPENAI_API_KEY not found in environment');
      console.log('  Please edit the MCP config file and add your OpenAI API key');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run setup
setupLocalMongoDB().catch(console.error); 