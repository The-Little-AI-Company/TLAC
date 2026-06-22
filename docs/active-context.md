# Active Context

This workspace can use CocoIndex-code as an optional active-context sidecar for
semantic code search. Vivary core stays plain Markdown/YAML plus the zero-dependency
graph tools; CocoIndex-code is engaged only when the agent and human agree it will
improve retrieval.

Project: `TLAC`

## Agent Policy

1. Ask before installing `cocoindex-code`, running `ccc init`, indexing code, enabling
   MCP, or sending source text to an external embedding provider.
2. Lead with Vivary truth: `tropo graph`, `tropo blast <id>`, and `ozone impact <id>`.
3. Use `ccc search --refresh "<query>"` for semantic candidates when exact names are
   unknown or `rg` is too noisy.
4. Read matched files directly before editing; semantic search finds candidates, not
   final truth.
5. Report the query, refresh status, file paths, line ranges, and whether the semantic
   hits confirmed or changed the graph-based understanding.

## Setup Options

Native install, local embeddings:

```bash
uv tool install --python 3.11 --upgrade "cocoindex-code[full]"
ccc init -f
ccc doctor
ccc index
ccc status
ccc search --refresh "where is authentication handled"
```

On non-interactive Windows agent runs, use `cmd /c "echo. | ccc init -f"` so the CLI
chooses its local sentence-transformers default instead of opening an interactive
prompt.

MCP integration, after approval:

```bash
codex mcp add cocoindex-code -- ccc mcp
```

Index state belongs in `.cocoindex_code/`, which this scaffold gitignores.
