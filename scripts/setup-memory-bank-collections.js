#!/usr/bin/env node

/**
 * 🧠 Memory Bank MongoDB Collections Setup
 * 
 * Creates the new MongoDB collections required for memory bank functionality:
 * - memory_banks: Project memory storage with real-time capabilities
 * - memory_templates: Reusable templates from successful projects
 * - memory_patterns: Cross-project patterns with community intelligence
 * 
 * Enhanced with real-time features and collaborative intelligence.
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.MDB_MCP_CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ MDB_MCP_CONNECTION_STRING environment variable is required');
  process.exit(1);
}

async function setupMemoryBankCollections() {
  const client = new MongoClient(connectionString);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('context_engineering');
    console.log('✅ Connected to context_engineering database');

    // Create memory_banks collection
    console.log('\n🧠 Setting up memory_banks collection...');
    
    try {
      await db.createCollection('memory_banks');
      console.log('✅ memory_banks collection created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ memory_banks collection already exists');
      } else {
        throw error;
      }
    }

    // Create indexes for memory_banks
    await db.collection('memory_banks').createIndexes([
      { key: { project_name: 1 }, unique: true },
      { key: { technology_stack: 1 } },
      { key: { project_type: 1 } },
      { key: { last_updated: -1 } },
      { key: { last_accessed: -1 } },
      { key: { "success_metrics.average_confidence": -1 } }
    ]);
    console.log('✅ memory_banks indexes created');

    // Create memory_templates collection
    console.log('\n📋 Setting up memory_templates collection...');
    
    try {
      await db.createCollection('memory_templates');
      console.log('✅ memory_templates collection created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ memory_templates collection already exists');
      } else {
        throw error;
      }
    }

    // Create indexes for memory_templates
    await db.collection('memory_templates').createIndexes([
      { key: { template_name: 1, technology_stack: 1 } },
      { key: { project_type: 1 } },
      { key: { success_rate: -1 } },
      { key: { usage_count: -1 } },
      { key: { community_rating: -1 } },
      { key: { created_at: -1 } }
    ]);
    console.log('✅ memory_templates indexes created');

    // Create memory_patterns collection
    console.log('\n🔍 Setting up memory_patterns collection...');
    
    try {
      await db.createCollection('memory_patterns');
      console.log('✅ memory_patterns collection created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ memory_patterns collection already exists');
      } else {
        throw error;
      }
    }

    // Create indexes for memory_patterns
    await db.collection('memory_patterns').createIndexes([
      { key: { pattern_name: 1 } },
      { key: { pattern_type: 1 } },
      { key: { technology_stack: 1 } },
      { key: { success_rate: -1 } },
      { key: { usage_count: -1 } },
      { key: { community_votes: -1 } },
      { key: { created_at: -1 } },
      { key: { last_used: -1 } },
      { key: { source_projects: 1 } }
    ]);
    console.log('✅ memory_patterns indexes created');

    // Insert sample memory bank template
    console.log('\n📝 Creating sample memory bank template...');
    
    const sampleTemplate = {
      template_name: "Basic Web App Memory Bank",
      technology_stack: ["React", "Node.js", "MongoDB"],
      project_type: "web_app",
      template_files: {
        projectbrief_template: `# Project Brief: {{PROJECT_NAME}}

## Overview
{{PROJECT_DESCRIPTION}}

## Technology Stack
{{TECHNOLOGY_STACK}}

## Goals
- Implement features using Context Engineering methodology
- Maintain high code quality and testing standards
- Follow universal AI assistant rules
- Build collaborative intelligence through pattern sharing

## Success Criteria
- [ ] All features implemented with >90% success rate
- [ ] Comprehensive test coverage
- [ ] Documentation and patterns captured
- [ ] Community intelligence contributions`,

        productContext_template: `# Product Context: {{PROJECT_NAME}}

## Why This Project Exists
{{PROJECT_DESCRIPTION}}

## Problems We're Solving
- [Add specific problems this project addresses]
- [Include user pain points and business needs]
- [Document market opportunities]

## Target Users
- [Define primary user personas]
- [Include user needs and expectations]
- [Document usage patterns]`,

        activeContext_template: `# Active Context: {{PROJECT_NAME}}

## Current Work Focus
- [Current feature or task being worked on]
- [Immediate priorities and deadlines]
- [Active development areas]

## Recent Changes
- [Recent commits and modifications]
- [New features added]
- [Bug fixes and improvements]

## Current Challenges
- [Technical challenges being faced]
- [Blockers and dependencies]
- [Areas needing attention]`,

        systemPatterns_template: `# System Patterns: {{PROJECT_NAME}}

## Architecture Decisions
- [Key architectural choices and rationale]
- [Design patterns being used]
- [System boundaries and interfaces]

## Technology Patterns
{{TECHNOLOGY_PATTERNS}}

## Code Organization
- [Directory structure conventions]
- [File naming patterns]
- [Module organization principles]`,

        techContext_template: `# Tech Context: {{PROJECT_NAME}}

## Technology Stack
{{TECHNOLOGY_DETAILS}}

## Development Environment
- Node.js version: [Specify version]
- Package manager: [npm/yarn/pnpm]
- IDE/Editor: [Preferred development tools]
- Operating System: [Development OS requirements]

## Build and Deployment
- Build process: [How to build the project]
- Testing commands: [How to run tests]
- Deployment process: [How to deploy]
- Environment variables: [Required env vars]`,

        progress_template: `# Progress: {{PROJECT_NAME}}

## Project Status
- **Overall Progress:** 0% (Just started)
- **Current Phase:** Initialization
- **Last Updated:** {{TIMESTAMP}}

## Completed Work
- [x] Memory bank initialized
- [ ] [Add completed features and tasks]

## In Progress
- [ ] [Current active work items]
- [ ] [Features being developed]

## Planned Work
- [ ] [Upcoming features and tasks]
- [ ] [Future milestones]`
      },
      usage_count: 0,
      success_rate: 0.85,
      created_at: new Date(),
      created_by: "MCP Context Engineering Platform",
      community_rating: 4.5
    };

    await db.collection('memory_templates').updateOne(
      { template_name: sampleTemplate.template_name },
      { $set: sampleTemplate },
      { upsert: true }
    );
    console.log('✅ Sample memory bank template created');

    // Insert sample patterns
    console.log('\n🔧 Creating sample implementation patterns...');
    
    const samplePatterns = [
      {
        pattern_name: "React Component with Hooks",
        pattern_type: "implementation",
        technology_stack: ["React", "JavaScript", "TypeScript"],
        pattern_content: "Use functional components with hooks for state management. Prefer useState and useEffect for simple state, useReducer for complex state logic.",
        code_examples: [
          `import React, { useState, useEffect } from 'react';

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return <div>{data ? data.title : 'Loading...'}</div>;
}`
        ],
        success_rate: 0.92,
        usage_count: 15,
        source_projects: ["sample-project"],
        confidence_scores: [9, 8, 9, 10, 8],
        created_at: new Date(),
        last_used: new Date(),
        community_votes: 12
      },
      {
        pattern_name: "MongoDB Connection Gotcha",
        pattern_type: "gotcha",
        technology_stack: ["MongoDB", "Node.js"],
        pattern_content: "Always close MongoDB connections properly to avoid memory leaks. Use connection pooling and handle connection errors gracefully.",
        code_examples: [
          `// Good: Proper connection handling
const client = new MongoClient(uri);
try {
  await client.connect();
  // Use client
} finally {
  await client.close();
}`
        ],
        success_rate: 0.88,
        usage_count: 8,
        source_projects: ["sample-project"],
        confidence_scores: [8, 9, 7, 8],
        created_at: new Date(),
        last_used: new Date(),
        community_votes: 6
      }
    ];

    for (const pattern of samplePatterns) {
      await db.collection('memory_patterns').updateOne(
        { pattern_name: pattern.pattern_name },
        { $set: pattern },
        { upsert: true }
      );
    }
    console.log('✅ Sample implementation patterns created');

    console.log('\n🎉 Memory Bank Collections Setup Complete!');
    console.log('\n📊 Summary:');
    console.log('- ✅ memory_banks collection with indexes');
    console.log('- ✅ memory_templates collection with indexes');
    console.log('- ✅ memory_patterns collection with indexes');
    console.log('- ✅ Sample template for web apps');
    console.log('- ✅ Sample implementation patterns');
    console.log('\n🚀 Memory bank functionality is now ready!');
    console.log('🧠 Your MCP Context Engineering Platform now has persistent collaborative intelligence!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run setup
setupMemoryBankCollections().catch(console.error);
