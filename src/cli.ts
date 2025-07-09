#!/usr/bin/env node

/**
 * MCP Context Engineering Platform - CLI Interface
 * 
 * Handles command-line operations like setup-database, generate-sample-data, etc.
 * When no command is provided, starts the MCP server.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

/**
 * Execute a script with proper error handling
 */
function executeScript(scriptPath: string, scriptArgs: string[] = []) {
    const child = spawn('node', [scriptPath, ...scriptArgs], {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    child.on('error', (error) => {
        console.error(`❌ Error executing script: ${error.message}`);
        process.exit(1);
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });
}

/**
 * Start the MCP server
 */
function startMcpServer() {
    const serverPath = join(__dirname, 'index.js');
    executeScript(serverPath);
}

/**
 * Show help information
 */
function showHelp() {
    console.log(`
🚀 MCP Context Engineering Platform CLI

USAGE:
  mcp-context-engineering [command] [options]

COMMANDS:
  mcp-setup                Revolutionary one-time setup (creates MongoDB collections)
  help                     Show this help message

  (no command)             Start the MCP server for AI assistant integration

🚀 RECOMMENDED WORKFLOW (MongoDB Context Engineering):
  1. Configure MCP in your AI assistant (see examples/mcp-configs/)
  2. Ask AI: "Help me research patterns for [your feature]"
  3. AI calls: context-research (MongoDB intelligence)
  4. AI calls: context-assemble-prp (sophisticated PRP generation)
  5. Follow the generated PRP with validation loops

💡 This approach provides superior intelligence vs traditional context engineering!

EXAMPLES:
  mcp-context-engineering mcp-setup
  mcp-context-engineering
  mcp-context-engineering generate-prp feature-request.md
  mcp-context-engineering execute-prp PRPs/feature-name.md
  mcp-context-engineering

ENVIRONMENT VARIABLES:
  MDB_MCP_CONNECTION_STRING    MongoDB Atlas connection string
  MDB_MCP_OPENAI_API_KEY       OpenAI API key for embeddings

DOCUMENTATION:
  https://github.com/romiluz13/mcp_context_engineering

🌟 Transform static context into dynamic, intelligent, collaborative intelligence!
`);
}

// Handle commands
switch (command) {
    case 'mcp-setup':
        console.log('🚀 Starting revolutionary MCP setup...\n');
        executeScript(join(__dirname, '..', 'scripts', 'mcp-setup.js'), args.slice(1));
        break;

    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;

    case 'version':
    case '--version':
    case '-v':
        console.log('2.2.0');
        break;

    case undefined:
        // No command provided - start MCP server
        startMcpServer();
        break;

    default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('Run "mcp-context-engineering help" for available commands.');
        process.exit(1);
}
