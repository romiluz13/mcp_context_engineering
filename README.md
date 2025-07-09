# MCP Context Engineering

Persistent memory banks and collaborative intelligence for AI coding assistants.

[![npm version](https://badge.fury.io/js/mcp-context-engineering.svg)](https://www.npmjs.com/package/mcp-context-engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What It Does

- **Memory Banks**: AI remembers project context across sessions
- **Pattern Research**: Search MongoDB for proven implementation patterns
- **PRP Generation**: Create detailed implementation plans with validation loops
- **Collaborative Intelligence**: Learn from community successes and failures

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

## Usage

### Initialize Memory Bank
```
"Initialize memory bank for [project] using memory-bank-initialize"
```

### Research Patterns
```
"Research patterns for [feature] using context-research"
```

### Generate Implementation Plan
```
"Generate PRP for [feature] using context-assemble-prp"
```

### Workflow
1. Initialize memory bank for project
2. Research proven patterns from MongoDB
3. Generate detailed implementation plan (PRP)
4. Implement with validation loops
5. Update memory bank with progress

## Available Tools

- `memory-bank-initialize` - Create project memory structure
- `memory-bank-read` - Restore context across sessions
- `memory-bank-update` - Document progress
- `context-research` - Search proven patterns with success rates
- `context-assemble-prp` - Generate implementation plans (PRPs)
- `capture-successful-prp` - Store successful patterns

## Troubleshooting

Include tool names in requests:
```
"Research patterns using context-research"
"Initialize memory bank using memory-bank-initialize"
"Generate PRP using context-assemble-prp"
```

Restart AI assistant after MCP configuration.

## License

MIT
