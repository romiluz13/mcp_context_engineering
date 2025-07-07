# MCP Configuration Examples

This directory contains example MCP configuration files for different AI assistants.

## 🔧 Setup Instructions

### 1. Choose Your AI Assistant

- **Cursor IDE**: Use `cursor-mcp.json`
- **Claude Desktop**: Use `claude-desktop-config.json`
- **VS Code with Copilot**: Use `cursor-mcp.json` (same format)

### 2. Update Configuration

Replace the placeholder values:
- `username:password@cluster.mongodb.net/` → Your MongoDB connection string
- `sk-your-openai-api-key` → Your OpenAI API key (optional)

### 3. Install Configuration

#### Cursor IDE
```bash
# Copy to Cursor's MCP configuration directory
cp cursor-mcp.json ~/.cursor/mcp.json
```

#### Claude Desktop
```bash
# macOS
cp claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
cp claude-desktop-config.json %APPDATA%\Claude\claude_desktop_config.json

# Linux
cp claude-desktop-config.json ~/.config/Claude/claude_desktop_config.json
```

### 4. Restart Your AI Assistant

After updating the configuration, restart your AI assistant to load the MCP Context Engineering Platform.

## 🚀 Verification

Once configured, your AI assistant should have access to:
- `context-research` - Intelligent pattern discovery
- `context-assemble-prp` - Dynamic implementation planning

Test by asking your AI assistant to use these tools!

## 🔧 Troubleshooting

### Common Issues

1. **"Tool not found"**
   - Verify the configuration file is in the correct location
   - Restart your AI assistant
   - Check that `mcp-context-engineering` is installed globally

2. **"MongoDB connection failed"**
   - Verify your connection string is correct
   - Ensure your MongoDB cluster allows connections from your IP
   - Check that the database user has proper permissions

3. **"OpenAI API error"**
   - Verify your OpenAI API key is correct
   - Check your OpenAI account has sufficient credits
   - Note: OpenAI integration is optional for basic functionality

### Getting Help

- Check the main README.md for detailed setup instructions
- Open an issue on GitHub if you encounter problems
- Join our community discussions for support
