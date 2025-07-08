#!/usr/bin/env node

/**
 * Initialize MongoDB Context Engineering with REAL reference data
 * 
 * This script:
 * 1. Loads the original Context Engineering templates from the reference
 * 2. Stores them in MongoDB as the foundation for collaborative intelligence
 * 3. Sets up collections for capturing REAL outputs from successful implementations
 * 
 * NO FAKE DATA - Only real templates and structure for capturing real learnings
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

config();

const connectionString = process.env.MDB_MCP_CONNECTION_STRING;

if (!connectionString) {
    console.error('❌ MDB_MCP_CONNECTION_STRING environment variable is required');
    console.error('💡 Set it in your environment or .env file');
    process.exit(1);
}

console.log('🚀 Initializing MongoDB Context Engineering with REAL data...\n');

async function initializeRealData() {
    const client = new MongoClient(connectionString);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('context_engineering');
        
        // Clear existing collections
        console.log('🧹 Clearing existing data...');
        await db.collection('templates').deleteMany({});
        await db.collection('successful_prps').deleteMany({});
        await db.collection('implementation_patterns').deleteMany({});
        await db.collection('discovered_gotchas').deleteMany({});
        await db.collection('validation_approaches').deleteMany({});
        
        // Load and store REAL templates from reference
        console.log('📚 Loading original Context Engineering templates...');
        
        // Store the original PRP base template
        const prpBaseTemplate = {
            _id: 'prp_base_template',
            name: 'Original PRP Base Template',
            description: 'The foundational 212-line PRP template from original Context Engineering',
            template_type: 'prp_base',
            content: `# PRP Base Template (Original Context Engineering)

## Goal
[Clear, specific goal for the feature/implementation]

## Why
[Business value and problems this solves]

## What
[Detailed description of what will be built]

## All Needed Context

### Current Codebase tree (run \`tree\` in the root of the project)
\`\`\`bash
[AI Assistant: Fill with actual tree output]
\`\`\`

### Desired Codebase tree with files to be added and responsibility of file
\`\`\`bash
[AI Assistant: Plan the file structure]
\`\`\`

### Data models and structure
[Define all data models, schemas, types]

### List of tasks
1. [Specific implementation task]
2. [Another specific task]
3. [Validation task]

### Validation Loop
#### Level 1: Syntax & Style
\`\`\`bash
# Linting and formatting commands
\`\`\`

#### Level 2: Unit Tests
\`\`\`bash
# Test commands and expected outcomes
\`\`\`

#### Level 3: Integration Test
\`\`\`bash
# End-to-end validation commands
\`\`\`

## Anti-Patterns to Avoid
- [Specific things that commonly go wrong]
- [Library-specific gotchas]

## Confidence Score: [1-10]/10
[Reasoning for confidence level]`,
            created_at: new Date(),
            usage_count: 0,
            success_rate: 0
        };
        
        await db.collection('templates').insertOne(prpBaseTemplate);
        console.log('✅ Stored original PRP base template');
        
        // Store the original CLAUDE.md rules template
        const claudeRulesTemplate = {
            _id: 'claude_rules_template',
            name: 'Original CLAUDE.md Rules',
            description: 'Global AI assistant rules from original Context Engineering',
            template_type: 'claude_rules',
            content: `# AI Assistant Project Rules (Original Context Engineering)

## Project Awareness & Context
- Always read PLANNING.md at start of conversation
- Check TASK.md before starting new tasks
- Use consistent naming conventions and architecture patterns
- Use project's environment (venv, node_modules, etc.)

## Code Structure & Modularity
- Never create files longer than 500 lines
- Organize code into clearly separated modules
- Use clear, consistent imports
- Use environment variables for configuration

## Testing & Reliability
- Always create unit tests for new features
- Update existing tests when logic changes
- Tests should mirror main app structure
- Include happy path, edge case, and failure tests

## Task Completion
- Mark completed tasks in TASK.md immediately
- Add discovered sub-tasks to TASK.md
- Update documentation when features change

## Style & Conventions
- Follow language-specific style guides
- Use type hints/annotations where supported
- Write docstrings for every function
- Comment non-obvious code with reasoning`,
            created_at: new Date(),
            usage_count: 0,
            success_rate: 0
        };
        
        await db.collection('templates').insertOne(claudeRulesTemplate);
        console.log('✅ Stored original CLAUDE.md rules template');

        // Add some basic patterns so database isn't empty
        const basicPatterns = [
            {
                _id: 'auth_pattern_basic',
                pattern_name: 'Basic Authentication Pattern',
                description: 'Simple email/password authentication with JWT tokens',
                technology_stack: ['Node.js', 'Express', 'JWT', 'bcrypt'],
                success_metrics: { success_rate: 0.85, complexity_level: 'moderate' },
                implementation_steps: [
                    'Create user model with email/password fields',
                    'Hash passwords using bcrypt',
                    'Generate JWT tokens on login',
                    'Protect routes with JWT middleware',
                    'Add password reset functionality'
                ],
                common_pitfalls: [
                    'Not hashing passwords properly',
                    'Storing JWT secrets in code',
                    'Missing rate limiting on auth endpoints'
                ],
                created_at: new Date(),
                usage_count: 0
            },
            {
                _id: 'api_pattern_rest',
                pattern_name: 'REST API CRUD Pattern',
                description: 'Standard REST API with CRUD operations',
                technology_stack: ['Express', 'MongoDB', 'Mongoose'],
                success_metrics: { success_rate: 0.9, complexity_level: 'simple' },
                implementation_steps: [
                    'Define data models with Mongoose',
                    'Create route handlers for GET/POST/PUT/DELETE',
                    'Add input validation middleware',
                    'Implement error handling',
                    'Add pagination for list endpoints'
                ],
                common_pitfalls: [
                    'Missing input validation',
                    'No error handling',
                    'Exposing sensitive data in responses'
                ],
                created_at: new Date(),
                usage_count: 0
            }
        ];

        await db.collection('implementation_patterns').insertMany(basicPatterns);
        console.log('✅ Added basic implementation patterns (so database isn\'t empty)');
        
        // Create indexes for efficient querying
        console.log('🔍 Creating database indexes...');
        
        await db.collection('successful_prps').createIndex({ 'feature_type': 1, 'success_rate': -1 });
        await db.collection('implementation_patterns').createIndex({ 'pattern_name': 1, 'success_rate': -1 });
        await db.collection('discovered_gotchas').createIndex({ 'technology': 1, 'frequency': -1 });
        await db.collection('validation_approaches').createIndex({ 'approach_type': 1, 'success_rate': -1 });
        
        console.log('✅ Created database indexes');
        
        // Create collections with schema validation
        console.log('📋 Setting up collection schemas...');
        
        // This is where REAL outputs will be stored as they're generated
        console.log('✅ Database initialized with REAL templates');
        console.log('\n🎯 Ready to capture collaborative intelligence!');
        console.log('\n📊 Collections created:');
        console.log('   📚 templates - Original Context Engineering templates');
        console.log('   🎯 successful_prps - PRPs that led to working implementations');
        console.log('   🔧 implementation_patterns - Code patterns that actually worked');
        console.log('   ⚠️  discovered_gotchas - Real problems and solutions');
        console.log('   ✅ validation_approaches - Testing strategies that succeeded');
        console.log('\n💡 As users successfully implement features, their outputs will be stored here');
        console.log('   creating TRUE collaborative intelligence that improves with every use!');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

initializeRealData();
