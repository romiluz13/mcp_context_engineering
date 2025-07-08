# 🧠 AI Assistant Project Rules Template

This template provides the sophisticated project awareness system from the original Context Engineering approach. Copy this to your project root as `CLAUDE.md` and customize for your specific project.

## 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use your project's environment** (venv, node_modules, etc.) whenever executing commands.

## 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For typical projects this looks like:
    - `main.py/index.js` - Main application entry point
    - `models.py/types.ts` - Data models and type definitions
    - `utils.py/utils.ts` - Utility functions
    - `config.py/config.ts` - Configuration management
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use environment variables** for configuration (python_dotenv, dotenv, etc.).

## 🧪 Testing & Reliability
- **Always create unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use (happy path)
    - 1 edge case test
    - 1 failure case test

## ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.

## 📎 Style & Conventions
- **Use [YOUR PRIMARY LANGUAGE]** as the primary language.
- **Follow language-specific style guides** (PEP8 for Python, ESLint for JavaScript, etc.).
- **Use type hints/annotations** where supported.
- **Use [YOUR PREFERRED FRAMEWORK]** for [web APIs/desktop apps/etc.].
- Write **docstrings/comments for every function** using consistent style:
  ```python
  def example():
      """
      Brief summary.

      Args:
          param1 (type): Description.

      Returns:
          type: Description.
      """
  ```

## 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

## 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.

## 🔧 Project-Specific Rules

### Technology Stack
- **Primary Language:** [Python/JavaScript/TypeScript/Rust/etc.]
- **Framework:** [FastAPI/Express/React/etc.]
- **Database:** [PostgreSQL/MongoDB/SQLite/etc.]
- **Testing:** [pytest/Jest/etc.]
- **Linting:** [ruff/ESLint/etc.]

### Deployment & Environment
- **Package Manager:** [pip/npm/cargo/etc.]
- **Environment Management:** [venv/nvm/etc.]
- **Configuration:** [.env files/config.yaml/etc.]

### Custom Patterns
- **Error Handling:** [Describe your error handling patterns]
- **Logging:** [Describe your logging approach]
- **API Design:** [Describe your API conventions]
- **Database Patterns:** [Describe your data access patterns]

## 📋 Common Commands

### Development
```bash
# Start development server
[your-start-command]

# Run tests
[your-test-command]

# Lint code
[your-lint-command]

# Type check
[your-type-check-command]
```

### Validation Loop
```bash
# Level 1: Syntax & Style
[your-lint-command] --fix
[your-type-check-command]

# Level 2: Unit Tests
[your-test-command]

# Level 3: Integration Test
[your-integration-test-command]
```

---

## 🎯 Usage with MongoDB Context Engineering

When using this project with MongoDB Context Engineering:

1. **Mention the framework**: "Using MongoDB Context Engineering, help me build [feature]"
2. **Reference this file**: AI assistants will use these rules during PRP generation
3. **Follow the workflow**: Research → ULTRATHINK → PRP → Implementation → Validation

This ensures your project-specific patterns and conventions are preserved while leveraging collaborative intelligence from the MongoDB Context Engineering platform.

## 📝 Customization Instructions

1. **Copy this file** to your project root as `CLAUDE.md`
2. **Replace placeholders** with your actual technology stack and preferences
3. **Add project-specific rules** in the Custom Patterns section
4. **Update commands** to match your actual development workflow
5. **Create PLANNING.md and TASK.md** files referenced in the Project Awareness section

This creates a sophisticated project awareness system that preserves the original Context Engineering methodology while adding your project-specific intelligence!
