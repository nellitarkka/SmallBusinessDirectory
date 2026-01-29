# Contributing Guide

## Development Workflow

### 1. Setting Up Your Environment
```bash
git clone <repository-url>
cd vendor-backend
npm install
cp .env.example .env  # Configure your database
npm run dev
```

### 2. Creating a Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 3. Making Changes

- Write code following the existing structure
- Add tests for new features
- Run tests locally: `npm test`
- Ensure all tests pass before committing

### 4. Committing

Use conventional commits:
```bash
git add .
git commit -m "feat: add new endpoint for X"
```

Commit types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `chore:` Maintenance

### 5. Submitting Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub targeting `develop` branch.

### 6. Code Review

- All PRs require at least one approval
- Address review comments
- Ensure CI/CD checks pass

## Testing Guidelines

- Write tests for all new features
- Maintain >50% code coverage
- Test both success and error cases

## Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions focused and small

## Questions?

Contact the development team or create an issue.
