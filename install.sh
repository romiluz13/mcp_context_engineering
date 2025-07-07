#!/bin/bash

# 🚀 MCP Context Engineering Platform - Super Easy Installation Script
# This script makes installation extremely easy with just one command

set -e

echo "🚀 Installing MCP Context Engineering Platform..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install the package globally
echo "📦 Installing mcp-context-engineering globally..."
npm install -g mcp-context-engineering

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Set up your environment variables:"
echo "   export MDB_MCP_CONNECTION_STRING=\"mongodb+srv://username:password@cluster.mongodb.net/\""
echo "   export MDB_MCP_OPENAI_API_KEY=\"sk-your-openai-api-key\"  # Optional for enhanced search"
echo ""
echo "2. Initialize the database:"
echo "   mcp-context-engineering setup-db"
echo "   mcp-context-engineering sample-data"
echo ""
echo "3. Configure your AI assistant with MCP:"
echo "   See examples/mcp-configs/ for configuration files"
echo ""
echo "🚀 Ready to revolutionize your AI-assisted development!"
echo ""
echo "📚 Documentation: https://github.com/romiluz13/mcp_context_engineering"
echo "🆘 Support: https://github.com/romiluz13/mcp_context_engineering/issues"
echo ""
