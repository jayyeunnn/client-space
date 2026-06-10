# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- **Unit/Integration:** Vitest v4 + @testing-library/react
- **E2E:** Playwright

## Running Tests

```bash
# Unit tests (single run)
npm test

# Unit tests (watch mode)
npm run test:watch

# E2E tests
npm run test:e2e
```

## Test Layers

| Layer | Directory | When to write |
|-------|-----------|---------------|
| Unit | `src/__tests__/` | Pure functions, utilities, helpers |
| Integration | `src/__tests__/` | API routes, data transforms |
| Component | `src/__tests__/` | Interactive UI behavior |
| E2E | `e2e/` | Full user flows |

## Conventions

- Files: `*.test.ts` (unit/integration), `*.spec.ts` (e2e)
- Imports: `import { describe, it, expect } from "vitest"`
- DOM: wrap with `render()` from `@testing-library/react`
- Assertions: `@testing-library/jest-dom` matchers available globally

## Expectations

- When writing new functions → write a corresponding test
- When fixing a bug → write a regression test
- When adding error handling → test the error path
- When adding a conditional → test both branches
- Never commit code that makes existing tests fail
