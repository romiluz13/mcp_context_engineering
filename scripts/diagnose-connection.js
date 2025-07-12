#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

console.log('🔍 MCP Context Engineering Connection Diagnostics\n');

// Check for MCP configuration files
console.log('📋 Checking MCP Configuration Files:');
const configPaths = [
  join(homedir(), '.cursor', 'mcp.json'),
  join(homedir(), '.claude', 'claude_desktop_config.json'),
  join(homedir(), '.config', 'mcp', 'mcp.json')
];

let foundConfig = null;
let connectionString = null;
let openaiKey = null;

for (const configPath of configPaths) {
  if (existsSync(configPath)) {
    console.log(`  ✅ Found: ${configPath}`);
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      const contextEngineering = config.mcpServers?.['context-engineering'] || 
                                config.mcpServers?.['mcp-context-engineering'];
      
      if (contextEngineering) {
        foundConfig = configPath;
        connectionString = contextEngineering.env?.MDB_MCP_CONNECTION_STRING;
        openaiKey = contextEngineering.env?.MDB_MCP_OPENAI_API_KEY;
        
        console.log(`    - Connection String: ${connectionString ? '✅ Found' : '❌ Missing'}`);
        console.log(`    - OpenAI API Key: ${openaiKey ? '✅ Found' : '❌ Missing'}`);
      }
    } catch (error) {
      console.log(`    ❌ Error reading config: ${error.message}`);
    }
  } else {
    console.log(`  ⚪ Not found: ${configPath}`);
  }
}

if (!foundConfig) {
  console.error('\n❌ No MCP configuration found!');
  console.log('\n💡 Create one of these files with your configuration:');
  console.log('  - ~/.cursor/mcp.json (for Cursor)');
  console.log('  - ~/.claude/claude_desktop_config.json (for Claude Desktop)');
  process.exit(1);
}

if (!connectionString) {
  console.error('\n❌ No MongoDB connection string found in configuration!');
  process.exit(1);
}

// Test MongoDB connection
console.log('\n🔌 Testing MongoDB Connection:');
console.log(`  Connection: ${connectionString.substring(0, 30)}...`);

const isAtlas = connectionString.includes('mongodb+srv://') || connectionString.includes('mongodb.net');
console.log(`  Type: ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}`);

async function testConnection() {
  const client = new MongoClient(connectionString);
  
  try {
    console.log('  Connecting...');
    await client.connect();
    console.log('  ✅ Connected successfully!');
    
    // Test database access
    const db = client.db('context_engineering');
    const collections = await db.listCollections().toArray();
    console.log(`  ✅ Found ${collections.length} collections`);
    
    if (collections.length > 0) {
      console.log('  Collections:', collections.map(c => c.name).join(', '));
    }
    
    // Test write permission
    try {
      const testCollection = db.collection('_connection_test');
      await testCollection.insertOne({ test: true, timestamp: new Date() });
      await testCollection.deleteOne({ test: true });
      console.log('  ✅ Write permissions verified');
    } catch (error) {
      console.log('  ⚠️  Write test failed:', error.message);
    }
    
  } catch (error) {
    console.error('  ❌ Connection failed:', error.message);
    
    if (error.message.includes('Server selection timed out')) {
      console.log('\n💡 Connection Timeout - Possible Solutions:');
      
      if (isAtlas) {
        console.log('\n  For MongoDB Atlas:');
        console.log('  1. Check IP Whitelist:');
        console.log('     - Go to MongoDB Atlas Dashboard');
        console.log('     - Navigate to Network Access');
        console.log('     - Add your current IP or use 0.0.0.0/0 for all IPs');
        
        // Get current IP
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          console.log(`     - Your current IP: ${data.ip}`);
        } catch (e) {
          console.log('     - Could not detect your IP');
        }
        
        console.log('\n  2. Verify credentials in connection string');
        console.log('  3. Check if cluster is paused or terminated');
      } else {
        console.log('\n  For Local MongoDB:');
        console.log('  1. Check if MongoDB is running:');
        console.log('     brew services list | grep mongodb');
        console.log('  2. Start MongoDB if needed:');
        console.log('     brew services start mongodb-community');
      }
    }
  } finally {
    await client.close();
  }
}

// Check environment
console.log('\n🌍 Environment Check:');
console.log(`  Node.js: ${process.version}`);
console.log(`  Platform: ${process.platform}`);
console.log(`  OpenAI Key: ${openaiKey ? '✅ Configured' : '❌ Missing'}`);

// Run the test
console.log('\n🚀 Running connection test...\n');
testConnection().then(() => {
  console.log('\n✅ Diagnostics complete!');
  
  if (openaiKey && connectionString) {
    console.log('\n🎉 Your MCP Context Engineering setup appears to be configured correctly!');
    console.log('\n🔧 Next steps:');
    console.log('  1. Restart Cursor/Claude Desktop');
    console.log('  2. Use the health-check tool to verify MCP is working');
    console.log('  3. Initialize a memory bank with memory-bank-initialize');
  }
}).catch(error => {
  console.error('\n❌ Diagnostic failed:', error);
  process.exit(1);
}); 