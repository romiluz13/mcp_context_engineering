#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import VoyageAI from 'voyageai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const OPENAI_API_KEY = process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const VOYAGE_API_KEY = process.env.MDB_MCP_VOYAGE_API_KEY || process.env.VOYAGE_API_KEY;
const CONNECTION_STRING = process.env.MDB_MCP_CONNECTION_STRING;

if (!CONNECTION_STRING) {
  console.error('❌ No MongoDB connection string found. Please set MDB_MCP_CONNECTION_STRING environment variable.');
  process.exit(1);
}

if (!OPENAI_API_KEY && !VOYAGE_API_KEY) {
  console.error('❌ No API keys found. Please set either OPENAI_API_KEY or VOYAGE_API_KEY environment variable.');
  process.exit(1);
}

// Test configuration
const testConfig = {
  connectionString: CONNECTION_STRING,
};

async function testOpenAIEmbeddings() {
  console.log('\n🧪 Testing OpenAI Embeddings...\n');
  
  const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    // Test 1: Document embedding
    console.log('📄 Test 1: Document Embedding');
    const docResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: "This is a test document for MongoDB Context Engineering",
      dimensions: 1536,
    });
    
    const docEmbedding = docResponse.data[0]?.embedding;
    console.log(`✅ Document embedding generated: ${docEmbedding?.length} dimensions`);
    console.log(`   First 5 values: [${docEmbedding?.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

    // Test 2: Query embedding
    console.log('\n🔍 Test 2: Query Embedding');
    const queryResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: "How does MongoDB Context Engineering work?",
      dimensions: 1536,
    });
    
    const queryEmbedding = queryResponse.data[0]?.embedding;
    console.log(`✅ Query embedding generated: ${queryEmbedding?.length} dimensions`);
    console.log(`   First 5 values: [${queryEmbedding?.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

    // Test 3: Calculate similarity
    console.log('\n📊 Test 3: Embedding Similarity');
    if (docEmbedding && queryEmbedding) {
      const similarity = cosineSimilarity(docEmbedding, queryEmbedding);
      console.log(`✅ Cosine similarity: ${similarity.toFixed(4)}`);
      console.log(`   (1.0 = identical, 0.0 = orthogonal)`);
    }

    // Test 4: Error handling
    console.log('\n⚠️  Test 4: Error Handling');
    try {
      await openaiClient.embeddings.create({
        model: "text-embedding-3-small",
        input: "", // Empty input
        dimensions: 1536,
      });
    } catch (error) {
      console.log(`✅ Empty input correctly rejected: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Different dimensions
    console.log('\n📏 Test 5: Different Dimensions');
    const largeResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-large",
      input: "Testing larger embedding model",
      dimensions: 3072,
    });
    
    const largeEmbedding = largeResponse.data[0]?.embedding;
    console.log(`✅ Large embedding generated: ${largeEmbedding?.length} dimensions`);

    return true;
  } catch (error) {
    console.error('❌ OpenAI embedding test failed:', error);
    return false;
  }
}

async function testMongoDBConnection() {
  console.log('\n🗄️  Testing MongoDB Connection...\n');
  
  const client = new MongoClient(testConfig.connectionString);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('context_engineering');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Test vector search readiness
    const indexes = await db.collection('implementation_patterns').indexes();
    const vectorIndex = indexes.find(idx => idx.name?.includes('vector'));
    if (vectorIndex) {
      console.log('✅ Vector search index found:', vectorIndex.name);
    } else {
      console.log('⚠️  No vector search index found - need to create one');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  } finally {
    await client.close();
  }
}

async function testEmbeddingStorage() {
  console.log('\n💾 Testing Embedding Storage in MongoDB...\n');
  
  const client = new MongoClient(testConfig.connectionString);
  const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  
  try {
    await client.connect();
    const db = client.db('context_engineering');
    const collection = db.collection('test_embeddings');
    
    // Generate embedding
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: "Test pattern for MongoDB vector search",
      dimensions: 1536,
    });
    
    const embedding = response.data[0]?.embedding;
    
    // Store in MongoDB
    const doc = {
      text: "Test pattern for MongoDB vector search",
      embedding: embedding,
      dimensions: embedding?.length,
      model: "text-embedding-3-small",
      created_at: new Date()
    };
    
    const result = await collection.insertOne(doc);
    console.log(`✅ Embedding stored with ID: ${result.insertedId}`);
    
    // Verify storage
    const stored = await collection.findOne({ _id: result.insertedId });
    console.log(`✅ Verified storage: ${stored?.dimensions} dimensions`);
    
    // Clean up
    await collection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Embedding storage test failed:', error);
    return false;
  } finally {
    await client.close();
  }
}

// Helper function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Embedding System Tests with Actual API Keys\n');
  console.log('=' .repeat(60));
  
  const results = {
    mongodb: await testMongoDBConnection(),
    openai: await testOpenAIEmbeddings(),
    storage: await testEmbeddingStorage()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`MongoDB Connection: ${results.mongodb ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`OpenAI Embeddings: ${results.openai ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Embedding Storage: ${results.storage ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(console.error); 