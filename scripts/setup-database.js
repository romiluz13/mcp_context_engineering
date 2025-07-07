#!/usr/bin/env node

const { MongoClient } = require('mongodb');

async function setupDatabase() {
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
    
    console.log('📊 Creating collections and indexes...');
    
    // Create collections
    const collections = [
      'project_rules',
      'implementation_patterns', 
      'prp_templates',
      'research_knowledge',
      'implementation_outcomes',
      'context_assemblies'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    
    // Project rules indexes
    await db.collection('project_rules').createIndexes([
      { key: { rule_type: 1, enforcement_level: 1 } },
      { key: { technology_stack: 1 } },
      { key: { success_impact: -1 } },
      { key: { rule_id: 1 }, unique: true }
    ]);
    
    // Implementation patterns indexes
    await db.collection('implementation_patterns').createIndexes([
      { key: { pattern_type: 1, complexity_level: 1 } },
      { key: { technology_stack: 1 } },
      { key: { success_rate: -1 } },
      { key: { pattern_id: 1 }, unique: true }
    ]);
    
    // PRP templates indexes
    await db.collection('prp_templates').createIndexes([
      { key: { complexity_level: 1, success_rate: -1 } },
      { key: { template_id: 1 }, unique: true }
    ]);
    
    // Research knowledge indexes
    await db.collection('research_knowledge').createIndexes([
      { key: { source: 1, freshness_score: -1 } },
      { key: { research_id: 1 }, unique: true }
    ]);
    
    // Implementation outcomes indexes
    await db.collection('implementation_outcomes').createIndexes([
      { key: { pattern_id: 1, success: 1 } },
      { key: { created_at: -1 } }
    ]);
    
    // Context assemblies indexes (for caching)
    await db.collection('context_assemblies').createIndexes([
      { key: { query_hash: 1 }, unique: true },
      { key: { created_at: 1 }, expireAfterSeconds: 86400 } // 24 hour TTL
    ]);
    
    console.log('✅ All indexes created successfully');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupDatabase();
