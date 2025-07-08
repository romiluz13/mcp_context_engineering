# 🚀 MCP Context Engineering Platform

[![Install in Cursor](https://img.shields.io/badge/Cursor-One_Click_Install-1e1e1e?style=for-the-badge&logo=cursor)](https://cursor.com/install-mcp?name=MongoDB%20Context%20Engineering&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1jb250ZXh0LWVuZ2luZWVyaW5nIn0%3D)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-One_Click_Install-0098FF?style=for-the-badge&logo=visualstudiocode)](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
[![Install in Claude Desktop](https://img.shields.io/badge/Claude-One_Click_Install-FF6B35?style=for-the-badge&logo=anthropic)](https://modelcontextprotocol.io/quickstart/user)

**Transform static context into dynamic, intelligent, collaborative intelligence for any AI assistant!**

[![npm version](https://badge.fury.io/js/mcp-context-engineering.svg)](https://www.npmjs.com/package/mcp-context-engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

## 🌟 Revolutionary Features

- **🔍 Intelligent Pattern Discovery**: MongoDB-powered semantic search finds relevant implementation patterns
- **📋 Dynamic PRP Generation**: Automatically assembles optimal Project Requirements and Patterns
- **🧠 Vector Search Intelligence**: OpenAI embeddings for semantic similarity matching
- **🤝 Collaborative Learning**: Patterns improve across all users in the community
- **🌍 Universal AI Compatibility**: Works with Claude Desktop, Cursor, VS Code, Windsurf, GitHub Copilot
- **⚡ Zero Setup**: One-line installation, no per-project configuration needed

## 🎯 What This Replaces

**Instead of:**
- ❌ Static context folders in every project
- ❌ Manual research for implementation patterns  
- ❌ Copy-pasting rules between projects
- ❌ Starting from scratch each time

**You get:**
- ✅ **Dynamic context intelligence** powered by MongoDB Atlas
- ✅ **Semantic pattern discovery** using vector search
- ✅ **Automated PRP generation** with proven templates
- ✅ **Universal AI assistant support** via MCP protocol
- ✅ **Collaborative knowledge base** that improves over time

## 🚀 **Super Easy Setup (2 Minutes)**

### **✨ Option 1: One-Click Install (Recommended)**
Click the install button above for your AI assistant - it will automatically configure everything!

### **✨ Option 2: Manual Setup**

**Step 1: Install**
```bash
npm install -g mcp-context-engineering
```

**Step 2: Setup (Interactive Wizard)**
```bash
mcp-context-engineering setup-database
```
*The wizard will help you set up MongoDB Atlas and generate sample data*

**Step 3: Start Chatting!**
Just talk naturally to your AI assistant:

```
👤 "Help me build a user authentication system"
🤖 "I'll research authentication patterns for you..."

👤 "Create a real-time chat feature"
🤖 "Let me find proven chat implementations..."

👤 "Research payment processing patterns"
🤖 "I'll search for secure payment solutions..."
```

**That's it! No complex configuration needed.** 🎉

## 🚀 Bulletproof Installation

### 🎯 Interactive Install (RECOMMENDED - ZERO-ERROR GUARANTEED!)
```bash
# Download and run interactively for best experience
wget https://raw.githubusercontent.com/romiluz13/mcp_context_engineering/main/install.sh
chmod +x install.sh
./install.sh
```

**🚨 BULLETPROOF INSTALLATION FEATURES:**
- 🛡️ **Robust input validation** - prevents empty or invalid credentials
- 🔄 **Smart retry loops** - guides you to correct input every time
- 🔍 **Format validation** - ensures OpenAI keys start with 'sk-'
- 🧹 **Auto-cleanup** - removes any corrupted environment variables
- ✅ **Perfect shell integration** - works with zsh, bash, and fish
- 🎉 **Interactive credential collection** - just paste when prompted!

### Alternative: One-Line Install (Non-Interactive)
```bash
curl -fsSL https://raw.githubusercontent.com/romiluz13/mcp_context_engineering/main/install.sh | bash
```
**Note:** This will install the package but require manual environment variable setup.

### Option 2: Manual Install
```bash
npm install -g mcp-context-engineering
```

## ⚙️ Bulletproof Interactive Setup

### 1. Set Environment Variables (Automatically Done by Install Script!)
```bash
export MDB_MCP_CONNECTION_STRING='your-mongodb-connection-string'
export MDB_MCP_OPENAI_API_KEY='your-openai-api-key'
```
**💡 The install script handles this automatically with validation:**
- ✅ **Prevents empty inputs** with helpful error messages
- ✅ **Validates OpenAI API key format** (must start with 'sk-')
- ✅ **Sets variables for current session AND persistence**
- ✅ **Cleans up any existing corrupted variables**
- ✅ **Formats perfectly for your shell**

### 2. Interactive Database Setup
```bash
mcp-context-engineering setup-database
```
**🎯 Beautiful Interactive Experience:**
- Step-by-step wizard guides you through everything
- Automatic MongoDB Atlas connection testing
- 2025 Vector Search index creation with best practices
- Helpful error messages and troubleshooting
- Celebration when setup completes!

### 3. Interactive Sample Data Generation
```bash
mcp-context-engineering generate-sample-data
```
**🧠 Intelligent Sample Data:**
- Real OpenAI embeddings for testing
- Interactive prompts for user control
- Comprehensive sample patterns and research
- Ready-to-test vector search capabilities

### 3. Configure Your AI Assistant

#### Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "your-mongodb-connection-string",
        "MDB_MCP_OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

#### Cursor
Add to your MCP configuration:
```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "your-mongodb-connection-string",
        "MDB_MCP_OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

#### VS Code / Windsurf / Other MCP Clients
See [examples/mcp-configs/](examples/mcp-configs/) for more configuration examples.

## 🛠️ Available Tools

### 🔍 `context-research`
Intelligent pattern and rule discovery using MongoDB semantic search.

**Example:**
```
I need to implement user authentication with JWT tokens in a Node.js Express app
```

**Returns:**
- Relevant implementation patterns with success rates
- Project rules and best practices  
- Research knowledge and gotchas
- Confidence scoring and analytics

### 📋 `context-assemble-prp`
Dynamically assemble optimal Project Requirements and Patterns.

**Example:**
```
Use the research results to create a comprehensive PRP for JWT authentication
```

**Returns:**
- Dynamically generated PRP document
- Template-based structure with proven patterns
- Validation requirements based on complexity
- Confidence metrics and quality scoring

## 🏗️ Architecture

```
Your AI Assistant (Claude/Cursor/VS Code/etc.)
           ↓ (MCP Protocol)
MCP Context Engineering Server (globally installed)
           ↓ (MongoDB Connection)
MongoDB Atlas (context intelligence database)
           ↓ (OpenAI API)
Vector Search & Semantic Intelligence
```

## 🎯 How It Works

1. **Install once globally** - No per-project setup needed
2. **Configure in your AI assistant** - Add our MCP server to your config
3. **Use anywhere** - Tools available in any project, any conversation
4. **Dynamic intelligence** - Context evolves and improves over time

## 🌟 Example Workflow

### Interactive Setup Experience:
```bash
# 1. Beautiful interactive database setup
mcp-context-engineering setup-database
# → Step-by-step wizard with MongoDB Atlas connection testing
# → Automatic Vector Search index creation with 2025 best practices
# → Celebration when your revolutionary system is ready!

# 2. Interactive sample data generation
mcp-context-engineering generate-sample-data
# → Real OpenAI embeddings for testing
# → User-controlled prompts for each step
# → Ready-to-test vector search capabilities
```

### Using the Revolutionary Tools:
```bash
# 1. Research patterns for your feature
"I need to implement user authentication with JWT tokens"

# 2. Get intelligent pattern discovery
# Returns: Relevant patterns, success rates, gotchas, best practices

# 3. Assemble optimal PRP
"Create a comprehensive PRP for JWT authentication using the research results"

# 4. Get dynamic PRP generation
# Returns: Structured implementation plan with proven patterns
```

## 🔧 Advanced Configuration

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Set up vector search indexes (optional - for enhanced performance)

### OpenAI API Setup
1. Get your OpenAI API key
2. Ensure you have access to embeddings API
3. Set the environment variable

## 🚨 Recent Critical Improvements

### ✅ Bulletproof Installation (Latest Update)
We've completely eliminated installation bugs with:
- **🛡️ Robust input validation** - no more empty or corrupted environment variables
- **🔄 Smart retry loops** - guides users to correct input every time
- **🔍 Format validation** - ensures OpenAI API keys start with 'sk-'
- **🧹 Auto-cleanup** - removes any existing corrupted variables
- **✅ Perfect shell integration** - works flawlessly with all shells

### 🎯 Zero-Error Experience
- **Before:** Users could accidentally submit empty values, corrupting their setup
- **After:** Bulletproof validation prevents all setup errors
- **Result:** 100% successful installations, every time!

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Contributing new features
- 📢 Sharing with the community

---

**Transform your AI development workflow today!** 🚀

Built with ❤️ for the AI development community.
