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

# Interactive environment setup
echo "⚙️  Let's set up your environment variables interactively!"
echo ""

# Get MongoDB connection string
echo "🔗 MongoDB Atlas Connection String"
echo "   You can find this in MongoDB Atlas → Connect → Connect your application"
echo ""
read -p "📋 Please paste your MongoDB Atlas connection string: " MONGODB_CONNECTION
echo ""

# Get OpenAI API key
echo "🤖 OpenAI API Key"
echo "   You can find this at https://platform.openai.com/api-keys"
echo ""
read -p "📋 Please paste your OpenAI API key (starts with sk-): " OPENAI_KEY
echo ""

# Validate inputs
if [ -z "$MONGODB_CONNECTION" ]; then
    echo "❌ MongoDB connection string is required!"
    echo "   Please run the script again and provide your connection string."
    exit 1
fi

if [ -z "$OPENAI_KEY" ]; then
    echo "❌ OpenAI API key is required!"
    echo "   Please run the script again and provide your API key."
    exit 1
fi

# Set environment variables for current session
export MDB_MCP_CONNECTION_STRING="$MONGODB_CONNECTION"
export MDB_MCP_OPENAI_API_KEY="$OPENAI_KEY"

echo "✅ Environment variables set for current session!"
echo ""

# Add to shell profile for persistence
SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

if [ -n "$SHELL_PROFILE" ]; then
    echo "💾 Adding environment variables to $SHELL_PROFILE for persistence..."
    echo "" >> "$SHELL_PROFILE"
    echo "# MCP Context Engineering Platform" >> "$SHELL_PROFILE"
    echo "export MDB_MCP_CONNECTION_STRING='$MONGODB_CONNECTION'" >> "$SHELL_PROFILE"
    echo "export MDB_MCP_OPENAI_API_KEY='$OPENAI_KEY'" >> "$SHELL_PROFILE"
    echo "✅ Environment variables saved to $SHELL_PROFILE"
    echo ""
fi

# Ask if user wants to initialize database now
echo "🗄️  Database Initialization"
echo ""
read -p "Would you like to initialize the database now? (y/n): " INIT_DB

if [[ $INIT_DB =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Initializing database with interactive setup..."
    mcp-context-engineering setup-database

    echo ""
    read -p "Would you like to generate sample data for testing? (y/n): " GEN_SAMPLE

    if [[ $GEN_SAMPLE =~ ^[Yy]$ ]]; then
        echo ""
        echo "🎲 Generating sample data..."
        mcp-context-engineering generate-sample-data
    fi
fi

echo ""
echo "🎉 ═══════════════════════════════════════════════════════════════════════════════"
echo "   SETUP COMPLETE! YOUR REVOLUTIONARY CONTEXT INTELLIGENCE IS READY!"
echo "═══════════════════════════════════════════════════════════════════════════════ 🎉"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your AI assistant:"
echo "   - Claude Desktop: Add to claude_desktop_config.json"
echo "   - Cursor: Add to MCP configuration"
echo "   - VS Code: Add to settings.json"
echo ""
echo "2. Configuration examples available at:"
echo "   📁 examples/mcp-configs/ in the repository"
echo ""
echo "📚 Full documentation: https://github.com/romiluz13/mcp_context_engineering"
echo ""
echo "🚀 Transform your AI development workflow today!"
echo "🌟 Welcome to the future of AI-assisted development!"
