# 🚀 MCP Context Engineering - CORRECT WORKFLOW

## ❌ WRONG: What You've Been Trying
```bash
# User runs CLI directly:
$ mcp-context-engineering generate-prp "build auth system"
# Result: Empty PRP with no real research

$ mcp-context-engineering execute-prp PRPs/auth.md
# Result: No code exists, all tests fail
```

## ✅ CORRECT: How It Should Work

### Step 1: Configure MCP in Your AI Assistant

**For Cursor:**
```json
// .cursor/mcp.json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017",
        "MDB_MCP_OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

**For Claude Desktop:**
```json
// ~/Library/Application Support/Claude/config.json (Mac)
// %APPDATA%\Claude\config.json (Windows)
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017",
        "MDB_MCP_OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

### Step 2: Use Trigger Phrases

**CRITICAL:** Context is NOT automatic! Use these exact trigger phrases:

✅ **CORRECT Trigger Phrases:**
- "Help me build [feature] using MongoDB Context Engineering"
- "Research patterns for [feature] using context-research"
- "Generate a PRP for [feature] using context-assemble-prp"
- "Use MongoDB Context Engineering to implement [feature]"

❌ **WRONG (Won't trigger tools):**
- "Help me build authentication" (missing trigger)
- "Build a login system" (no MCP mention)
- "Create user management" (won't call tools)

### Step 3: AI Conversation Example

**You:** Help me build a user authentication system using MongoDB Context Engineering

**AI Assistant:** I'll help you build a user authentication system using the MongoDB Context Engineering workflow. Let me start by researching proven patterns and best practices.

*[AI calls context-research tool]*

Now let me search your codebase for existing authentication patterns and conventions...

*[AI searches your actual code files]*

Let me also find the latest documentation and best practices online...

*[AI searches web for auth libraries, security guides, etc.]*

Now I'll assemble all this research into a comprehensive implementation plan...

*[AI calls context-assemble-prp tool with combined research]*

Great! I've created a comprehensive PRP (Project Requirements and Patterns) document. Now let me implement this step by step:

1. **Setting up the authentication module**
   *[AI creates auth module files]*

2. **Implementing password hashing**
   *[AI implements bcrypt integration]*

3. **Creating login/register endpoints**
   *[AI creates API endpoints]*

4. **Adding validation and error handling**
   *[AI adds comprehensive validation]*

5. **Writing tests**
   *[AI creates test suite]*

6. **Running validation loops**
   ```bash
   npm test  # All tests pass!
   npm run lint  # Code is clean!
   ```

**You:** Perfect! The authentication system works great!

## 🎯 Key Differences

### Original Claude Desktop Workflow
- **Commands**: `/generate-prp` and `/execute-prp`
- **Actor**: Claude AI does everything
- **Access**: Claude has full codebase and web access
- **Result**: Complete working implementation

### MCP Context Engineering Workflow
- **Tools**: `context-research` and `context-assemble-prp`
- **Actor**: ANY AI assistant (Cursor, Claude, etc.)
- **Access**: AI uses its own capabilities + MongoDB intelligence
- **Result**: Same complete implementation, but universal!

## 📋 What Each Component Does

### MCP Tools (Called by AI)
1. **context-research**: Searches MongoDB for patterns and knowledge
2. **context-assemble-prp**: Generates comprehensive implementation plans

### CLI Commands (For Setup/Maintenance)
1. **setup-database**: Creates MongoDB collections and indexes
2. **generate-sample-data**: Populates initial patterns and knowledge
3. **create-feature**: Helper to create feature request files

### What the AI Does
1. Calls MCP tools for MongoDB intelligence
2. Searches YOUR codebase for patterns
3. Searches the web for documentation
4. Implements the actual code
5. Runs tests and fixes issues

## 🚨 Common Mistakes to Avoid

❌ **Don't run generate-prp.js directly** - It can't access your code or the web

❌ **Don't run execute-prp.js directly** - It can't implement code

❌ **Don't expect CLI scripts to do the AI's job** - They're just tools

✅ **Do configure MCP in your AI assistant** - This is the correct integration

✅ **Do let the AI orchestrate everything** - It has the capabilities needed

✅ **Do use the workflow through natural conversation** - Not CLI commands

## 🎉 The Magic of MCP

The beauty of MCP (Model Context Protocol) is that it makes the MongoDB Context Engineering intelligence available to ANY AI assistant, not just Claude Desktop. The AI assistant brings its own capabilities (code search, web search, implementation) and combines them with the MongoDB intelligence layer.

This is why the CLI scripts can't work standalone - they're missing the AI's capabilities! 