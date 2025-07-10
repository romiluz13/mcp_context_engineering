#!/bin/bash

# 🚀 MCP Context Engineering Platform - Installation
# Transform static context into dynamic, intelligent, collaborative intelligence!

set -e

echo "🚀 Installing MCP Context Engineering Platform..."
echo "   Revolutionary AI Context Intelligence for Any Assistant!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install the package globally
echo "📦 Installing mcp-context-engineering globally..."
npm install -g mcp-context-engineering

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure your AI assistant with MCP Context Engineering:"
echo "   Add these to your AI assistant's MCP configuration:"
echo "   • MDB_MCP_CONNECTION_STRING - Your MongoDB connection string"
echo "   • MDB_MCP_OPENAI_API_KEY - Your OpenAI API key"
echo ""
echo "2. Start using it! Just ask your AI:"
echo "   'Help me build [feature] using MongoDB Context Engineering'"
echo ""
echo "✅ NO MANUAL SETUP NEEDED!"
echo "   Database collections are created automatically on first use."
echo ""
echo "📚 Full documentation: https://github.com/romiluz13/mcp_context_engineering"
echo ""
echo "🚀 Transform your AI development workflow today!"
echo "═══════════════════════════════════════════════════════════════════════════════"
