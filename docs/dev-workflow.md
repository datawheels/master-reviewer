# Dev Workflow

## Rule: One slice per commit
A slice is: spec + UI + state + checks passing.

### Every slice must:
- compile (npm run check)
- have a route to inspect it
- update docs/ui-contracts.md or docs/test-cases.md if behavior changed

## Rule: No partial exports
If a component is referenced, it must compile and render.
