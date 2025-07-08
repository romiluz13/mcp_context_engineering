# 📋 Project Planning Template

This template provides the project architecture and planning framework referenced by CLAUDE.md. Copy this to your project root as `PLANNING.md` and customize for your specific project.

## 🎯 Project Overview

### Project Name
[Your Project Name]

### Description
[Brief description of what this project does and why it exists]

### Goals
- [Primary goal 1]
- [Primary goal 2]
- [Primary goal 3]

## 🏗️ Architecture

### Technology Stack
- **Language:** [Python/JavaScript/TypeScript/etc.]
- **Framework:** [FastAPI/Express/React/etc.]
- **Database:** [PostgreSQL/MongoDB/SQLite/etc.]
- **Testing:** [pytest/Jest/etc.]
- **Deployment:** [Docker/Vercel/AWS/etc.]

### Project Structure
```
project-root/
├── src/                    # Main source code
│   ├── main.py            # Application entry point
│   ├── models/            # Data models
│   ├── api/               # API routes/endpoints
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── tests/                 # Test files
├── docs/                  # Documentation
├── config/                # Configuration files
├── scripts/               # Build/deployment scripts
├── requirements.txt       # Dependencies
├── README.md             # Project documentation
├── CLAUDE.md             # AI assistant rules
├── PLANNING.md           # This file
└── TASK.md               # Task tracking
```

### Key Components
- **[Component 1]:** [Description and responsibility]
- **[Component 2]:** [Description and responsibility]
- **[Component 3]:** [Description and responsibility]

## 🎨 Design Patterns & Conventions

### Naming Conventions
- **Files:** snake_case for Python, kebab-case for config files
- **Functions:** snake_case for Python, camelCase for JavaScript
- **Classes:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Variables:** snake_case for Python, camelCase for JavaScript

### Code Organization
- **One class per file** for complex classes
- **Group related functions** in modules
- **Separate concerns** (data, business logic, presentation)
- **Use dependency injection** for testability

### Error Handling
- **Use specific exception types** rather than generic Exception
- **Log errors with context** for debugging
- **Provide meaningful error messages** for users
- **Handle edge cases gracefully**

### Testing Strategy
- **Unit tests** for individual functions/methods
- **Integration tests** for component interactions
- **End-to-end tests** for critical user flows
- **Mock external dependencies** in tests

## 🔧 Development Workflow

### Environment Setup
```bash
# Clone repository
git clone [repository-url]
cd [project-name]

# Set up environment
[environment-setup-commands]

# Install dependencies
[dependency-install-commands]

# Run initial setup
[setup-commands]
```

### Development Commands
```bash
# Start development server
[start-command]

# Run tests
[test-command]

# Lint code
[lint-command]

# Format code
[format-command]

# Type check
[type-check-command]
```

### Git Workflow
- **Branch naming:** feature/description, bugfix/description, hotfix/description
- **Commit messages:** Use conventional commits format
- **Pull requests:** Required for main branch
- **Code review:** At least one approval required

## 📊 Quality Standards

### Code Quality
- **Test coverage:** Minimum 80%
- **Linting:** Must pass all linting rules
- **Type checking:** Must pass type checking (if applicable)
- **Documentation:** All public functions must have docstrings

### Performance
- **Response time:** API endpoints < 200ms average
- **Memory usage:** [Specific requirements]
- **Database queries:** Optimize N+1 queries

### Security
- **Input validation:** Validate all user inputs
- **Authentication:** [Authentication strategy]
- **Authorization:** [Authorization strategy]
- **Data protection:** [Data protection measures]

## 🚀 Deployment

### Environments
- **Development:** Local development environment
- **Staging:** Pre-production testing environment
- **Production:** Live production environment

### Deployment Process
1. [Step 1 of deployment]
2. [Step 2 of deployment]
3. [Step 3 of deployment]

### Monitoring
- **Logging:** [Logging strategy]
- **Metrics:** [Metrics collection]
- **Alerts:** [Alert configuration]

## 📚 Documentation

### Required Documentation
- **README.md:** Project overview and setup instructions
- **API Documentation:** [Tool used for API docs]
- **Architecture Documentation:** High-level system design
- **Deployment Documentation:** Deployment procedures

### Documentation Standards
- **Keep documentation up-to-date** with code changes
- **Use clear, concise language**
- **Include examples** where helpful
- **Document gotchas and common pitfalls**

## 🔄 Integration with MongoDB Context Engineering

This project uses MongoDB Context Engineering for enhanced development workflows:

### PRP Generation
- **Research Phase:** Leverage MongoDB patterns and codebase analysis
- **Planning Phase:** Use ULTRATHINK methodology for comprehensive planning
- **Implementation Phase:** Follow generated PRPs with validation loops

### Project Rules Integration
- **CLAUDE.md rules** are automatically included in PRP generation
- **Architecture patterns** from this file guide implementation decisions
- **Quality standards** are enforced through validation loops

### Collaborative Learning
- **Successful patterns** are contributed back to MongoDB knowledge base
- **Implementation outcomes** improve future PRP generation
- **Project-specific gotchas** enhance pattern intelligence

---

## 📝 Customization Instructions

1. **Replace all placeholders** with your actual project information
2. **Update technology stack** to match your choices
3. **Customize project structure** to fit your architecture
4. **Define your specific patterns** and conventions
5. **Set your quality standards** and requirements
6. **Document your deployment process**

This creates a comprehensive project planning framework that integrates seamlessly with MongoDB Context Engineering while preserving your project-specific intelligence!
