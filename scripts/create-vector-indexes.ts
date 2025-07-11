#!/usr/bin/env node

import { MongoClient } from 'mongodb';

// MongoDB configuration
const config = {
  connectionString: process.env.MDB_MCP_CONNECTION_STRING || "mongodb+srv://romiluz:H97r3aQBnxWawZbx@contextengineering.hdx0p3f.mongodb.net/?retryWrites=true&w=majority&appName=contextengineering",
  openaiApiKey: process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  voyageApiKey: process.env.MDB_MCP_VOYAGE_API_KEY || process.env.VOYAGE_API_KEY,
  embeddingProvider: process.env.MDB_MCP_EMBEDDING_PROVIDER || 'openai',
  voyageModel: process.env.MDB_MCP_VOYAGE_MODEL || 'voyage-large-2-instruct',
  openaiModel: process.env.MDB_MCP_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  embeddingDimensions: parseInt(process.env.MDB_MCP_EMBEDDING_DIMENSIONS || '1536')
};

// Determine dimensions based on provider and model
function getDimensions(): number {
  if (config.embeddingProvider === 'voyage') {
    // Voyage AI model dimensions
    switch (config.voyageModel) {
      case 'voyage-large-2-instruct':
      case 'voyage-2':
        return 1024;
      case 'voyage-code-2':
      case 'voyage-large-2':
        return 1536;
      default:
        return 1024;
    }
  } else {
    // OpenAI model dimensions
    switch (config.openaiModel) {
      case 'text-embedding-3-small':
        return 1536;
      case 'text-embedding-3-large':
        return 3072;
      default:
        return config.embeddingDimensions;
    }
  }
}

async function createVectorSearchIndexes() {
  if (!config.connectionString) {
    throw new Error('MDB_MCP_CONNECTION_STRING environment variable is required');
  }

  const client = new MongoClient(config.connectionString);

  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const database = client.db('context_engineering');
    const dimensions = getDimensions();
    
    console.log(`\n📊 Creating vector search indexes for ${config.embeddingProvider} embeddings (${dimensions} dimensions)`);

    // Collections to index
    const collections = [
      'memory_banks',
      'memory_templates', 
      'successful_prps',
      'research_knowledge',
      'implementation_patterns',
      'discovered_gotchas'
    ];

    for (const collectionName of collections) {
      console.log(`\n📄 Processing collection: ${collectionName}`);
      
      try {
        const collection = database.collection(collectionName);
        
        // Check if collection exists by attempting to count documents
        const count = await collection.countDocuments({}, { limit: 1 });
        
        // Define the vector search index
        const indexName = `vector_index_${config.embeddingProvider}`;
        const indexDefinition = {
          fields: [
            {
              type: "vector",
              path: "embedding",
              numDimensions: dimensions,
              similarity: "dotProduct"
            }
          ]
        };

        // Create the index using the driver method
        try {
          const result = await collection.createSearchIndex({
            name: indexName,
            type: "vectorSearch",
            definition: indexDefinition
          });
          
          console.log(`   ✅ Created index "${indexName}" - ID: ${result}`);
          
          // Wait for index to be queryable
          console.log('   ⏳ Waiting for index to become queryable...');
          let isQueryable = false;
          let attempts = 0;
          const maxAttempts = 60; // 5 minutes max
          
          while (!isQueryable && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            try {
              const indexes = await collection.listSearchIndexes(indexName).toArray();
              if (indexes.length > 0 && (indexes[0] as any).queryable) {
                isQueryable = true;
                console.log('   ✅ Index is now queryable!');
              }
            } catch (err) {
              // Index might not be ready yet
            }
            
            attempts++;
          }
          
          if (!isQueryable) {
            console.log('   ⚠️  Index creation initiated but not yet queryable. It may take a few more minutes.');
          }
          
        } catch (err: any) {
          if (err.message?.includes('already exists')) {
            console.log(`   ⚠️  Index "${indexName}" already exists`);
            
            // List existing indexes to check configuration
            try {
              const indexes = await collection.listSearchIndexes(indexName).toArray();
              if (indexes.length > 0) {
                const existingIndex = indexes[0] as any;
                const existingDimensions = existingIndex.latestDefinition?.fields?.[0]?.numDimensions;
                
                if (existingDimensions && existingDimensions !== dimensions) {
                  console.log(`   ⚠️  WARNING: Existing index has ${existingDimensions} dimensions, but current configuration expects ${dimensions} dimensions`);
                  console.log(`   💡 To fix: Drop the existing index and recreate it with the correct dimensions`);
                }
              }
            } catch (listErr) {
              console.log('   ❌ Could not verify existing index configuration');
            }
          } else {
            console.log(`   ❌ Error creating index: ${err.message}`);
          }
        }
        
      } catch (err: any) {
        console.log(`   ⚠️  Collection doesn't exist or error accessing it: ${err.message}`);
      }
    }

    console.log('\n🎉 Vector search index creation complete!');
    
    console.log('\n📋 Summary:');
    console.log(`   - Embedding Provider: ${config.embeddingProvider}`);
    console.log(`   - Model: ${config.embeddingProvider === 'openai' ? config.openaiModel : config.voyageModel}`);
    console.log(`   - Dimensions: ${dimensions}`);
    console.log(`   - Similarity Function: dotProduct`);
    console.log(`   - Collections Processed: ${collections.length}`);
    
    console.log('\n💡 Usage Example:');
    console.log('   To use these indexes in your queries:');
    console.log('   ```');
    console.log('   collection.aggregate([');
    console.log('     {');
    console.log('       $vectorSearch: {');
    console.log(`         index: "vector_index_${config.embeddingProvider}",`);
    console.log('         path: "embedding",');
    console.log('         queryVector: yourEmbeddingVector,');
    console.log('         numCandidates: 100,');
    console.log('         limit: 10');
    console.log('       }');
    console.log('     }');
    console.log('   ]);');
    console.log('   ```');
    
    console.log('\n📝 Note: If you switch embedding providers, you\'ll need to:');
    console.log('   1. Re-generate all embeddings with the new provider');
    console.log('   2. Create new indexes for the new embedding dimensions');
    console.log('   3. Update your queries to use the new index name');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    console.log('\n👋 Connection closed');
    await client.close();
  }
}

// Run the script
createVectorSearchIndexes().catch(console.error); 