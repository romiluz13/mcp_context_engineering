# Changelog

## [3.1.0] - 2025-01-11

### 🎉 Major Enhancements

#### Enhanced Memory Bank System (v3.1.0)
- **AI-Optimized Context Delivery**: Intelligent context window optimization with AI digest system
- **Advanced Prioritization Engine**: Urgency-based active context tracking
- **Comprehensive Issue Tracking**: Known issues with status and priority management
- **Smart Notes System**: Relevance-scored notes with categories
- **Data Lifecycle Management**: Automatic archiving with configurable expiry policies

#### Production-Ready Optimizations
- **MongoDB Connection Pooling**: Production-grade connection management with retry logic
- **Enhanced Indexing Strategy**: Compound indexes for optimal query performance
- **Context Window Optimization**: AI digest generation for large contexts (>8KB)
- **Backward Compatibility**: All enhancements are non-breaking with version detection

#### Embedding Provider Support
- **Voyage AI Integration**: Added support for Voyage AI embeddings (54% cost reduction)
- **Flexible Provider Configuration**: Switch between OpenAI and Voyage AI via environment variables
- **Model Support**: voyage-large-2-instruct (1024D) and voyage-code-2 (1536D)

### 🐛 Bug Fixes
- Fixed MongoDB $inc operator conflicts in replacement documents
- Improved error handling for vector search fallback scenarios
- Enhanced connection error messages for better debugging
- Fixed task name generation verbosity in PRP assembly

### 📚 Documentation
- Added comprehensive MongoDB best practices validation
- Created vector search setup guide for Atlas configuration
- Enhanced README with clearer architecture explanation
- Added example configurations for multiple embedding providers

### 🔧 Technical Improvements
- TypeScript type safety enhancements throughout codebase
- Improved error handling with user-friendly messages
- Added performance monitoring hooks
- Enhanced MCP tool schemas with better descriptions

### 🚀 Performance Metrics
- Memory Bank Read: ~100-200ms (optimized with connection pooling)
- Memory Bank Update: ~50-150ms (optimized with indexes)
- Context Assembly: ~25-50ms (optimized with AI digests)
- AI Digest Generation: ~800ms-1.5s (optimized prompts)

### 💡 Known Issues
- Vector search requires manual MongoDB Atlas index creation
- List PRPs project filtering needs refinement
- PRP execution limited to planning mode (file operations pending)

### 🔮 Future Roadmap
- Web search integration for external patterns
- Autonomous code execution capabilities
- Atlas Admin API integration
- Additional embedding providers (Cohere, Anthropic)
- Context summarization for large projects

---

## [3.0.0] - 2025-01-10

### Initial MongoDB-Native Release
- Complete rewrite for MongoDB-only architecture
- Removed all file system dependencies
- Implemented MCP server with 15+ tools
- Added collaborative intelligence features
- Vector search with graceful fallback
- Real-time pattern sharing
- Cross-session context preservation 