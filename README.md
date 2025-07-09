# MCP Context Engineering

AI coding assistant with persistent memory and collaborative intelligence.

[![npm version](https://badge.fury.io/js/mcp-context-engineering.svg)](https://www.npmjs.com/package/mcp-context-engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Memory Banks**: AI remembers your project across sessions
- **Pattern Research**: Search proven implementation patterns from community
- **Smart PRPs**: Generate detailed implementation plans with validation
- **Real-time Updates**: Context evolves as you code

## Installation

```bash
npm install -g mcp-context-engineering
```

## Configuration

Add to your MCP config file:

**Cursor** (`.cursor/mcp.json`):
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

**Claude Desktop** (`claude_desktop_config.json`):
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

**API Keys**: [MongoDB Atlas](https://cloud.mongodb.com/) (free) • [OpenAI](https://platform.openai.com/api-keys)

## How to Use

Just talk to your AI assistant naturally:

```
"Help me build user authentication using MongoDB Context Engineering"
```

The AI will automatically:
1. **Research patterns** - Find proven solutions from community
2. **Generate PRP** - Create detailed implementation plan
3. **Implement code** - Build with validation loops
4. **Update memory** - Remember for next session

## Available Tools

| Tool | Purpose |
|------|---------|
| `context-research` | Search proven patterns with success rates |
| `context-assemble-prp` | Generate implementation plans (PRPs) |
| `memory-bank-initialize` | Create project memory structure |
| `memory-bank-read` | Restore context across sessions |
| `memory-bank-update` | Document progress |
| `memory-bank-sync` | Sync with collaborative intelligence |

## Example Workflow

```
You: "Help me build user authentication using MongoDB Context Engineering"

AI: I'll help you build authentication! Let me research proven patterns...
    [calls context-research automatically]

    Found patterns:
    - JWT Authentication (94% success rate)
    - Password Hashing with bcrypt (97% success rate)
    - Role-Based Access Control (89% success rate)

    [calls context-assemble-prp automatically]

    Generated comprehensive PRP with validation loops...

    Now implementing authentication system...
    [builds complete system with tests]

    ✅ Authentication system complete!
```

## Troubleshooting

**AI not using tools?** Include "using MongoDB Context Engineering" in your request.

**Still not working?** Restart AI assistant after MCP configuration.

## License

MIT
