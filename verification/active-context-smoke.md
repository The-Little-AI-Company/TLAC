---
project: TLAC
status: planned
target: cocoindex-code active-context sidecar
command: ccc doctor && ccc search --refresh "where is the main entrypoint"
related_modules: [active-context, codebase]
---
# Active Context Smoke

After the user approves using CocoIndex-code, verify the sidecar by running
`ccc doctor`, refreshing the index with one semantic query, and reading at least one
returned file path directly before acting on it.
