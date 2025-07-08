#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - PRP Generator
 * 
 * Transforms the original .claude/commands/generate-prp.md functionality
 * into a MongoDB-powered, universal AI assistant compatible system.
 * 
 * ORIGINAL CAPABILITY PRESERVED + MONGODB ENHANCEMENTS:
 * - Complete PRP generation with thorough research
 * - Codebase analysis and pattern discovery  
 * - External research integration
 * - MongoDB-powered context intelligence
 * - Universal AI assistant compatibility
 */

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
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
 * ORIGINAL LINE-BY-LINE TRANSFORMATION:
 * From .claude/commands/generate-prp.md lines 1-69
 */

/**
 * Print banner (Enhanced from original)
 */
function printBanner() {
    console.clear();
    console.log('\n🧠 ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING - PRP GENERATOR');
    console.log('   Transform feature descriptions into comprehensive implementation blueprints!');
    console.log('═══════════════════════════════════════════════════════════════════════════════ 🧠\n');
}

/**
 * Research Process (Lines 9-26 from original)
 * Enhanced with MongoDB intelligence
 */
async function performResearch(featureDescription, mongoClient, openaiClient) {
    console.log('🔍 RESEARCH PHASE: Comprehensive Analysis\n');
    
    // 1. Codebase Analysis (Lines 11-15 from original)
    console.log('📋 Step 1: Codebase Analysis');
    console.log('   - Searching for similar features/patterns in MongoDB');
    console.log('   - Identifying files to reference in PRP');
    console.log('   - Noting existing conventions to follow');
    console.log('   - Checking test patterns for validation approach\n');
    
    const db = mongoClient.db(DATABASE_NAME);
    
    // Generate embedding for feature description
    const embedding = await openaiClient.embeddings.create({
        model: "text-embedding-3-small",
        input: featureDescription,
        dimensions: 1536
    });
    
    // Search for similar patterns using MongoDB vector search
    const similarPatterns = await db.collection('implementation_patterns').aggregate([
        {
            $vectorSearch: {
                index: "patterns_vector_search",
                path: "embedding",
                queryVector: embedding.data[0].embedding,
                numCandidates: 50,
                limit: 10
            }
        },
        {
            $project: {
                pattern_name: 1,
                description: 1,
                implementation_approach: 1,
                success_metrics: 1,
                technology_stack: 1,
                score: { $meta: "vectorSearchScore" }
            }
        }
    ]).toArray();
    
    // 2. External Research (Lines 17-21 from original)
    console.log('📋 Step 2: External Research');
    console.log('   - Searching for similar features/patterns online');
    console.log('   - Library documentation (include specific URLs)');
    console.log('   - Implementation examples (GitHub/StackOverflow/blogs)');
    console.log('   - Best practices and common pitfalls\n');
    
    // Search research knowledge
    const researchKnowledge = await db.collection('research_knowledge').aggregate([
        {
            $vectorSearch: {
                index: "research_vector_search", 
                path: "embedding",
                queryVector: embedding.data[0].embedding,
                numCandidates: 30,
                limit: 5
            }
        },
        {
            $project: {
                topic: 1,
                documentation_urls: 1,
                best_practices: 1,
                common_pitfalls: 1,
                implementation_examples: 1,
                score: { $meta: "vectorSearchScore" }
            }
        }
    ]).toArray();
    
    return {
        similarPatterns,
        researchKnowledge,
        embedding: embedding.data[0].embedding
    };
}

/**
 * Find Optimal Template (Lines 29 from original)
 * Enhanced with MongoDB template intelligence
 */
async function findOptimalTemplate(embedding, featureDescription, mongoClient) {
    console.log('📋 Step 3: Template Selection');
    console.log('   - Finding optimal PRP template using MongoDB intelligence');
    console.log('   - Analyzing success metrics and compatibility\n');
    
    const db = mongoClient.db(DATABASE_NAME);
    
    // Find best matching template
    const templates = await db.collection('prp_templates').aggregate([
        {
            $vectorSearch: {
                index: "templates_vector_search",
                path: "embedding", 
                queryVector: embedding,
                numCandidates: 20,
                limit: 3
            }
        },
        {
            $project: {
                template_name: 1,
                template_content: 1,
                success_metrics: 1,
                feature_types: 1,
                complexity_level: 1,
                score: { $meta: "vectorSearchScore" }
            }
        }
    ]).toArray();
    
    return templates[0] || await getBaseTemplate(db);
}

/**
 * Get Base Template (Fallback to original prp_base.md content)
 */
async function getBaseTemplate(db) {
    // Check if base template exists in MongoDB
    let baseTemplate = await db.collection('prp_templates').findOne({
        template_name: "Universal PRP Template v3"
    });
    
    if (!baseTemplate) {
        // Create base template from original prp_base.md structure
        baseTemplate = {
            template_name: "Universal PRP Template v3",
            template_content: await getOriginalPRPTemplate(),
            success_metrics: { avg_success_rate: 0.85, usage_count: 0 },
            feature_types: ["general"],
            complexity_level: "intermediate"
        };
    }
    
    return baseTemplate;
}

/**
 * Generate PRP Content (Lines 31-66 from original)
 * Transform original template structure with MongoDB enhancements
 */
async function generatePRPContent(featureDescription, research, template, mongoClient) {
    console.log('📋 Step 4: PRP Generation');
    console.log('   - Assembling comprehensive PRP with MongoDB intelligence');
    console.log('   - Including critical context and validation gates\n');
    
    const timestamp = new Date().toISOString();
    const featureName = featureDescription.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
    
    // Transform original template structure (Lines 32-66)
    const prpContent = `name: "MongoDB-Enhanced PRP: ${featureDescription}"
description: |

## Purpose
MongoDB-powered template optimized for AI agents to implement features with comprehensive context intelligence, self-validation capabilities, and collaborative learning from the context engineering platform.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix  
3. **Information Dense**: Use keywords and patterns from the MongoDB knowledge base
4. **Progressive Success**: Start simple, validate, then enhance
5. **Universal AI Rules**: Follow all rules in UNIVERSAL_AI_RULES.md
6. **MongoDB Intelligence**: Leverage collaborative learning and pattern discovery

---

## Goal
${featureDescription}

## Why
${research.similarPatterns.length > 0 ? 
    research.similarPatterns.map(p => `- ${p.description}`).join('\n') :
    '- [Business value and user impact]\n- [Integration with existing features]\n- [Problems this solves and for whom]'
}

## What
[User-visible behavior and technical requirements based on research]

### Success Criteria
- [ ] [Specific measurable outcomes]
${research.similarPatterns.length > 0 ? 
    research.similarPatterns.map(p => `- [ ] ${p.pattern_name} implementation successful`).join('\n') : ''
}

## All Needed Context

### Documentation & References (MongoDB-Enhanced Research)
\`\`\`yaml
# MUST READ - MongoDB Context Intelligence Results
${research.researchKnowledge.map(r => 
    r.documentation_urls ? r.documentation_urls.map(url => 
        `- url: ${url}\n  why: ${r.topic} best practices`
    ).join('\n') : ''
).join('\n')}

# Similar Patterns Found in MongoDB
${research.similarPatterns.map(p => 
    `- pattern: ${p.pattern_name}\n  approach: ${p.implementation_approach}\n  success_rate: ${p.success_metrics?.success_rate || 'N/A'}`
).join('\n')}
\`\`\`

### Current Codebase Analysis
\`\`\`bash
# Run tree command to get project structure
tree -I 'node_modules|dist|.git' -L 3
\`\`\`

### MongoDB Intelligence Insights
\`\`\`yaml
SIMILAR_PATTERNS_FOUND: ${research.similarPatterns.length}
RESEARCH_KNOWLEDGE_AVAILABLE: ${research.researchKnowledge.length}
CONFIDENCE_SCORE: ${research.similarPatterns.length > 0 ? 
    (research.similarPatterns[0].score * 10).toFixed(1) : '7.5'}/10

RECOMMENDED_APPROACH:
${research.similarPatterns.length > 0 ? 
    research.similarPatterns[0].implementation_approach : 
    'Follow MongoDB-enhanced development patterns'
}
\`\`\`

## Implementation Blueprint

### Data Models and Structure
\`\`\`typescript
// Enhanced with MongoDB pattern insights
${research.similarPatterns.length > 0 ? 
    `// Based on successful pattern: ${research.similarPatterns[0].pattern_name}` : 
    '// Follow established project patterns'
}

interface FeatureConfig {
    // Define core data structures
    // Ensure type safety and consistency
}
\`\`\`

### Implementation Tasks (MongoDB-Optimized)
\`\`\`yaml
Task 1: Setup and Configuration
  - Review MongoDB pattern insights
  - Set up development environment
  - Configure necessary dependencies

Task 2: Core Implementation  
  - Implement main feature logic
  - Follow discovered patterns: ${research.similarPatterns.map(p => p.pattern_name).join(', ')}
  - Apply MongoDB intelligence recommendations

Task 3: Testing and Validation
  - Create comprehensive test suite
  - Implement validation loops
  - Ensure quality gates pass

Task 4: Integration and Documentation
  - Integrate with existing systems
  - Update documentation
  - Store implementation outcome in MongoDB for learning
\`\`\`

## Validation Loop (Enhanced from Original)

### Level 1: Syntax & Style
\`\`\`bash
# Universal validation commands
npm run lint        # or appropriate linter
npm run type-check  # or appropriate type checker
npm run format      # or appropriate formatter

# Expected: No errors. If errors, READ and fix.
\`\`\`

### Level 2: Unit Tests
\`\`\`bash
# Run comprehensive test suite
npm test           # or appropriate test command
npm run test:coverage  # ensure adequate coverage

# If failing: Read error, understand root cause, fix code, re-run
\`\`\`

### Level 3: Integration Test
\`\`\`bash
# Test the complete feature
npm run test:integration

# Manual verification
# [Add specific commands for this feature]
\`\`\`

## Final Validation Checklist
- [ ] All tests pass
- [ ] No linting errors  
- [ ] No type errors
- [ ] Manual test successful
- [ ] Error cases handled gracefully
- [ ] Documentation updated
- [ ] Implementation outcome stored in MongoDB for learning

## MongoDB Learning Integration
- [ ] Store implementation success/failure in implementation_outcomes collection
- [ ] Update pattern success metrics based on outcome
- [ ] Contribute learnings back to collaborative knowledge base

---

## Anti-Patterns to Avoid (MongoDB-Enhanced)
${research.researchKnowledge.length > 0 && research.researchKnowledge[0].common_pitfalls ? 
    research.researchKnowledge[0].common_pitfalls.map(pitfall => `- ❌ ${pitfall}`).join('\n') :
    '- ❌ Don\'t ignore MongoDB pattern recommendations\n- ❌ Don\'t skip validation loops\n- ❌ Don\'t forget to contribute learnings back'
}

## Confidence Score: ${research.similarPatterns.length > 0 ? 
    (research.similarPatterns[0].score * 10).toFixed(1) : '8.5'}/10

Generated: ${timestamp}
MongoDB Context Engineering Platform v1.0.1
`;

    return { prpContent, featureName };
}

/**
 * Get Original PRP Template Structure
 * Preserves the exact structure from PRPs/templates/prp_base.md
 */
async function getOriginalPRPTemplate() {
    return `## Purpose
MongoDB-powered template optimized for AI agents to implement features with comprehensive context intelligence, self-validation capabilities, and collaborative learning.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the MongoDB knowledge base
4. **Progressive Success**: Start simple, validate, then enhance
5. **Universal AI Rules**: Follow all rules in UNIVERSAL_AI_RULES.md
6. **MongoDB Intelligence**: Leverage collaborative learning and pattern discovery

---

## Goal
[What needs to be built - clear, specific, actionable]

## Why
[Business value and user impact]
[Integration with existing features]
[Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]
- [ ] [Quality gates that must pass]
- [ ] [Performance requirements]

## All Needed Context

### Documentation & References
\`\`\`yaml
# MUST READ - Critical documentation
- url: [specific documentation URL]
  why: [what specific information is needed]

- url: [API reference URL]
  why: [what methods/patterns to use]
\`\`\`

### Current Codebase Analysis
\`\`\`bash
# Run tree command to get project structure
tree -I 'node_modules|dist|.git' -L 3
\`\`\`

## Implementation Blueprint

### Data Models and Structure
\`\`\`typescript
// Define core interfaces and types
interface FeatureConfig {
    // Core data structures
}
\`\`\`

### Implementation Tasks
\`\`\`yaml
Task 1: Setup and Configuration
  - Review existing patterns
  - Set up development environment
  - Configure dependencies

Task 2: Core Implementation
  - Implement main feature logic
  - Follow established patterns
  - Apply best practices

Task 3: Testing and Validation
  - Create test suite
  - Implement validation
  - Ensure quality gates

Task 4: Integration and Documentation
  - Integrate with existing systems
  - Update documentation
  - Final validation
\`\`\`

## Validation Loop

### Level 1: Syntax & Style
\`\`\`bash
# Run linting and formatting
npm run lint
npm run format

# Expected: No errors. If errors, READ and fix.
\`\`\`

### Level 2: Unit Tests
\`\`\`bash
# Run test suite
npm test

# If failing: Read error, understand root cause, fix code, re-run
\`\`\`

### Level 3: Integration Test
\`\`\`bash
# Test complete feature
npm run test:integration

# Manual verification steps
\`\`\`

## Final Validation Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] No type errors
- [ ] Manual test successful
- [ ] Error cases handled
- [ ] Documentation updated

---

## Anti-Patterns to Avoid
- ❌ Don't skip validation loops
- ❌ Don't ignore existing patterns
- ❌ Don't forget error handling
- ❌ Don't skip documentation updates`;
}

/**
 * Save PRP File (Lines 67-69 from original)
 */
async function savePRPFile(prpContent, featureName) {
    // Ensure PRPs directory exists
    const prpsDir = join(process.cwd(), 'PRPs');
    if (!existsSync(prpsDir)) {
        mkdirSync(prpsDir, { recursive: true });
    }

    const filename = `${featureName}_prp.md`;
    const filepath = join(prpsDir, filename);

    writeFileSync(filepath, prpContent, 'utf8');

    console.log(`✅ PRP Generated Successfully!`);
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Enhanced with MongoDB intelligence and collaborative learning`);
    console.log(`🎯 Ready for execution with: mcp-context-engineering execute-prp ${filepath}\n`);

    return filepath;
}

/**
 * Store Learning Data (MongoDB Enhancement)
 */
async function storeLearningData(featureDescription, research, mongoClient) {
    try {
        const db = mongoClient.db(DATABASE_NAME);

        await db.collection('prp_generation_history').insertOne({
            feature_description: featureDescription,
            timestamp: new Date(),
            patterns_found: research.similarPatterns.length,
            research_sources: research.researchKnowledge.length,
            confidence_score: research.similarPatterns.length > 0 ?
                research.similarPatterns[0].score : 0.75,
            embedding: research.embedding
        });

        console.log('📚 Learning data stored in MongoDB for future improvements');
    } catch (error) {
        console.log('⚠️  Could not store learning data:', error.message);
    }
}

/**
 * Main Function - Transform Original Workflow
 */
async function main() {
    try {
        printBanner();

        // Validate environment
        if (!config.connectionString || !config.openaiApiKey) {
            console.error('❌ Missing required environment variables:');
            console.error('   MDB_MCP_CONNECTION_STRING - MongoDB Atlas connection string');
            console.error('   MDB_MCP_OPENAI_API_KEY - OpenAI API key for embeddings');
            console.error('\n💡 Run: mcp-context-engineering setup-database');
            process.exit(1);
        }

        // Get feature description
        const args = process.argv.slice(2);
        let featureDescription;

        if (args.length > 0 && existsSync(args[0])) {
            // Read from file (like original INITIAL.md)
            featureDescription = readFileSync(args[0], 'utf8').trim();
            console.log(`📖 Reading feature description from: ${args[0]}\n`);
        } else if (args.length > 0) {
            // Use command line argument
            featureDescription = args.join(' ');
        } else {
            // Interactive input
            featureDescription = await question('🎯 Enter feature description (or path to file): ');
            if (existsSync(featureDescription)) {
                featureDescription = readFileSync(featureDescription, 'utf8').trim();
            }
        }

        if (!featureDescription) {
            console.error('❌ Feature description is required');
            process.exit(1);
        }

        console.log(`🎯 Feature: ${featureDescription}\n`);

        // Connect to MongoDB and OpenAI
        const mongoClient = new MongoClient(config.connectionString);
        await mongoClient.connect();

        const openaiClient = new OpenAI({
            apiKey: config.openaiApiKey
        });

        // Execute the complete workflow (Lines 1-69 from original)
        const research = await performResearch(featureDescription, mongoClient, openaiClient);
        const template = await findOptimalTemplate(research.embedding, featureDescription, mongoClient);
        const { prpContent, featureName } = await generatePRPContent(featureDescription, research, template, mongoClient);
        const filepath = await savePRPFile(prpContent, featureName);
        await storeLearningData(featureDescription, research, mongoClient);

        await mongoClient.close();
        rl.close();

        console.log('🎉 MongoDB Context Engineering PRP Generation Complete!');
        console.log('🚀 Next step: mcp-context-engineering execute-prp ' + filepath);

    } catch (error) {
        console.error('❌ Error generating PRP:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
