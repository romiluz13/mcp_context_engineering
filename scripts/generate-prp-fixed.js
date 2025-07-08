#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - PRP Generator Helper
 * 
 * IMPORTANT: This is a HELPER script for AI assistants, NOT a standalone tool!
 * 
 * PURPOSE:
 * - Creates an INITIAL.md file from user input
 * - Guides users to use AI assistants for actual PRP generation
 * - Explains the correct MCP workflow
 * 
 * This script CANNOT:
 * - Search your codebase (only AI assistants can do that)
 * - Search the web (only AI assistants can do that)
 * - Generate comprehensive PRPs (requires AI assistant capabilities)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import readline from 'readline';
import { promisify } from 'util';

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = promisify(rl.question).bind(rl);

/**
 * Print banner
 */
function printBanner() {
    console.clear();
    console.log('\n✨ ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING - FEATURE REQUEST HELPER');
    console.log('   Create feature requests for AI assistants to implement!');
    console.log('═══════════════════════════════════════════════════════════════════════════════ ✨\n');
}

/**
 * Create INITIAL.md file
 */
async function createInitialFile(featureData) {
    const content = `## FEATURE:

${featureData.description}

## EXAMPLES:

${featureData.examples || '[Provide and explain examples that you have in the examples/ folder]'}

## DOCUMENTATION:

${featureData.documentation || '[List out any documentation (web pages, sources for an MCP server like Crawl4AI RAG, etc.) that will need to be referenced during development]'}

## OTHER CONSIDERATIONS:

${featureData.considerations || '[Any other considerations or specific requirements - great place to include gotchas that you see AI coding assistants miss with your projects a lot]'}

---

# Next Steps:

1. **Configure MCP in your AI assistant** (see examples/mcp-configs/)

2. **Start a conversation with your AI assistant:**
   "Help me implement the feature described in INITIAL.md using MongoDB Context Engineering"

3. **The AI assistant will:**
   - Call context-research to find MongoDB patterns
   - Search YOUR codebase for similar implementations
   - Search the web for documentation and best practices
   - Call context-assemble-prp to create a comprehensive PRP
   - Implement the feature with validation loops

This is the CORRECT workflow - let the AI orchestrate everything!
`;

    // Save the file
    const filename = 'INITIAL.md';
    writeFileSync(filename, content);
    
    return filename;
}

/**
 * Explain the correct workflow
 */
function explainWorkflow() {
    console.log('\n📚 UNDERSTANDING THE CORRECT WORKFLOW:\n');
    
    console.log('❌ WRONG: Running this script to generate PRPs');
    console.log('   This script CANNOT access your codebase or search the web!\n');
    
    console.log('✅ CORRECT: Using AI assistants with MCP tools');
    console.log('   1. AI calls context-research for MongoDB patterns');
    console.log('   2. AI searches YOUR codebase (it has access!)');
    console.log('   3. AI searches the web (it can do that!)');
    console.log('   4. AI calls context-assemble-prp with ALL research');
    console.log('   5. AI implements the feature based on the PRP\n');
    
    console.log('🎯 This script just helps create the initial feature request.\n');
}

/**
 * Main function
 */
async function main() {
    try {
        printBanner();
        explainWorkflow();
        
        console.log("Let's create a feature request for your AI assistant to implement.\n");
        
        const featureData = {};
        
        // Get feature description
        featureData.description = await question('🎯 What feature do you want to build?\n   ');
        
        console.log('\n');
        
        // Get examples
        const hasExamples = await question('📁 Do you have example code to reference? (y/N): ');
        if (hasExamples.toLowerCase() === 'y') {
            featureData.examples = await question('📝 Describe the examples:\n   ');
        }
        
        console.log('\n');
        
        // Get documentation
        const hasDoc = await question('📚 Do you have documentation URLs to reference? (y/N): ');
        if (hasDoc.toLowerCase() === 'y') {
            featureData.documentation = await question('🔗 List the documentation:\n   ');
        }
        
        console.log('\n');
        
        // Get other considerations
        const hasConsiderations = await question('⚠️  Any special considerations or gotchas? (y/N): ');
        if (hasConsiderations.toLowerCase() === 'y') {
            featureData.considerations = await question('💡 Describe them:\n   ');
        }
        
        // Create the file
        console.log('\n📝 Creating feature request file...\n');
        const filename = await createInitialFile(featureData);
        
        console.log('✅ Feature request created: ' + filename);
        console.log('\n🚀 NEXT STEPS:\n');
        console.log('1. Make sure MCP is configured in your AI assistant');
        console.log('   See: examples/mcp-configs/\n');
        console.log('2. Tell your AI assistant:');
        console.log('   "Help me implement the feature in INITIAL.md using MongoDB Context Engineering"\n');
        console.log('3. The AI will handle everything else automatically!\n');
        
        console.log('💡 Remember: The AI assistant does the actual work, not this script!\n');
        
        rl.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
} 