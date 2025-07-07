#!/bin/bash

# 🚀 MCP Context Engineering Platform - Super Easy Installation Script
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
echo "📋 Next Steps:"
echo "1. Set up your environment variables:"
echo "   export MDB_MCP_CONNECTION_STRING='your-mongodb-connection-string'"
echo "   export MDB_MCP_OPENAI_API_KEY='your-openai-api-key'"
echo ""
echo "2. Initialize the database:"
echo "   mcp-context-engineering setup-database"
echo "   mcp-context-engineering generate-sample-data"
echo ""
echo "3. Configure your AI assistant:"
echo "   - Claude Desktop: Add to claude_desktop_config.json"
echo "   - Cursor: Add to .cursorrules or MCP config"
echo "   - VS Code: Add to settings.json"
echo ""
echo "📚 Full documentation: https://github.com/romiluz13/mcp_context_engineering"
echo ""
echo "🚀 Transform your AI development workflow today!"
