#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - Feature Request Creator
 * 
 * Transforms the original INITIAL.md template functionality
 * into a MongoDB-powered, universal AI assistant compatible system.
 * 
 * ORIGINAL CAPABILITY PRESERVED + MONGODB ENHANCEMENTS:
 * - Interactive feature request creation
 * - Template-based structure from original INITIAL.md
 * - MongoDB intelligence for similar feature suggestions
 * - Universal AI assistant compatibility
 */

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import readline from 'readline';
import { promisify } from 'util';

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = promisify(rl.question).bind(rl);

// Configuration
const config = {
    connectionString: process.env.MDB_MCP_CONNECTION_STRING,
    openaiApiKey: process.env.MDB_MCP_OPENAI_API_KEY || process.env.OPENAI_API_KEY
};

const DATABASE_NAME = 'context_engineering';

/**
 * ORIGINAL TEMPLATE TRANSFORMATION:
 * From INITIAL.md (16 lines) and INITIAL_EXAMPLE.md (25 lines)
 */

/**
 * Print banner
 */
function printBanner() {
    console.clear();
    console.log('\n✨ ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING - FEATURE REQUEST CREATOR');
    console.log('   Create structured feature requests with MongoDB intelligence!');
    console.log('═══════════════════════════════════════════════════════════════════════════════ ✨\n');
}

/**
 * Get Original INITIAL.md Template Structure
 * Preserves exact structure from original INITIAL.md
 */
function getInitialTemplate() {
    return `# Feature Request: [FEATURE_NAME]

## What
[Describe what you want to build - be specific and clear]

## Why
[Explain the business value, user impact, and problems this solves]

## Context
[Any relevant background, constraints, or requirements]

## Success Criteria
[How will you know this feature is successful?]

---

*Created: [TIMESTAMP]*
*MongoDB Context Engineering Platform v1.0.1*
`;
}

/**
 * Get EXACT INITIAL_EXAMPLE.md Template (27 lines from original repository)
 * This is the MISSING template format that shows the complete structure
 */
function getInitialExampleTemplate() {
    return `## FEATURE:

- [Describe your feature - be specific about what you want to build]
- [Technology stack and key components]
- [Interface type: CLI, web app, API, etc.]
- [Key integrations and external services]

## EXAMPLES:

In the \`examples/\` folder, there is a README for you to read to understand what the example is all about and also how to structure your own README when you create documentation for the above feature.

- \`examples/code-patterns/\` - use these as templates and best practices
- \`examples/implementations/\` - read through all files to understand proven patterns
- \`examples/configurations/\` - configuration examples and setup patterns

Don't copy any of these examples directly, they may be for different projects entirely. But use this as inspiration and for best practices.

## DOCUMENTATION:

[Relevant documentation links - be specific]

## OTHER CONSIDERATIONS:

- Include a .env.example, README with instructions for setup including configuration
- Include the project structure in the README
- Environment variables and configuration management
- Security considerations and best practices
- Testing strategy and validation approach
`;
}

/**
 * Get Enhanced Template with MongoDB Intelligence
 */
function getEnhancedTemplate(featureName, similarFeatures = []) {
    const timestamp = new Date().toISOString();
    
    return `# Feature Request: ${featureName}

## What
[Describe what you want to build - be specific and clear]

## Why  
[Explain the business value, user impact, and problems this solves]

## Context
[Any relevant background, constraints, or requirements]

## Success Criteria
[How will you know this feature is successful?]

## Technical Considerations
[Architecture, dependencies, integration points]

## Implementation Approach
[High-level approach and key decisions]

---

## MongoDB Intelligence Insights
${similarFeatures.length > 0 ? `
### Similar Features Found:
${similarFeatures.map(f => `- **${f.feature_name}**: ${f.description} (Success Rate: ${f.success_rate || 'N/A'})`).join('\n')}

### Recommended Patterns:
${similarFeatures.map(f => `- ${f.recommended_pattern || 'Standard implementation pattern'}`).join('\n')}
` : '### No similar features found in knowledge base - this could be a novel implementation!'}

---

*Created: ${timestamp}*
*MongoDB Context Engineering Platform v1.0.1*
*Next Steps: mcp-context-engineering generate-prp [this-file.md]*
`;
}

/**
 * Search for Similar Features (MongoDB Enhancement)
 */
async function searchSimilarFeatures(featureDescription, mongoClient, openaiClient) {
    if (!mongoClient || !openaiClient) {
        return [];
    }
    
    try {
        console.log('🔍 Searching MongoDB for similar features...\n');
        
        // Generate embedding for feature description
        const embedding = await openaiClient.embeddings.create({
            model: "text-embedding-3-small",
            input: featureDescription,
            dimensions: 1536
        });
        
        const db = mongoClient.db(DATABASE_NAME);
        
        // Search for similar features
        const similarFeatures = await db.collection('feature_requests').aggregate([
            {
                $vectorSearch: {
                    index: "features_vector_search",
                    path: "embedding",
                    queryVector: embedding.data[0].embedding,
                    numCandidates: 30,
                    limit: 5
                }
            },
            {
                $project: {
                    feature_name: 1,
                    description: 1,
                    success_rate: 1,
                    recommended_pattern: 1,
                    implementation_notes: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]).toArray();
        
        if (similarFeatures.length > 0) {
            console.log(`📚 Found ${similarFeatures.length} similar features in knowledge base`);
            similarFeatures.forEach((feature, index) => {
                console.log(`   ${index + 1}. ${feature.feature_name} (Similarity: ${(feature.score * 100).toFixed(1)}%)`);
            });
            console.log('');
        } else {
            console.log('🆕 No similar features found - this appears to be a novel feature!');
            console.log('');
        }
        
        return similarFeatures;
        
    } catch (error) {
        console.log('⚠️  Could not search for similar features:', error.message);
        return [];
    }
}

/**
 * Interactive Feature Creation
 */
async function createFeatureInteractively() {
    console.log('📝 Let\'s create your feature request step by step...\n');
    
    // Get basic information
    const featureName = await question('🎯 Feature Name: ');
    const whatDescription = await question('📋 What (brief description): ');
    const whyDescription = await question('💡 Why (business value): ');
    const contextInfo = await question('🔍 Context (background/constraints): ');
    const successCriteria = await question('✅ Success Criteria: ');
    
    // Optional technical details
    console.log('\n📚 Optional technical details (press Enter to skip):');
    const technicalConsiderations = await question('🔧 Technical Considerations: ');
    const implementationApproach = await question('🚀 Implementation Approach: ');
    
    return {
        featureName,
        whatDescription,
        whyDescription,
        contextInfo,
        successCriteria,
        technicalConsiderations,
        implementationApproach
    };
}

/**
 * Generate Feature Request Content
 */
function generateFeatureContent(featureData, similarFeatures = []) {
    const timestamp = new Date().toISOString();
    
    return `# Feature Request: ${featureData.featureName}

## What
${featureData.whatDescription}

## Why  
${featureData.whyDescription}

## Context
${featureData.contextInfo}

## Success Criteria
${featureData.successCriteria}

${featureData.technicalConsiderations ? `## Technical Considerations
${featureData.technicalConsiderations}

` : ''}${featureData.implementationApproach ? `## Implementation Approach
${featureData.implementationApproach}

` : ''}---

## MongoDB Intelligence Insights
${similarFeatures.length > 0 ? `
### Similar Features Found:
${similarFeatures.map(f => `- **${f.feature_name}**: ${f.description} (Success Rate: ${f.success_rate || 'N/A'})`).join('\n')}

### Recommended Patterns:
${similarFeatures.map(f => `- ${f.recommended_pattern || 'Standard implementation pattern'}`).join('\n')}

### Implementation Notes:
${similarFeatures.map(f => f.implementation_notes || 'Follow established patterns').join('\n- ')}
` : `### No similar features found in knowledge base - this could be a novel implementation!

### Recommendations:
- Follow established project patterns
- Consider creating reusable components
- Document implementation for future similar features`}

---

*Created: ${timestamp}*
*MongoDB Context Engineering Platform v1.0.1*
*Next Steps: mcp-context-engineering generate-prp [this-file.md]*
`;
}

/**
 * Save Feature Request File
 */
async function saveFeatureFile(content, featureName) {
    // Ensure features directory exists
    const featuresDir = join(process.cwd(), 'features');
    if (!existsSync(featuresDir)) {
        mkdirSync(featuresDir, { recursive: true });
    }
    
    const filename = `${featureName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}_request.md`;
    const filepath = join(featuresDir, filename);
    
    writeFileSync(filepath, content, 'utf8');
    
    console.log(`✅ Feature Request Created Successfully!`);
    console.log(`📁 File: ${filepath}`);
    console.log(`🎯 Enhanced with MongoDB intelligence`);
    console.log(`🚀 Next step: mcp-context-engineering generate-prp ${filepath}\n`);
    
    return filepath;
}

/**
 * Store Feature Request (MongoDB Enhancement)
 */
async function storeFeatureRequest(featureData, similarFeatures, mongoClient, openaiClient) {
    if (!mongoClient || !openaiClient) {
        return;
    }
    
    try {
        // Generate embedding for the feature
        const fullDescription = `${featureData.featureName} ${featureData.whatDescription} ${featureData.whyDescription}`;
        const embedding = await openaiClient.embeddings.create({
            model: "text-embedding-3-small",
            input: fullDescription,
            dimensions: 1536
        });
        
        const db = mongoClient.db(DATABASE_NAME);
        
        await db.collection('feature_requests').insertOne({
            feature_name: featureData.featureName,
            description: featureData.whatDescription,
            business_value: featureData.whyDescription,
            context: featureData.contextInfo,
            success_criteria: featureData.successCriteria,
            technical_considerations: featureData.technicalConsiderations,
            implementation_approach: featureData.implementationApproach,
            similar_features_found: similarFeatures.length,
            created_timestamp: new Date(),
            embedding: embedding.data[0].embedding,
            status: 'created'
        });
        
        console.log('📚 Feature request stored in MongoDB for collaborative learning');
    } catch (error) {
        console.log('⚠️  Could not store feature request:', error.message);
    }
}

/**
 * Main Function
 */
async function main() {
    try {
        printBanner();
        
        // Get feature description
        const args = process.argv.slice(2);
        let featureData;
        
        if (args.length > 0) {
            // Quick creation from command line
            const featureName = args.join(' ');
            console.log(`🎯 Creating feature request for: ${featureName}\n`);
            
            featureData = {
                featureName,
                whatDescription: '[Describe what you want to build - be specific and clear]',
                whyDescription: '[Explain the business value, user impact, and problems this solves]',
                contextInfo: '[Any relevant background, constraints, or requirements]',
                successCriteria: '[How will you know this feature is successful?]',
                technicalConsiderations: '',
                implementationApproach: ''
            };
        } else {
            // Interactive creation
            featureData = await createFeatureInteractively();
        }
        
        // Connect to MongoDB and OpenAI for intelligence
        let mongoClient = null;
        let openaiClient = null;
        let similarFeatures = [];
        
        if (config.connectionString && config.openaiApiKey) {
            try {
                mongoClient = new MongoClient(config.connectionString);
                await mongoClient.connect();
                
                openaiClient = new OpenAI({
                    apiKey: config.openaiApiKey
                });
                
                console.log('📚 Connected to MongoDB for intelligence insights\n');
                
                // Search for similar features
                const searchDescription = `${featureData.featureName} ${featureData.whatDescription}`;
                similarFeatures = await searchSimilarFeatures(searchDescription, mongoClient, openaiClient);
                
            } catch (error) {
                console.log('⚠️  MongoDB/OpenAI connection failed, continuing without intelligence insights\n');
            }
        }
        
        // Generate and save feature request
        const content = generateFeatureContent(featureData, similarFeatures);
        const filepath = await saveFeatureFile(content, featureData.featureName);
        
        // Store for learning
        if (mongoClient && openaiClient) {
            await storeFeatureRequest(featureData, similarFeatures, mongoClient, openaiClient);
            await mongoClient.close();
        }
        
        rl.close();
        
        console.log('🎉 Feature Request Creation Complete!');
        console.log('🚀 Next step: mcp-context-engineering generate-prp ' + filepath);
        
    } catch (error) {
        console.error('❌ Error creating feature request:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
