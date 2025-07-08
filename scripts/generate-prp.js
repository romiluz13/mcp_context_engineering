#!/usr/bin/env node

/**
 * MongoDB Context Engineering Platform - INITIAL.md Helper
 *
 * IMPORTANT: This script ONLY creates INITIAL.md templates.
 * It CANNOT search codebases, web, or generate comprehensive PRPs.
 *
 * For actual PRP generation, use an AI assistant with MCP configuration:
 * 1. Configure MCP in your AI assistant (Cursor, Claude Desktop, etc.)
 * 2. Use natural conversation: "Help me build [feature] using MongoDB Context Engineering"
 * 3. AI assistant will call context-research and context-assemble-prp tools
 *
 * This script is just a helper to create feature request templates.
 */

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

/**
 * Print banner with correct usage guidance
 */
function printBanner() {
    console.clear();
    console.log('\n📝 ═══════════════════════════════════════════════════════════════════════════════');
    console.log('   MONGODB CONTEXT ENGINEERING - INITIAL.md HELPER');
    console.log('   ═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('   ⚠️  IMPORTANT: This script ONLY creates INITIAL.md templates');
    console.log('   ⚠️  It CANNOT search codebases or generate comprehensive PRPs');
    console.log('');
    console.log('   🤖 For actual PRP generation, use an AI assistant:');
    console.log('      1. Configure MCP in your AI assistant');
    console.log('      2. Say: "Help me build [feature] using MongoDB Context Engineering"');
    console.log('      3. AI will call context-research and context-assemble-prp tools');
    console.log('');
    console.log('   📋 This helper creates feature request templates for AI assistants');
    console.log('   ═══════════════════════════════════════════════════════════════════════════════\n');
}

/**
 * Create enhanced INITIAL.md template with sophisticated elements from original
 */
function createInitialTemplate(featureDescription) {
    return `## FEATURE:

${featureDescription}

## EXAMPLES:

[List any example files in the examples/ folder and explain how they should be used]
[Reference specific patterns from your codebase that should be followed]
[Include file paths and explain what patterns to mirror: "See src/auth/login.py for authentication patterns"]

Examples to reference:
- \`examples/[relevant-example].py\` - [Explanation of what pattern this demonstrates]
- \`src/[existing-feature]/\` - [Explanation of similar implementation to follow]

Don't copy these examples directly, but use them for inspiration and best practices.

## DOCUMENTATION:

[Include links to relevant documentation, APIs, or resources that will be needed]
[Add specific URLs to library documentation, tutorials, or guides]

Required documentation to read:
- [Library Name] documentation: [URL]
- [API Name] reference: [URL]
- [Framework] best practices: [URL]

## OTHER CONSIDERATIONS:

[Any gotchas, specific requirements, or things AI assistants commonly miss]
[Performance requirements, security considerations, integration constraints]
[Known pitfalls or edge cases to be aware of]

Project-specific considerations:
- Include a .env.example if environment variables are needed
- Follow the project structure defined in PLANNING.md
- Use the technology stack and patterns from CLAUDE.md
- Ensure compatibility with existing [database/API/framework] setup
- Consider [specific performance/security/integration requirements]

Known gotchas for this project:
- [Specific library quirks or version issues]
- [Common mistakes AI assistants make with this codebase]
- [Integration challenges or dependencies]

---

## 🤖 NEXT STEPS FOR AI ASSISTANT:

This INITIAL.md file is ready for use with an AI assistant configured with MCP Context Engineering.

**Correct Workflow:**
1. Configure MCP in your AI assistant (Cursor, Claude Desktop, etc.)
2. Say: "Help me build this feature using MongoDB Context Engineering"
3. AI assistant will:
   - Call context-research tool for MongoDB patterns
   - Search your codebase for similar implementations
   - Search web for documentation and examples
   - Perform ULTRATHINK phase for comprehensive planning
   - Call context-assemble-prp to generate sophisticated PRP
   - Implement the feature with validation loops
   - Follow FIND/INJECT/PRESERVE patterns for integration

**Enhanced Features:**
- **ULTRATHINK methodology** for deep planning before implementation
- **Sophisticated task structure** with FIND/INJECT/PRESERVE patterns
- **3-level validation loops** (Syntax/Unit/Integration)
- **PRP confidence scoring** (1-10 scale for success probability)
- **Project awareness** through CLAUDE.md, PLANNING.md, TASK.md integration
- **Collaborative learning** from MongoDB pattern intelligence

**⚠️ IMPORTANT:** This script cannot search codebases or generate comprehensive PRPs.
Only AI assistants with MCP configuration can perform the complete workflow.
`;


/**
 * Save INITIAL.md file
 */
function saveInitialFile(content, filename = 'INITIAL.md') {
    const featuresDir = join(process.cwd(), 'features');
    if (!existsSync(featuresDir)) {
        mkdirSync(featuresDir, { recursive: true });
    }

    const filepath = join(featuresDir, filename);
    writeFileSync(filepath, content, 'utf8');

    return filepath;
}

/**
 * Main function - Simple INITIAL.md generator
 */
async function main() {
    try {
        printBanner();

        // Get feature description
        const args = process.argv.slice(2);
        let featureDescription;

        if (args.length > 0) {
            featureDescription = args.join(' ');
        } else {
            featureDescription = await question('🎯 Enter feature description: ');
        }

        if (!featureDescription) {
            console.error('❌ Feature description is required');
            process.exit(1);
        }

        console.log(`\n📝 Creating INITIAL.md template for: ${featureDescription}\n`);

        // Create INITIAL.md template
        const template = createInitialTemplate(featureDescription);
        const filename = `${featureDescription.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30)}_initial.md`;
        const filepath = saveInitialFile(template, filename);

        console.log(`✅ INITIAL.md template created successfully!`);
        console.log(`📁 File: ${filepath}`);
        console.log(`\n🤖 NEXT STEPS:`);
        console.log(`   1. Review and customize the template`);
        console.log(`   2. Configure MCP in your AI assistant`);
        console.log(`   3. Say: "Help me build this feature using MongoDB Context Engineering"`);
        console.log(`   4. AI assistant will handle the complete research and PRP generation\n`);

        rl.close();

    } catch (error) {
        console.error('❌ Error creating template:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
