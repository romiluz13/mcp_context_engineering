name: "MongoDB Context Engineering: Multi-Agent System Example"
description: |

## Purpose
Build a MongoDB-powered context engineering system where AI assistants can research patterns, assemble PRPs, and execute implementations. This demonstrates the complete MongoDB Context Engineering workflow with collaborative learning.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **MongoDB Intelligence**: Leverage vector search and collaborative learning

---

## Goal
Create a production-ready MongoDB Context Engineering platform where users can research implementation patterns via natural AI conversation, and the system automatically generates comprehensive PRPs with proven templates and success metrics.

## Why
- **Business value**: Transforms static context into dynamic, intelligent, collaborative context intelligence
- **Integration**: Demonstrates advanced MongoDB vector search and MCP protocol patterns
- **Problems solved**: Eliminates 30+ minute manual research with instant MongoDB intelligence

## What
A universal MCP server where:
- Users chat naturally with any AI assistant
- AI automatically calls context-research for pattern discovery
- AI automatically calls context-assemble-prp for implementation planning
- Results include proven patterns, success rates, and validation loops
- System learns from all implementations across users

### Success Criteria
- [ ] context-research successfully finds relevant patterns via MongoDB vector search
- [ ] context-assemble-prp creates comprehensive PRPs with validation loops
- [ ] Universal AI assistant compatibility via MCP protocol
- [ ] Collaborative learning improves patterns over time
- [ ] All tests pass and code meets production standards

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.mongodb.com/atlas/atlas-vector-search/
  why: MongoDB Vector Search implementation patterns
  
- url: https://modelcontextprotocol.io/docs/
  why: MCP protocol specification and best practices
  
- url: https://platform.openai.com/docs/guides/embeddings
  why: OpenAI embeddings for semantic search
  
- file: src/index.ts
  why: Complete MCP server implementation with MongoDB integration
  
- file: scripts/setup-database.js
  why: MongoDB Atlas setup and vector index creation
  
- file: examples/mcp-configs/
  why: Universal AI assistant configuration examples
```

### Current Codebase tree
```bash
.
├── src/
│   └── index.ts                 # Complete MCP server with MongoDB tools
├── scripts/
│   ├── setup-database.js       # Interactive MongoDB setup
│   ├── generate-sample-data.js # Sample pattern generation
│   ├── create-feature.js       # Feature request creator
│   ├── generate-prp.js         # PRP generation script
│   └── execute-prp.js          # PRP execution script
├── examples/
│   ├── mcp-configs/            # AI assistant configurations
│   └── code-patterns/          # Implementation examples
├── UNIVERSAL_AI_RULES.md       # Global AI assistant rules
└── package.json               # MCP server package configuration
```

### Desired Enhancement tree with files to be added
```bash
.
├── src/
│   ├── index.ts                # Enhanced MCP server (EXISTING)
│   ├── tools/
│   │   ├── context-research.ts # Extracted research tool logic
│   │   ├── context-assemble.ts # Extracted PRP assembly logic
│   │   └── validation.ts       # Enhanced validation loops
│   ├── mongodb/
│   │   ├── collections.ts      # Collection schemas and indexes
│   │   ├── vector-search.ts    # Advanced vector search operations
│   │   └── learning.ts         # Collaborative learning algorithms
│   └── types/
│       ├── patterns.ts         # Pattern type definitions
│       ├── prps.ts            # PRP type definitions
│       └── research.ts        # Research result types
├── tests/
│   ├── integration/
│   │   ├── mcp-tools.test.js   # End-to-end MCP tool testing
│   │   └── mongodb.test.js     # MongoDB integration testing
│   └── unit/
│       ├── vector-search.test.js # Vector search unit tests
│       └── pattern-matching.test.js # Pattern matching tests
├── docs/
│   ├── API.md                  # Complete API documentation
│   ├── DEPLOYMENT.md           # Production deployment guide
│   └── CONTRIBUTING.md         # Contribution guidelines
└── examples/
    ├── advanced-patterns/      # Complex implementation examples
    ├── success-stories/        # Real-world usage examples
    └── troubleshooting/        # Common issues and solutions
```

## Implementation Plan

### Phase 1: Enhanced MCP Tool Architecture
```typescript
// src/tools/context-research.ts
export interface ResearchQuery {
  feature_request: string;
  technology_stack: string[];
  include_research: boolean;
  max_results: number;
  success_rate_threshold: number;
}

export interface PatternResult {
  name: string;
  description: string;
  success_rate: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  key_features: string[];
  implementation_notes: string[];
  gotchas: string[];
}
```

### Phase 2: Advanced MongoDB Vector Search
```javascript
// Enhanced vector search with hybrid capabilities
async function advancedPatternSearch(queryEmbedding, filters) {
  const pipeline = [
    {
      $vectorSearch: {
        index: "pattern_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 20,
        filter: {
          $and: [
            { success_rate: { $gte: filters.success_threshold } },
            { technology_stack: { $in: filters.tech_stack } }
          ]
        }
      }
    },
    {
      $addFields: {
        relevance_score: { $meta: "vectorSearchScore" }
      }
    }
  ];

  return await db.collection('implementation_patterns').aggregate(pipeline).toArray();
}
```

### Phase 3: Collaborative Learning Integration
```javascript
// Learning from implementation outcomes
async function updatePatternSuccess(patternId, outcome) {
  const result = await db.collection('implementation_outcomes').insertOne({
    pattern_id: patternId,
    success: outcome.success,
    feedback: outcome.feedback,
    timestamp: new Date(),
    user_context: outcome.context
  });

  // Update pattern success rate
  await recalculatePatternSuccessRate(patternId);
}
```

## Validation Loops

### Automated Testing Strategy
```bash
# Run comprehensive test suite
npm test                    # Unit tests
npm run test:integration   # Integration tests
npm run test:mcp          # MCP protocol compliance
npm run test:mongodb      # MongoDB operations
npm run test:vector       # Vector search accuracy
```

### Quality Gates
- [ ] All MCP tools respond within 5 seconds
- [ ] Vector search returns relevant results (>0.7 similarity)
- [ ] Pattern success rates are accurately calculated
- [ ] Collaborative learning improves recommendations over time
- [ ] Universal AI assistant compatibility verified

### Performance Benchmarks
- [ ] Handle 1000+ concurrent MCP requests
- [ ] Vector search completes in <2 seconds
- [ ] Pattern database scales to 100,000+ entries
- [ ] Memory usage stays under 512MB
- [ ] 99.9% uptime in production

---

## Next Steps After Implementation

1. **Deploy to Production**: Use MongoDB Atlas for scalability
2. **Community Integration**: Enable pattern sharing across organizations
3. **Advanced Analytics**: Track usage patterns and success metrics
4. **AI Assistant Expansion**: Add support for new MCP-compatible assistants
5. **Enterprise Features**: Role-based access, audit logs, compliance

This PRP demonstrates the complete MongoDB Context Engineering workflow with production-ready implementation details and validation loops.
