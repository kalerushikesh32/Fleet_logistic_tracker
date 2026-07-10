# Contributing

Thanks for contributing! This guide keeps collaboration smooth and the codebase clean.

## Getting Started

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for local setup.

## Branching

- `main` — always deployable. Do not push directly.
- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- Create a branch from `main`, push, then open a Merge Request.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(vehicles): add bulk import
fix(auth): reject expired tokens on refresh
docs(api): document dashboard endpoints
refactor(operations): extract vehicle-release helper
test(cargo): cover positive-weight validation
```

Keep commits focused and atomic.

## Merge Requests

Before opening an MR:

1. Rebase on the latest `main`.
2. Run the quality gates locally (they also run in CI):
   ```bash
   cd backend && ruff check . && black --check . && pytest
   cd frontend && npm run lint && npm test && npm run build
   ```
3. Fill in the MR description: what changed, why, and how you tested it.
4. Link the related issue.

MRs require a green pipeline and at least one review before merge.

## Code Style

The project follows the rules in `.kiro/steering/coding-style.md`:

- KISS, DRY, YAGNI; follow SOLID.
- Small functions (<50 lines) and files (<400 lines typical).
- Early returns over deep nesting (max 4 levels).
- Meaningful names; comments explain **why**, not **what**.
- No dead code. Handle errors at every boundary.

**Backend:** business logic goes in `services/`, not routes. Raise `DomainError`
subclasses; let the central handler map them to HTTP.

**Frontend:** data access via TanStack Query hooks; reuse `common/` components
(e.g. `<Modal>`) rather than duplicating markup.

## Tests

- Add/adjust tests for any behavior change.
- Backend: `pytest` (FastAPI `TestClient` for integration).
- Frontend: Vitest + React Testing Library.

## Secrets

Never commit secrets. `.env` is gitignored; commit only `.env.example` with
placeholder values.
