# MCP Context Engineering

Revolutionary AI coding assistant with persistent memory and collaborative intelligence.

[![npm version](https://badge.fury.io/js/mcp-context-engineering.svg)](https://www.npmjs.com/package/mcp-context-engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 What Makes This Revolutionary?

This is an **MCP (Model Context Protocol) server** that transforms how AI assistants understand and build software:

- **🧠 Personal Pattern Library**: MongoDB stores YOUR successful patterns with success metrics
- **🤝 Works with ANY AI**: Cursor, Claude Desktop, VSCode - any MCP-compatible assistant
- **📈 Gets Smarter Over Time**: Patterns improve based on real implementation success
- **💾 Persistent Memory**: Context maintained across sessions (memory banks coming soon)
- **🌐 Collaborative Intelligence**: Learn from community patterns while keeping your data private

## 📋 How It Works

Unlike traditional context engineering that uses static files, MCP Context Engineering provides **dynamic intelligence**:

```
You → AI Assistant → MCP Server → MongoDB Intelligence → Smart Implementation
```

The AI assistant orchestrates everything through natural conversation!

## 🛠️ Installation & Configuration

### Step 1: Install the Package
```bash
npm install -g mcp-context-engineering
```

### Step 2: Configure Your AI Assistant
Add the server configuration to your AI assistant with your MongoDB and OpenAI credentials. 
**That's it!** The database and collections are created automatically on first use.

**For Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb+srv://user:pass@cluster.mongodb.net/",
        "MDB_MCP_OPENAI_API_KEY": "sk-your-openai-key"
      }
    }
  }
}
```

**For Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb+srv://user:pass@cluster.mongodb.net/",
        "MDB_MCP_OPENAI_API_KEY": "sk-your-openai-key"
      }
    }
  }
}
```

## 💬 Usage - Natural Conversation!

Just talk to your AI assistant naturally:

```
"Help me build user authentication using MongoDB Context Engineering"
```

The AI will automatically:
1. **Research patterns** from your personal library and community
2. **Search your codebase** for existing patterns
3. **Search the web** for latest best practices
4. **Generate a comprehensive PRP** with all findings
5. **Implement the code** with validation loops
6. **Update your pattern library** with what worked

## 🔧 MCP Tools (AI-Called, Not CLI)

| Tool | Purpose | When AI Uses It |
|------|---------|-----------------|
| `context-research` | Search proven patterns | When you ask to build something |
| `context-assemble-prp` | Generate implementation plans | After research completes |
| `memory-bank-initialize` | Create project memory | Starting new projects |
| `memory-bank-read` | Restore context | Resuming work sessions |
| `memory-bank-update` | Save progress | After implementations |

## 📚 Example Conversation

```
You: Help me build a REST API with authentication using MongoDB Context Engineering

AI: I'll help you build a REST API with authentication! Let me start by researching 
proven patterns from your MongoDB intelligence...

[AI automatically calls context-research]
Found patterns:
• Express.js REST API (92% success rate)
• JWT Authentication (94% success rate)  
• MongoDB User Model (96% success rate)
• bcrypt Password Hashing (97% success rate)

[AI searches your codebase]
Found your existing patterns in:
• src/middleware/auth.js
• src/models/BaseModel.js

[AI searches web for latest practices]
Found latest best practices from:
• Express.js official docs
• OWASP security guidelines

[AI calls context-assemble-prp]
Generated comprehensive PRP with:
• Step-by-step implementation plan
• Your project's coding standards
• Security best practices
• Validation checkpoints

Now implementing your REST API...
[AI builds the complete system]

✅ REST API with authentication complete!
• All tests passing (95% coverage)
• Security best practices implemented
• Following your project patterns
```

## 🚨 Common Issues

**"AI not using MCP tools"**
- Include "using MongoDB Context Engineering" in your request
- Restart your AI assistant after configuration

**"Tool call failed"**
- Check your MongoDB connection string in the MCP configuration
- Verify your OpenAI API key is valid
- Ensure MongoDB is accessible from your network

## 🏗️ Architecture

```
Your AI Assistant
    ↓
MCP Protocol
    ↓
MCP Context Engineering Server
    ├── Pattern Research (MongoDB)
    ├── PRP Generation
    ├── Memory Banks
    └── Collaborative Intelligence
         ↓
    MongoDB Atlas
    (Your Pattern Library)
```

## 🤝 Contributing

This project revolutionizes AI-assisted development. Contributions welcome!

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

**Transform static prompts into dynamic, learning, collaborative intelligence!** 🚀
