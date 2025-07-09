### 🔄 Project Awareness & Context
- **Always read `memory-bank/00-project-overview.md`** at the start of new conversations to understand project architecture, goals, and constraints
- **Check `memory-bank/05-progress-log.md`** before starting new tasks. If the task isn't listed, add it with brief description and today's date
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `memory-bank/01-architecture.md`
- **Use project's package manager** (npm/yarn/pnpm for Node.js, pip/poetry for Python) for all dependency operations

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting into modules or helper files
- **Organize code into clearly separated modules**, grouped by feature or responsibility following patterns in `memory-bank/02-components.md`
- **Use clear, consistent imports** (prefer relative imports within packages)
- **Use environment variables** with proper loading (dotenv for Node.js, python-dotenv for Python)

### 🧪 Testing & Reliability
- **Always create unit tests for new features** (functions, classes, routes, etc) using project's testing framework
- **After updating any logic**, check whether existing unit tests need updates. If so, update them
- **Tests should live in `/tests` folder** mirroring main app structure with at least:
  - 1 test for expected use
  - 1 edge case
  - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `memory-bank/05-progress-log.md`** immediately after finishing them
- **Add new sub-tasks or TODOs** discovered during development to progress log under "Discovered During Work" section

### 📎 Style & Conventions
- **Use TypeScript** for Node.js projects, **Python** for backend services
- **Follow PEP8** for Python, use type hints, and format with `black`
- **Use `zod` for data validation** in TypeScript projects
- **Use `pydantic` for data validation** in Python projects
- **Write docstrings for every function** using Google style:
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

### 📚 Documentation & Explainability
- **Update `memory-bank/02-components.md`** when new components are added
- **Comment non-obvious code** and ensure everything is understandable to mid-level developer
- **Add inline `# Reason:` comment** for complex logic explaining the why, not just the what

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages
- **Always confirm file paths and module names** exist before referencing them in code or tests
- **Never delete or overwrite existing code** unless explicitly instructed or part of task from `memory-bank/05-progress-log.md`

