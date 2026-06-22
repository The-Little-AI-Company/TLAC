---
project: TLAC
status: accepted
date: 2026-06-22
related_modules: [active-context, codebase, agent-workspace]
rationale: active semantic search should be a sidecar, not part of the deterministic tropo core
---
# CocoIndex-code Sidecar

CocoIndex-code may be used as an optional active-context sidecar for coding
workspaces. The sidecar can refresh a semantic code index and answer fuzzy code
questions, but Vivary keeps the default scaffold lean: no install, no index, no daemon,
and no MCP configuration happens until the human approves it.
