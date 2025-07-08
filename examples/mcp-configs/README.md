# MCP Configuration Examples

This directory contains configuration examples for various AI assistants that support the Model Context Protocol (MCP).

## Claude Desktop

File: `claude_desktop_config.json`
Location: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

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

## Cursor

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

## VS Code

Add to your settings.json:

```json
{
  "mcp.servers": {
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

## Windsurf

Similar to VS Code configuration - add to your MCP settings.

## Environment Variables

Instead of putting credentials in config files, you can set environment variables:

```bash
export MDB_MCP_CONNECTION_STRING='your-mongodb-connection-string'
export MDB_MCP_OPENAI_API_KEY='your-openai-api-key'
```

**💡 Copy-paste ready:** Just replace the values with your actual credentials!

Then use simplified configs:

```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering"
    }
  }
}
```

## Getting Your Credentials

### MongoDB Connection String
1. Create a MongoDB Atlas cluster
2. Go to "Connect" → "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

## Troubleshooting

- Ensure `mcp-context-engineering` is installed globally: `npm install -g mcp-context-engineering`
- Check that your MongoDB connection string is correct
- Verify your OpenAI API key has access to embeddings API
- Restart your AI assistant after configuration changes
