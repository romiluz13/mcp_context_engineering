# 🤖 Correct MCP Context Engineering Usage

## Real Example: Building a User Authentication System

This example shows the **correct way** to use MCP Context Engineering with any AI assistant.

## ❌ WRONG: Trying to Use CLI Commands Directly

```bash
# This is WRONG - these scripts cannot search codebases or generate comprehensive PRPs
mcp-context-engineering generate-prp "user authentication system"
mcp-context-engineering execute-prp PRPs/auth-system.md
```

**Why this fails:**
- Scripts have no access to your codebase
- Scripts cannot search the web
- Scripts cannot implement code
- Only AI assistants can orchestrate the complete workflow

## ✅ CORRECT: Natural Conversation with AI Assistant

### Step 1: Configure MCP (One-time setup)

**For Cursor:**
```json
// Add to Cursor settings
{
  "mcp": {
    "servers": {
      "context-engineering": {
        "command": "mcp-context-engineering",
        "env": {
          "MDB_MCP_CONNECTION_STRING": "mongodb+srv://...",
          "MDB_MCP_OPENAI_API_KEY": "sk-..."
        }
      }
    }
  }
}
```

**For Claude Desktop:**
```json
// Add to claude_desktop_config.json
{
  "mcpServers": {
    "context-engineering": {
      "command": "mcp-context-engineering",
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb+srv://...",
        "MDB_MCP_OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

### Step 2: Natural Conversation

```
User: Help me build a user authentication system using MongoDB Context Engineering. 
I need JWT tokens, password hashing, and role-based access control.

AI Assistant: I'll help you build a comprehensive authentication system! Let me start by researching proven patterns and best practices.

[AI calls context-research tool]
🔍 Searching MongoDB patterns for "user authentication system JWT password hashing RBAC"...

Found patterns:
- JWT Authentication Pattern (94% success rate)
- Password Hashing with bcrypt (97% success rate)  
- Role-Based Access Control (89% success rate)
- Session Management Pattern (91% success rate)

[AI searches your codebase using codebase-retrieval]
🔍 Searching your codebase for existing authentication patterns...

Found existing patterns:
- src/middleware/auth.js - JWT middleware pattern
- src/models/User.js - User model structure
- tests/auth.test.js - Authentication test patterns

[AI searches web for latest best practices]
🌐 Researching latest authentication best practices...

Found documentation:
- JWT.io official documentation
- OWASP Authentication Cheat Sheet
- Node.js security best practices
- bcrypt library documentation

[AI calls context-assemble-prp tool]
📋 Generating comprehensive PRP with all research findings...

Generated: PRPs/user_authentication_system.md (347 lines)
- Includes all MongoDB patterns with success rates
- References your existing codebase patterns
- Includes latest security best practices
- Contains 3-level validation loops
- Has comprehensive gotchas section

Now I'll implement the authentication system following this PRP...

[AI implements the complete system with validation loops]
```

### Step 3: AI Implementation Process

The AI assistant automatically:

1. **Reads the generated PRP** with all context
2. **Creates implementation plan** using task management
3. **Implements each component** following proven patterns
4. **Runs validation loops** (syntax, unit tests, integration)
5. **Fixes any issues** iteratively
6. **Ensures success criteria** are met

### Step 4: Validation and Learning

```
AI Assistant: ✅ Authentication system implemented successfully!

Completed:
- JWT token generation and validation
- Password hashing with bcrypt (12 rounds)
- Role-based middleware (admin, user, guest)
- Comprehensive test suite (95% coverage)
- Security headers and rate limiting
- All validation loops passed

Files created:
- src/auth/jwt.js
- src/auth/password.js
- src/middleware/rbac.js
- tests/auth.test.js
- docs/authentication.md

The implementation follows the MongoDB patterns with 94% average success rate and includes all security best practices from OWASP guidelines.
```

## 🎯 Key Success Factors

### 1. **AI Orchestration**
- AI assistant calls MCP tools automatically
- AI searches codebase and web
- AI generates and follows comprehensive PRPs
- AI implements with validation loops

### 2. **Natural Language Interface**
```
✅ "Help me build [feature] using MongoDB Context Engineering"
✅ "I need to implement [specific requirements]"
✅ "Follow the Context Engineering methodology"

❌ Don't try to run CLI commands manually
❌ Don't expect scripts to do AI's job
```

### 3. **MCP Tools Provide Intelligence**
- `context-research`: MongoDB patterns + research guidance
- `context-assemble-prp`: Sophisticated PRP generation
- AI assistant: Codebase search + web research + implementation

### 4. **Complete Workflow**
```
MongoDB Intelligence → Codebase Analysis → Web Research → PRP Generation → Implementation → Validation
```

## 🔧 Troubleshooting Common Issues

### "MCP tools not found"
```bash
# Install the MCP server
npm install -g mcp-context-engineering

# Verify installation
mcp-context-engineering --version

# Check MCP configuration in your AI assistant
```

### "MongoDB connection failed"
```bash
# Set up environment variables
export MDB_MCP_CONNECTION_STRING="mongodb+srv://..."
export MDB_MCP_OPENAI_API_KEY="sk-..."

# Test connection
mcp-context-engineering setup-database
```

### "AI not calling MCP tools"
- Ensure MCP is properly configured in your AI assistant
- Use natural language: "using MongoDB Context Engineering"
- Restart your AI assistant after configuration changes

## 🚀 Advanced Usage

### Custom Feature Requests
```
User: Using MongoDB Context Engineering, help me build a real-time chat system 
with WebSocket connections, message persistence, and typing indicators.

AI: I'll research real-time chat patterns and WebSocket best practices...
[Follows complete MCP workflow]
```

### Integration with Existing Projects
```
User: I have an existing Express.js API. Use MongoDB Context Engineering to add 
a notification system with email and push notifications.

AI: Let me analyze your existing codebase and research notification patterns...
[Analyzes existing code + MongoDB patterns + web research]
```

## 💡 Pro Tips

1. **Be Specific**: Include technical requirements in your request
2. **Mention MCP**: Say "using MongoDB Context Engineering" to trigger tools
3. **Trust the Process**: Let AI handle the complete research and implementation
4. **Review PRPs**: The generated PRPs contain valuable context and patterns
5. **Iterate**: Ask for improvements or modifications as needed

This is how Context Engineering evolves from static templates to dynamic, collaborative intelligence! 🎉
