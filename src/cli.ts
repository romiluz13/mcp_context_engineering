#!/usr/bin/env node

/**
 * MCP Context Engineering Platform - CLI Interface
 * 
 * This CLI is a lightweight wrapper. Its primary purpose is to start the 
 * MCP server, which is then used by AI assistants.
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
🚀 MCP Context Engineering Platform

OVERVIEW:
  This is an MCP (Model Context Protocol) server that provides MongoDB-based
  collaborative intelligence to AI coding assistants like Cursor and Claude.

  Setup is automatic - no manual configuration needed!

USAGE:
  mcp-context-engineering [command]

COMMANDS:
  help         Show this help message
  version      Show version information
  
  (no command) Start the MCP server for AI assistant integration

⚡ HOW IT WORKS:
  1. Install the package globally: npm install -g mcp-context-engineering
  2. Configure your AI assistant with your MongoDB and OpenAI credentials
  3. Use natural language: "Help me build [feature] using MongoDB Context Engineering"
  4. The server automatically creates all necessary database collections on first use

✅ NO MANUAL SETUP NEEDED!
  The database, collections, and indexes are created automatically when you first
  use the MCP tools through your AI assistant.

CONFIGURATION:
  Add to your AI assistant's MCP configuration:
  • MDB_MCP_CONNECTION_STRING - Your MongoDB connection string
  • MDB_MCP_OPENAI_API_KEY - Your OpenAI API key

DOCUMENTATION:
  https://github.com/romiluz13/mcp_context_engineering

💡 Transform static prompts into dynamic, learning, collaborative intelligence!
`);
}

// Handle commands
switch (command) {
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;

    case 'version':
    case '--version':
    case '-v':
        console.log('2.3.0');
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
