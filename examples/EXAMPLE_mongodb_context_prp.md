name: "MongoDB Context Engineering: AI-Powered Code Review System"
description: |

## Purpose
Build an AI-powered code review system using MongoDB Context Engineering Platform that leverages vector search for pattern detection, collaborative learning for improvement suggestions, and MCP protocol for universal AI assistant integration.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **MongoDB Intelligence**: Leverage vector search and collaborative learning

---

## Goal
Create a production-ready AI code review system that analyzes code quality, suggests improvements, detects anti-patterns, and learns from successful implementations across the community through MongoDB Context Engineering Platform.

## Why
- **Business value**: Automates code review process with AI intelligence
- **Integration**: Demonstrates MongoDB Context Engineering capabilities
- **Problems solved**: Reduces manual code review time while improving code quality
- **Learning**: Builds community knowledge base of successful patterns

## What
A comprehensive code review system where:
- AI assistants analyze code using MongoDB pattern intelligence
- Vector search finds similar successful implementations
- Collaborative learning improves suggestions over time
- Universal compatibility across all AI coding assistants

### Success Criteria
- [ ] Code analysis with pattern detection via MongoDB vector search
- [ ] AI-powered improvement suggestions based on community knowledge
- [ ] Anti-pattern detection with alternative recommendations
- [ ] Integration with MongoDB Context Engineering Platform
- [ ] Universal AI assistant compatibility via MCP protocol
- [ ] Collaborative learning from successful implementations

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://github.com/romiluz13/mcp_context_engineering
  why: MongoDB Context Engineering Platform documentation and setup
  
- url: https://docs.mongodb.com/atlas/atlas-vector-search/
  why: MongoDB Atlas Vector Search for pattern similarity detection
  
- url: https://platform.openai.com/docs/guides/embeddings
  why: OpenAI embeddings for semantic code analysis
  
- file: examples/mcp-configs/README.md
  why: MCP configuration for universal AI assistant compatibility
  
- file: UNIVERSAL_AI_RULES.md
  why: Universal AI assistant rules and best practices
  
- url: https://modelcontextprotocol.io/
  why: Model Context Protocol specification for AI assistant integration
```

### MongoDB Context Engineering Integration
```yaml
# MCP Tools Available
- tool: context-research
  purpose: Find similar code patterns and successful implementations
  usage: Research existing solutions before implementing new features
  
- tool: context-assemble-prp
  purpose: Generate dynamic PRPs with MongoDB intelligence
  usage: Create comprehensive implementation plans with community knowledge
```

### Current Codebase tree
```bash
.
├── examples/
│   ├── mcp-configs/          # MCP configuration examples
│   └── code-patterns/        # Code pattern examples
├── scripts/
│   ├── setup-database.js     # MongoDB setup
│   └── generate-sample-data.js # Sample data generation
├── src/
│   ├── index.ts             # MCP server implementation
│   └── cli.ts               # CLI wrapper
├── UNIVERSAL_AI_RULES.md    # Universal AI assistant rules
├── README.md                # Platform documentation
└── package.json             # Node.js configuration
```

### Desired Implementation Structure
```bash
.
├── code-review-system/
│   ├── src/
│   │   ├── analyzers/
│   │   │   ├── pattern-detector.ts    # MongoDB vector search integration
│   │   │   ├── quality-analyzer.ts    # Code quality analysis
│   │   │   └── anti-pattern-detector.ts # Anti-pattern detection
│   │   ├── suggestions/
│   │   │   ├── improvement-engine.ts  # AI-powered suggestions
│   │   │   └── learning-integration.ts # MongoDB learning integration
│   │   ├── mcp/
│   │   │   └── review-tools.ts        # MCP tools for AI assistants
│   │   └── index.ts                   # Main application
│   ├── tests/
│   │   ├── analyzers.test.ts          # Analyzer tests
│   │   └── integration.test.ts        # Integration tests
│   └── package.json                   # Dependencies
├── examples/
│   └── sample-code/                   # Sample code for testing
└── README.md                          # Implementation documentation
```

## Implementation Strategy

### Phase 1: MongoDB Integration
1. Set up MongoDB Context Engineering Platform
2. Configure vector search for code pattern detection
3. Implement pattern similarity analysis
4. Test with sample code patterns

### Phase 2: AI Analysis Engine
1. Build code quality analyzers using MongoDB intelligence
2. Implement anti-pattern detection with community knowledge
3. Create improvement suggestion engine
4. Integrate collaborative learning feedback

### Phase 3: MCP Integration
1. Create MCP tools for universal AI assistant compatibility
2. Implement real-time code review via AI assistants
3. Add collaborative learning integration
4. Test across multiple AI coding assistants

### Phase 4: Production Deployment
1. Comprehensive testing and validation
2. Performance optimization
3. Documentation and examples
4. Community knowledge base seeding

## Validation Loops

### Testing Strategy
```bash
# Run pattern detection tests
npm test -- --grep "pattern-detection"

# Test MongoDB vector search integration
npm test -- --grep "vector-search"

# Validate MCP tool functionality
npm test -- --grep "mcp-tools"

# Integration tests with AI assistants
npm test -- --grep "ai-integration"
```

### Quality Gates
- [ ] All tests pass with >90% coverage
- [ ] MongoDB vector search returns relevant patterns
- [ ] AI suggestions improve code quality metrics
- [ ] MCP tools work across all supported AI assistants
- [ ] Collaborative learning shows improvement over time

---

## MongoDB Context Engineering Commands

```bash
# Research existing code review patterns
mcp-context-engineering context-research "code review patterns" --tech-stack typescript,mongodb

# Generate enhanced PRP with community intelligence
mcp-context-engineering context-assemble-prp "AI code review system" --complexity advanced

# Set up MongoDB database with vector search
mcp-context-engineering setup-database

# Generate sample patterns for testing
mcp-context-engineering generate-sample-data
```

This PRP demonstrates the full power of MongoDB Context Engineering Platform for building intelligent, collaborative, and universally compatible AI-powered systems.
