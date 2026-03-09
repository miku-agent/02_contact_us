# Branching & Release Flow

This repo uses a simple 2-branch workflow.

## Branches

- `dev` — integration branch (day-to-day work)
- `main` — production / deployed branch

## Rules

### Work happens on `dev`

- Commit and push changes to `dev`.
- CI runs on pushes to `dev`.

### Release to production via PR: `dev` → `main`

- Open a Pull Request from `dev` into `main`.
- Merge only when required checks are green.

### `main` is protected

- `main` requires PR + required status checks before merging.
- Avoid direct pushes to `main`.

## Quick Commands

```bash
# start work
git checkout dev

# ship
gh pr create --base main --head dev
# then merge via GitHub UI (or gh pr merge)
```
