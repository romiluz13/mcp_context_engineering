# MongoDB Atlas Vector Search Setup Guide

This guide explains how to create vector search indexes for the Context Engineering MCP system in MongoDB Atlas.

## Overview

Vector search indexes are required for semantic search functionality in the Context Engineering MCP. Since programmatic creation requires Atlas Admin API configuration, this guide provides instructions for creating indexes through the Atlas UI.

## Prerequisites

- MongoDB Atlas cluster (M10 or higher recommended)
- Access to MongoDB Atlas UI with appropriate permissions
- Context Engineering MCP deployed and connected to your cluster

## Index Configuration

### OpenAI Embeddings (Default)

**Model**: text-embedding-3-small  
**Dimensions**: 1536  
**Similarity**: dotProduct

### Voyage AI Embeddings (Alternative)

**Model**: voyage-large-2-instruct  
**Dimensions**: 1024  
**Similarity**: dotProduct

## Creating Vector Search Indexes via Atlas UI

### Step 1: Access Atlas Search

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click on the "Atlas Search" tab

### Step 2: Create Index for Each Collection

For each of the following collections, create a vector search index:

- `memory_banks`
- `memory_templates`
- `successful_prps`
- `research_knowledge`
- `implementation_patterns`
- `discovered_gotchas`

### Step 3: Index Definition

1. Click "Create Search Index"
2. Select "JSON Editor" 
3. Use the following index definition:

#### For OpenAI Embeddings (1536 dimensions):

```json
{
  "name": "vector_index_openai",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "dotProduct"
      }
    ]
  }
}
```

#### For Voyage AI Embeddings (1024 dimensions):

```json
{
  "name": "vector_index_voyage",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1024,
        "similarity": "dotProduct"
      }
    ]
  }
}
```

### Step 4: Apply to All Collections

Repeat the index creation process for each collection in the `context_engineering` database.

## Creating Indexes via Atlas CLI

If you prefer using the command line:

### Step 1: Install Atlas CLI

```bash
brew install mongodb-atlas-cli
```

### Step 2: Configure Authentication

```bash
atlas auth login
```

### Step 3: Create Indexes

Create a file `vector-index-definition.json`:

```json
{
  "database": "context_engineering",
  "collectionName": "memory_banks",
  "type": "vectorSearch",
  "name": "vector_index_openai",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "dotProduct"
      }
    ]
  }
}
```

Then run:

```bash
atlas clusters search indexes create --clusterName <your-cluster-name> --file vector-index-definition.json
```

Repeat for each collection, updating the `collectionName` field.

## Verifying Index Creation

### Via Atlas UI

1. Go to Atlas Search tab
2. You should see all indexes with status "ACTIVE"
3. Note that index building may take several minutes

### Via MongoDB Shell

```javascript
db.memory_banks.aggregate([
  { $listSearchIndexes: {} }
])
```

## Using Vector Search in Queries

Once indexes are created, you can perform vector searches:

```javascript
db.collection.aggregate([
  {
    $vectorSearch: {
      index: "vector_index_openai",
      path: "embedding",
      queryVector: yourEmbeddingVector,
      numCandidates: 100,
      limit: 10
    }
  }
])
```

## Switching Embedding Providers

If you switch from OpenAI to Voyage AI (or vice versa):

1. **Update Configuration**: Set `MDB_MCP_EMBEDDING_PROVIDER` environment variable
2. **Re-generate Embeddings**: All existing embeddings must be regenerated with the new provider
3. **Create New Indexes**: Create indexes with appropriate dimensions for the new provider
4. **Update Queries**: Use the new index name in your vector search queries

## Performance Considerations

1. **Index Building**: Initial index creation may take several minutes for large collections
2. **Query Performance**: Vector search performance depends on:
   - Index configuration
   - Collection size
   - Query complexity
   - Cluster resources

3. **Best Practices**:
   - Use `dotProduct` similarity for normalized vectors
   - Keep embedding dimensions consistent
   - Monitor index performance in Atlas UI

## Troubleshooting

### Common Issues

1. **"Index not found" errors**: Ensure index name matches exactly
2. **Dimension mismatch**: Verify embedding dimensions match index configuration
3. **Slow queries**: Check index status is "ACTIVE" not "BUILDING"

### Getting Help

- [MongoDB Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
- [MongoDB Support](https://support.mongodb.com/)

## Next Steps

After creating vector search indexes:

1. Test vector search functionality with sample queries
2. Monitor query performance in Atlas
3. Consider adding Search Nodes for dedicated search infrastructure
4. Implement backup strategies for your vector data 