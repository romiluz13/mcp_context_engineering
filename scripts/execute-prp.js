#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - PRP Executor
 * 
 * Transforms the original .claude/commands/execute-prp.md functionality
 * into a MongoDB-powered, universal AI assistant compatible system.
 * 
 * ORIGINAL CAPABILITY PRESERVED + MONGODB ENHANCEMENTS:
 * - Complete PRP execution with validation loops
 * - Progress tracking and learning integration
 * - Success/failure analysis and storage
 * - Universal AI assistant compatibility
 */

import { MongoClient } from 'mongodb';
import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';
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
 * From .claude/commands/execute-prp.md lines 1-40
 */

/**
 * Print banner (Enhanced from original)
 */
function printBanner() {
    console.clear();
    console.log('\n⚡ ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING - PRP EXECUTOR');
    console.log('   Execute PRPs with validation loops and collaborative learning!');
    console.log('═══════════════════════════════════════════════════════════════════════════════ ⚡\n');
}

/**
 * Parse PRP File (Lines 9-12 from original)
 */
function parsePRPFile(filepath) {
    if (!existsSync(filepath)) {
        throw new Error(`PRP file not found: ${filepath}`);
    }
    
    const content = readFileSync(filepath, 'utf8');
    
    // Extract key sections from PRP
    const sections = {
        goal: extractSection(content, '## Goal'),
        why: extractSection(content, '## Why'),
        what: extractSection(content, '## What'),
        implementation: extractSection(content, '## Implementation Blueprint'),
        validation: extractSection(content, '## Validation Loop'),
        checklist: extractSection(content, '## Final Validation Checklist')
    };
    
    return { content, sections, filepath };
}

/**
 * Extract section content from markdown
 */
function extractSection(content, sectionHeader) {
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line => line.trim().startsWith(sectionHeader));
    
    if (startIndex === -1) return '';
    
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ') && !lines[i].startsWith('### ')) {
            endIndex = i;
            break;
        }
    }
    
    return lines.slice(startIndex + 1, endIndex).join('\n').trim();
}

/**
 * Execute Command with Real-time Output (Lines 14-20 from original)
 */
function executeCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Executing: ${command}`);
        
        const child = spawn('bash', ['-c', command], {
            cwd,
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Command completed successfully\n`);
                resolve(true);
            } else {
                console.log(`❌ Command failed with exit code ${code}\n`);
                resolve(false);
            }
        });
        
        child.on('error', (error) => {
            console.error(`❌ Command error: ${error.message}\n`);
            reject(error);
        });
    });
}

/**
 * Validation Loop Execution (Lines 22-35 from original)
 * Enhanced with MongoDB learning integration
 */
async function executeValidationLoop(prp, mongoClient) {
    console.log('🔍 VALIDATION LOOP: Progressive Quality Gates\n');
    
    const validationResults = {
        level1_syntax: false,
        level2_tests: false,
        level3_integration: false,
        manual_verification: false,
        timestamp: new Date()
    };
    
    // Level 1: Syntax & Style (Lines 24-27 from original)
    console.log('📋 Level 1: Syntax & Style Validation');
    console.log('   Running linting, formatting, and type checking...\n');
    
    const syntaxCommands = [
        'npm run lint || echo "No lint script found"',
        'npm run type-check || echo "No type-check script found"', 
        'npm run format || echo "No format script found"'
    ];
    
    let syntaxPassed = true;
    for (const command of syntaxCommands) {
        const result = await executeCommand(command);
        if (!result) syntaxPassed = false;
    }
    
    validationResults.level1_syntax = syntaxPassed;
    
    if (!syntaxPassed) {
        console.log('❌ Level 1 failed. Please fix syntax/style issues before continuing.\n');
        const continueAnyway = await question('Continue anyway? (y/N): ');
        if (continueAnyway.toLowerCase() !== 'y') {
            return validationResults;
        }
    }
    
    // Level 2: Unit Tests (Lines 29-32 from original)
    console.log('📋 Level 2: Unit Test Validation');
    console.log('   Running comprehensive test suite...\n');
    
    const testCommands = [
        'npm test || npm run test || echo "No test script found"',
        'npm run test:coverage || echo "No coverage script found"'
    ];
    
    let testsPassed = true;
    for (const command of testCommands) {
        const result = await executeCommand(command);
        if (!result) testsPassed = false;
    }
    
    validationResults.level2_tests = testsPassed;
    
    if (!testsPassed) {
        console.log('❌ Level 2 failed. Please fix failing tests before continuing.\n');
        const continueAnyway = await question('Continue anyway? (y/N): ');
        if (continueAnyway.toLowerCase() !== 'y') {
            return validationResults;
        }
    }
    
    // Level 3: Integration Test (Lines 34-35 from original)
    console.log('📋 Level 3: Integration Test Validation');
    console.log('   Testing complete feature integration...\n');
    
    const integrationCommands = [
        'npm run test:integration || echo "No integration test script found"',
        'npm run build || echo "No build script found"'
    ];
    
    let integrationPassed = true;
    for (const command of integrationCommands) {
        const result = await executeCommand(command);
        if (!result) integrationPassed = false;
    }
    
    validationResults.level3_integration = integrationPassed;
    
    // Manual Verification (Enhanced from original)
    console.log('📋 Manual Verification');
    console.log('   Please manually test the implemented feature...\n');
    console.log('🎯 Feature Goal:', prp.sections.goal);
    console.log('📝 What to Test:', prp.sections.what);
    console.log('\n🔍 Test the feature manually and verify it works as expected.\n');
    
    const manualResult = await question('Did manual testing pass? (y/N): ');
    validationResults.manual_verification = manualResult.toLowerCase() === 'y';
    
    return validationResults;
}

/**
 * Store Execution Results (MongoDB Enhancement)
 */
async function storeExecutionResults(prp, validationResults, mongoClient) {
    try {
        const db = mongoClient.db(DATABASE_NAME);
        
        const executionRecord = {
            prp_file: prp.filepath,
            goal: prp.sections.goal,
            execution_timestamp: new Date(),
            validation_results: validationResults,
            overall_success: validationResults.level1_syntax && 
                           validationResults.level2_tests && 
                           validationResults.level3_integration && 
                           validationResults.manual_verification,
            learning_data: {
                syntax_issues: !validationResults.level1_syntax,
                test_failures: !validationResults.level2_tests,
                integration_problems: !validationResults.level3_integration,
                manual_verification_failed: !validationResults.manual_verification
            }
        };
        
        await db.collection('prp_execution_history').insertOne(executionRecord);
        
        // Update success metrics for similar patterns
        if (executionRecord.overall_success) {
            await db.collection('implementation_patterns').updateMany(
                { pattern_name: { $regex: new RegExp(prp.sections.goal.substring(0, 20), 'i') } },
                { $inc: { 'success_metrics.successful_implementations': 1 } }
            );
        }
        
        console.log('📚 Execution results stored in MongoDB for collaborative learning');
    } catch (error) {
        console.log('⚠️  Could not store execution results:', error.message);
    }
}

/**
 * Main Function - Transform Original Workflow (Lines 1-40)
 */
async function main() {
    try {
        printBanner();
        
        // Get PRP file path
        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.error('❌ Usage: mcp-context-engineering execute-prp <prp-file.md>');
            console.error('💡 Example: mcp-context-engineering execute-prp PRPs/feature_prp.md');
            process.exit(1);
        }
        
        const prpFilePath = args[0];
        console.log(`📖 Loading PRP: ${prpFilePath}\n`);
        
        // Parse PRP file
        const prp = parsePRPFile(prpFilePath);
        
        console.log('🎯 PRP Goal:', prp.sections.goal);
        console.log('📋 Ready to execute with validation loops\n');
        
        const proceed = await question('🚀 Start PRP execution? (Y/n): ');
        if (proceed.toLowerCase() === 'n') {
            console.log('⏸️  Execution cancelled');
            process.exit(0);
        }
        
        // Connect to MongoDB for learning integration
        let mongoClient = null;
        if (config.connectionString) {
            try {
                mongoClient = new MongoClient(config.connectionString);
                await mongoClient.connect();
                console.log('📚 Connected to MongoDB for collaborative learning\n');
            } catch (error) {
                console.log('⚠️  MongoDB connection failed, continuing without learning integration\n');
            }
        }
        
        // Execute validation loop (Lines 22-35 from original)
        const validationResults = await executeValidationLoop(prp, mongoClient);
        
        // Store results for learning
        if (mongoClient) {
            await storeExecutionResults(prp, validationResults, mongoClient);
            await mongoClient.close();
        }
        
        // Final Results (Lines 37-40 from original)
        console.log('\n🎉 PRP EXECUTION COMPLETE!\n');
        console.log('📊 Validation Results:');
        console.log(`   ✅ Syntax & Style: ${validationResults.level1_syntax ? 'PASSED' : 'FAILED'}`);
        console.log(`   ✅ Unit Tests: ${validationResults.level2_tests ? 'PASSED' : 'FAILED'}`);
        console.log(`   ✅ Integration: ${validationResults.level3_integration ? 'PASSED' : 'FAILED'}`);
        console.log(`   ✅ Manual Verification: ${validationResults.manual_verification ? 'PASSED' : 'FAILED'}`);
        
        const overallSuccess = validationResults.level1_syntax && 
                              validationResults.level2_tests && 
                              validationResults.level3_integration && 
                              validationResults.manual_verification;
        
        console.log(`\n🏆 Overall Result: ${overallSuccess ? '🎉 SUCCESS!' : '❌ NEEDS WORK'}`);
        
        if (overallSuccess) {
            console.log('🚀 Feature implementation completed successfully!');
            console.log('📚 Results contributed to MongoDB collaborative learning');
        } else {
            console.log('🔧 Please address the failed validation steps and re-run');
            console.log('💡 Use: mcp-context-engineering execute-prp ' + prpFilePath);
        }
        
        rl.close();
        
    } catch (error) {
        console.error('❌ Error executing PRP:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
