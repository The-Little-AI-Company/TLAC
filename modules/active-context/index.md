---
project: TLAC
status: active
module_area: optional semantic code search sidecar
related_modules: [agent-workspace, codebase]
verification: [active-context-smoke]
gates: [human-gates]
---
# Active Context

## Purpose

Optional CocoIndex-code sidecar for active semantic code retrieval in a Vivary-backed
codebase. It supplements tropo's explicit graph with fresh semantic code candidates
when the agent asks and the human approves the indexing/install gate.

## Read Next

- Policy: `docs/active-context.md`
- Verification: `verification/active-context-smoke.md`
- Decision: `decisions/0002-cocoindex-code-sidecar.md`
