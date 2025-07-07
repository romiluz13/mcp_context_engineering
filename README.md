# 🚀 MCP Context Engineering Platform

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

## 🚀 Super Easy Installation

### Option 1: One-Line Install (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/romiluz13/mcp_context_engineering/main/install.sh | bash
```

### Option 2: Manual Install
```bash
npm install -g mcp-context-engineering
```

## ⚙️ Super Easy Interactive Setup

### 1. Set Environment Variables
```bash
export MDB_MCP_CONNECTION_STRING="your-mongodb-connection-string"
export MDB_MCP_OPENAI_API_KEY="your-openai-api-key"
```

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
  "mcp": {
    "servers": {
      "context-engineering": {
        "command": "mcp-context-engineering",
        "env": {
          "MDB_MCP_CONNECTION_STRING": "your-mongodb-connection-string", 
          "MDB_MCP_OPENAI_API_KEY": "your-openai-api-key"
        }
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
