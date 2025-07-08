#!/bin/bash

# 🚀 MCP Context Engineering Platform - SECURE LOCAL-FIRST Installation
# Transform static context into dynamic, intelligent, collaborative intelligence!
# 🔒 LOCAL-FIRST: Your data stays private and secure

set -e

echo "🚀 Installing MCP Context Engineering Platform..."
echo "   Revolutionary AI Context Intelligence for Any Assistant!"
echo "   🔒 LOCAL-FIRST: Your data stays private and secure"
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
# Check if running interactively
if [ -t 0 ]; then
    echo "⚙️  Let's set up your environment variables interactively!"
    echo ""

    # Choose MongoDB setup type
    echo "🔒 SECURE MONGODB SETUP OPTIONS:"
    echo "   1. 🏠 Local MongoDB (Recommended - Private & Secure)"
    echo "   2. ☁️  MongoDB Atlas (Cloud - Your own account)"
    echo ""

    while true; do
        read -p "Which setup would you prefer? (1/2): " SETUP_CHOICE
        if [ "$SETUP_CHOICE" = "1" ] || [ "$SETUP_CHOICE" = "2" ]; then
            break
        else
            echo "❌ Please enter 1 or 2"
        fi
    done

    if [ "$SETUP_CHOICE" = "1" ]; then
        # LOCAL MONGODB SETUP
        echo ""
        echo "🏠 LOCAL MONGODB SETUP:"
        echo "   ✅ Complete privacy - your data never leaves your machine"
        echo "   ✅ No cloud accounts needed"
        echo "   ✅ Faster performance"
        echo ""

        MONGODB_CONNECTION="mongodb://localhost:27017"
        echo "✅ Using local MongoDB: $MONGODB_CONNECTION"
        echo ""
        echo "📥 If MongoDB isn't installed yet:"
        echo "   • macOS: brew install mongodb-community"
        echo "   • Ubuntu: sudo apt install mongodb"
        echo "   • Windows: Download from https://www.mongodb.com/try/download/community"
        echo "   • Docker: docker run -d -p 27017:27017 mongo:latest"
    else
        # MONGODB ATLAS SETUP
        echo ""
        echo "☁️  MONGODB ATLAS SETUP:"
        echo "   🔗 You need your own MongoDB Atlas account"
        echo "   📋 Get connection string: Atlas → Connect → Connect your application"
        echo "   🔒 Your connection string stays private"
        echo ""

        while true; do
            read -p "📋 Please paste your MongoDB Atlas connection string: " MONGODB_CONNECTION
            if [ -n "$MONGODB_CONNECTION" ] && [ "$MONGODB_CONNECTION" != "" ]; then
                break
            else
                echo "❌ MongoDB connection string cannot be empty!"
                echo "   Please paste your actual connection string."
                echo ""
            fi
        done
    fi
    echo ""

    # Get OpenAI API key
    echo "🤖 OpenAI API Key"
    echo "   You can find this at https://platform.openai.com/api-keys"
    echo ""
    while true; do
        read -p "📋 Please paste your OpenAI API key (starts with sk-): " OPENAI_KEY
        if [ -n "$OPENAI_KEY" ] && [ "$OPENAI_KEY" != "" ] && [[ "$OPENAI_KEY" == sk-* ]]; then
            break
        else
            echo "❌ OpenAI API key must start with 'sk-' and cannot be empty!"
            echo "   Please paste your actual API key."
            echo ""
        fi
    done
    echo ""
else
    echo "🚨 NON-INTERACTIVE MODE DETECTED!"
    echo ""
    echo "   You're running this script via 'curl | bash' which doesn't support interactive input."
    echo "   Please download and run the script directly for the interactive experience:"
    echo ""
    echo "   wget https://raw.githubusercontent.com/romiluz13/mcp_context_engineering/main/install.sh"
    echo "   chmod +x install.sh"
    echo "   ./install.sh"
    echo ""
    echo "   OR set environment variables manually:"
    echo "   export MDB_MCP_CONNECTION_STRING='your-mongodb-connection-string'"
    echo "   export MDB_MCP_OPENAI_API_KEY='your-openai-api-key'"
    echo ""
    echo "   Then run: npm install -g mcp-context-engineering"
    echo ""
    exit 1
fi

# Final validation before setting variables
echo "🔍 Validating credentials..."
if [ -z "$MONGODB_CONNECTION" ] || [ -z "$OPENAI_KEY" ]; then
    echo "❌ Critical error: Empty credentials detected!"
    echo "   This should not happen. Please report this bug."
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

    # Remove any existing MCP Context Engineering Platform entries
    sed -i '' '/# MCP Context Engineering Platform/,+2d' "$SHELL_PROFILE" 2>/dev/null || true

    # Add new entries
    echo "" >> "$SHELL_PROFILE"
    echo "# MCP Context Engineering Platform" >> "$SHELL_PROFILE"
    printf "export MDB_MCP_CONNECTION_STRING='%s'\n" "$MONGODB_CONNECTION" >> "$SHELL_PROFILE"
    printf "export MDB_MCP_OPENAI_API_KEY='%s'\n" "$OPENAI_KEY" >> "$SHELL_PROFILE"
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
