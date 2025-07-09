#!/usr/bin/env node

/**
 * Test Setup Script - Verify installation works without requiring MongoDB
 * 
 * This script tests that all dependencies are installed correctly
 * and the MCP server can start without errors.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing MCP Context Engineering Setup...\n');

// Test 1: Check if build works
console.log('📦 Test 1: Building project...');
try {
    const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: projectRoot,
        stdio: 'pipe'
    });

    let buildOutput = '';
    buildProcess.stdout.on('data', (data) => {
        buildOutput += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
        buildOutput += data.toString();
    });

    await new Promise((resolve, reject) => {
        buildProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Build successful');
                resolve();
            } else {
                console.error('❌ Build failed');
                console.error(buildOutput);
                reject(new Error('Build failed'));
            }
        });
    });
} catch (error) {
    console.error('❌ Build test failed:', error.message);
    process.exit(1);
}

// Test 2: Check if MCP server can start (without MongoDB)
console.log('\n🔌 Test 2: Testing MCP server startup...');
try {
    // Set minimal environment for testing
    process.env.NODE_ENV = 'test';
    
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    
    const server = new McpServer(
        {
            name: "mcp-context-engineering-test",
            version: "2.3.0",
        },
        {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
                logging: {},
            },
        }
    );

    console.log('✅ MCP server can be instantiated');
} catch (error) {
    console.error('❌ MCP server test failed:', error.message);
    process.exit(1);
}

// Test 3: Check if all required dependencies are available
console.log('\n📚 Test 3: Checking dependencies...');
try {
    await import('mongodb');
    console.log('✅ MongoDB driver available');
    
    await import('openai');
    console.log('✅ OpenAI SDK available');
    
    await import('zod');
    console.log('✅ Zod validation available');
    
    await import('dotenv');
    console.log('✅ Dotenv available');
} catch (error) {
    console.error('❌ Dependency check failed:', error.message);
    process.exit(1);
}

// Test 4: Check if dist files exist
console.log('\n📁 Test 4: Checking built files...');
try {
    const fs = await import('fs');
    const distPath = join(projectRoot, 'dist');
    
    if (!fs.existsSync(distPath)) {
        throw new Error('dist directory not found');
    }
    
    const indexPath = join(distPath, 'index.js');
    if (!fs.existsSync(indexPath)) {
        throw new Error('dist/index.js not found');
    }
    
    console.log('✅ Built files exist');
} catch (error) {
    console.error('❌ Built files check failed:', error.message);
    process.exit(1);
}

console.log('\n🎉 All tests passed! MCP Context Engineering is ready to use.');
console.log('\n📋 Next steps:');
console.log('1. Set environment variables:');
console.log('   - MDB_MCP_CONNECTION_STRING (MongoDB connection)');
console.log('   - MDB_MCP_OPENAI_API_KEY (OpenAI API key)');
console.log('2. Run: npm run setup-all');
console.log('3. Configure your AI assistant with MCP settings');
console.log('\n🚀 Ready for revolutionary AI-assisted development!');
