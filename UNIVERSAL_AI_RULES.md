# 🤖 Universal AI Assistant Rules

## **Core Principles for AI-Assisted Development**

These rules apply to **ALL AI assistants** (Cursor, VS Code Copilot, Claude Desktop, Windsurf, GitHub Copilot) when working with the MCP Context Engineering Platform.

---

## 🎯 **Project Awareness & Context**

### **Rule 1: Always Understand Before Acting**
- **Read project documentation** before making changes
- **Examine existing patterns** and maintain consistency
- **Check for configuration files** (package.json, tsconfig.json, etc.)
- **Understand the technology stack** and follow its conventions

### **Rule 2: Leverage Context Engineering Tools**
- **Use `context-research`** to discover relevant patterns before implementation
- **Use `context-assemble-prp`** to generate comprehensive implementation plans
- **Follow the generated PRPs** for consistent, high-quality implementations
- **Learn from success rates** and confidence scores in research results

---

## 🏗️ **Code Structure & Quality**

### **Rule 3: Maintain Clean Architecture**
- **Keep files manageable** (<500 lines when possible)
- **Organize by responsibility** (separate concerns clearly)
- **Use consistent imports** and module structure
- **Follow established naming conventions** in the project

### **Rule 4: Write Self-Documenting Code**
- **Use descriptive variable and function names**
- **Add comments for complex business logic**
- **Include JSDoc/TypeDoc for public APIs**
- **Maintain README files for significant modules**

### **Rule 5: Handle Errors Gracefully**
- **Always implement proper error handling**
- **Use appropriate error types** (custom errors when needed)
- **Log errors with sufficient context** for debugging
- **Provide meaningful error messages** to users

---

## 🧪 **Testing & Reliability**

### **Rule 6: Test-Driven Quality**
- **Write tests for new features** using the project's testing framework
- **Update existing tests** when modifying functionality
- **Include comprehensive coverage**: happy path, edge cases, error handling
- **Run tests before committing** changes

### **Rule 7: Validation Loops**
- **Validate implementations** against requirements
- **Check for regressions** in existing functionality
- **Verify performance** meets expectations
- **Ensure security** best practices are followed

---

## 🔄 **Development Workflow**

### **Rule 8: Incremental Development**
- **Break large features** into smaller, manageable pieces
- **Implement core functionality first**, then add enhancements
- **Test each increment** before moving to the next
- **Commit frequently** with descriptive messages

### **Rule 9: Documentation & Communication**
- **Update documentation** when changing functionality
- **Explain complex decisions** in code comments
- **Maintain changelog** for significant changes
- **Document API changes** and breaking changes

---

## 🛡️ **Security & Performance**

### **Rule 10: Security First**
- **Validate all inputs** and sanitize data
- **Use environment variables** for sensitive configuration
- **Follow principle of least privilege**
- **Keep dependencies updated** and audit for vulnerabilities

### **Rule 11: Performance Awareness**
- **Consider performance implications** of implementation choices
- **Use appropriate data structures** and algorithms
- **Implement caching** where beneficial
- **Monitor and profile** performance-critical code

---

## 🤝 **Collaboration & Learning**

### **Rule 12: Learn and Adapt**
- **Study successful patterns** from context research
- **Adapt to project-specific conventions**
- **Learn from implementation outcomes**
- **Contribute patterns back** to the knowledge base

### **Rule 13: Universal Compatibility**
- **Write code that works** across different environments
- **Use standard APIs** and avoid assistant-specific features
- **Follow universal best practices**
- **Ensure portability** across development setups

---

## 📊 **Context Engineering Integration**

### **Rule 14: Research Before Implementation**
```json
// Always start with context research
{
  "feature_request": "your feature description",
  "technology_stack": ["relevant", "technologies"],
  "success_rate_threshold": 0.7
}
```

### **Rule 15: Follow Generated PRPs**
- **Use the complete PRP** as your implementation guide
- **Follow the phases** (Foundation → Core → Integration)
- **Implement validation strategies** as specified
- **Address anti-patterns** and gotchas mentioned

### **Rule 16: Contribute to Learning**
- **Report implementation outcomes** (success/failure)
- **Share new patterns** that work well
- **Update success rates** based on real-world results
- **Help improve the knowledge base**

---

## 🎯 **Success Criteria**

### **Every Implementation Should:**
- ✅ **Function correctly** according to requirements
- ✅ **Follow established patterns** and conventions
- ✅ **Include appropriate tests** and error handling
- ✅ **Be well-documented** and maintainable
- ✅ **Perform efficiently** and securely
- ✅ **Integrate seamlessly** with existing code

### **Quality Indicators:**
- **High confidence scores** from context research
- **Successful validation** of all test cases
- **Clean, readable code** that follows project patterns
- **Comprehensive error handling** and edge case coverage
- **Performance within** acceptable parameters

---

## 🚀 **Remember: Context Engineering is Revolutionary**

These rules enable **dynamic, intelligent, collaborative development** that learns and improves over time. By following these principles, you're not just writing code—you're contributing to a revolutionary platform that makes AI-assisted development more effective for everyone.

**Transform static context into dynamic intelligence!**
