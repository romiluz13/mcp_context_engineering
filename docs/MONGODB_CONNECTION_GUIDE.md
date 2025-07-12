# 🔌 MongoDB Connection Guide for Context Engineering

## 🎯 Overview

Context Engineering MCP supports both **Local MongoDB** and **MongoDB Atlas**. The system automatically detects which one you're using based on your connection string.

## 🚀 Quick Setup

### Option 1: MongoDB Atlas (Cloud)

1. **Ensure IP Whitelist**:
   - Go to MongoDB Atlas Dashboard
   - Navigate to Network Access
   - Add your current IP: `104.30.164.14`
   - Or add `0.0.0.0/0` to allow all IPs (less secure but works everywhere)

2. **Your Connection String** (already in `~/.cursor/mcp.json`):
   ```
   mongodb+srv://romiluz:H97r3aQBnxWawZbx@contextengineering.hdx0p3f.mongodb.net/?retryWrites=true&w=majority&appName=contextengineering
   ```

3. **Run Setup Script**:
   ```bash
   node scripts/setup-mongodb.js "mongodb+srv://romiluz:H97r3aQBnxWawZbx@contextengineering.hdx0p3f.mongodb.net/?retryWrites=true&w=majority&appName=contextengineering"
   ```

### Option 2: Local MongoDB

1. **Ensure MongoDB is Running**:
   ```bash
   brew services start mongodb-community
   ```

2. **Run Setup Script**:
   ```bash
   node scripts/setup-mongodb.js
   # Or explicitly:
   node scripts/setup-mongodb.js "mongodb://localhost:27017"
   ```

## 🔧 MCP Configuration

### For Cursor (Your Current Setup)

Your `~/.cursor/mcp.json` already has the correct configuration:
```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb+srv://...",
        "MDB_MCP_OPENAI_API_KEY": "sk-proj-..."
      }
    }
  }
}
```

### For Claude Desktop

Create `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "your-connection-string",
        "MDB_MCP_OPENAI_API_KEY": "your-openai-key"
      }
    }
  }
}
```

## 🚨 Troubleshooting

### Issue: "Server selection timed out after 30000 ms"

**For MongoDB Atlas:**
1. **Check IP Whitelist**:
   ```bash
   # Get your current IP
   curl -s https://api.ipify.org
   ```
   Add this IP to MongoDB Atlas Network Access

2. **Check Connection String**:
   - Ensure username/password are correct
   - Try the connection in MongoDB Compass first

3. **Network Issues**:
   - Check if you're behind a corporate firewall
   - Try using a different network

**For Local MongoDB:**
1. **Check if MongoDB is Running**:
   ```bash
   brew services list | grep mongodb
   # Should show "started"
   ```

2. **Start MongoDB if Needed**:
   ```bash
   brew services start mongodb-community
   ```

### Issue: "MongoDB client not initialized" in MCP

1. **Restart Cursor/Claude Desktop**:
   - Completely quit the application (Cmd+Q)
   - Start it again
   - MCP servers restart on app launch

2. **Check MCP Logs**:
   ```bash
   # For Cursor
   tail -f ~/Library/Logs/Cursor/main.log | grep -i mcp
   ```

3. **Verify Configuration**:
   ```bash
   # Check if MCP can see the env vars
   cat ~/.cursor/mcp.json | jq '.mcpServers."context-engineering".env'
   ```

### Issue: Vector Search Not Working

**For MongoDB Atlas:**
- Vector search indexes must be created manually in Atlas UI
- See `docs/vector-search-setup.md` for detailed instructions
- The system will fall back to regular search if vector indexes don't exist

**For Local MongoDB:**
- Vector search requires MongoDB Atlas
- Local MongoDB will use fallback search algorithms

## 🔍 Testing Your Connection

### 1. Direct Connection Test
```bash
node -e "
const { MongoClient } = require('mongodb');
const uri = 'YOUR_CONNECTION_STRING_HERE';
MongoClient.connect(uri)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Failed:', err.message));
"
```

### 2. After Cursor Restart
Use the health check tool:
```
health-check --detailed=true
```

Should show:
```
✅ MongoDB Connection
Status: healthy
Message: Connected successfully
```

## 📋 Connection String Formats

### MongoDB Atlas
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/context_engineering
```

### Local with Authentication
```
mongodb://username:password@localhost:27017/context_engineering?authSource=admin
```

## 🎯 Your Specific Setup

Based on your configuration:
- **MongoDB Atlas**: `contextengineering.hdx0p3f.mongodb.net`
- **Database**: `context_engineering`
- **Connection Type**: Atlas (Cloud)
- **Current IP**: `104.30.164.14` (needs to be whitelisted)

**Next Steps:**
1. Add your IP to MongoDB Atlas whitelist
2. Restart Cursor
3. Run `health-check --detailed=true` to verify connection

## 💡 Pro Tips

1. **IP Whitelist Changes**: If you work from different locations, consider:
   - Using `0.0.0.0/0` for development (allow all IPs)
   - Using a VPN with a static IP
   - Adding multiple specific IPs

2. **Connection Pooling**: The MCP server uses connection pooling for performance
   - Max pool size: 10
   - Min pool size: 2
   - Automatic retry on connection failure

3. **Database Selection**: The system always uses `context_engineering` database
   - Collections are created automatically
   - Indexes are optimized for performance

Remember: The MCP server connects to MongoDB when tools are called, not on startup! 