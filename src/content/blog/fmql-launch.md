---
title: 'Introducing FMQL: a query language for markdown frontmatter workspaces'
description: 'fmql treats any directory of markdown files with YAML frontmatter as a schemaless document database: typed filters, reference traversal, bulk edits, pluggable search, and an agile-board example.'
pubDate: 'Apr 17 2026'
heroImage: ""
---

![fmql in motion: cat a frontmatter task file, then run `fmql search … | fzf | fmql append tags=tech-debt` to retrieve tech-debt candidates, toggle a few with fzf, and bulk-tag them with a diff preview.](/images/fmql-hero.gif)

There's a video that's been stuck in my head for a while: ["The Unreasonable Effectiveness of Plain Text"](https://www.youtube.com/watch?v=WgV6M1LyfNY). The argument is simple: plain text is the most durable, portable, composable format we have. Everything else (databases, proprietary formats, SaaS platforms) comes with lock-in and entropy. Plain text just works, everywhere, forever.

I've been a believer for years. My notes, blog drafts, project specs: all markdown files with YAML frontmatter, sitting in a git repo. When I started building AI agents, I reached for the same format for agent blueprints and configurations. It felt obvious: if the data is structured YAML metadata plus human-readable content, it works for machines and humans equally well. No migration, no API, no export button. Just files.

The pattern is everywhere now. Obsidian vaults, Hugo sites, Jekyll blogs, documentation repos, Zettelkasten systems, CLAUDE.md project files. Frontmatter markdown has become the quiet default for structured knowledge.

It works great until you have 100+ of them and need to ask a question which requires connecting the dots across 10 different documents.

"Which docs were updated this month?" Grep doesn't understand dates. "What links to this note, transitively?" Grep doesn't understand relationships. "Rename a field across every file in this directory." Now you're writing a one-off Python script for a five-second operation.

I kept hitting the same wall: a directory of frontmatter files is basically a schemaless document database, but there are no database tools for it. So I built one.

## What fmql does

[fmql](https://github.com/buyuk-dev/fmql) (FrontMatter Query Language) treats any directory of markdown/YAML files as a schemaless document collection. Point it at a directory. Query with filters, traversal, aggregation. Edit fields across files. No config, no schema, no setup.

```bash
pip install fmql
```

The simplest thing: filter by fields:

```bash
fmql query ./docs 'status = "active" AND type = "spec"'
fmql query ./vault 'modified > today-7d'
fmql query ./blog 'tags CONTAINS "python" AND draft = false'
```

It understands types. `priority > 2` compares integers, not strings. `modified > today-7d` compares dates, with relative date literals like `today`, `yesterday`, `today-30d`, `now+1h`. Files where the field is missing or the wrong type are silently excluded. No errors, no coercion, no surprises.

## Following relationships

Frontmatter files often reference each other: `related: ../notes/note-17.md`, `parent: uuid-of-something`, `see_also: [concept-a, concept-b]`. Grep sees these as strings. fmql can follow them:

```bash
# What does this note reference?
fmql query ./vault 'title = "API Design"' --follow references

# Walk the full chain, transitively
fmql query ./vault 'title = "API Design"' --follow references --depth '*'

# Reverse: what references this note?
fmql query ./vault 'title = "API Design"' --follow references --direction reverse
```

The `--follow` flag takes a field name, resolves the values as references (file paths, UUIDs, or slugs, you choose the resolver), and walks the graph. Dependency chains, backlinks, transitive connections.

When the simple `--follow` flag is not enough (cycle detection, multi-hop matching with conditions), I have implemented a subset of Cypher (a graph database query language).

```bash
# Find circular references
fmql cypher ./vault 'MATCH (a)-[:references*]->(a) RETURN a'

# Two-hop: find notes that reference something tagged "architecture"
fmql cypher ./vault 'MATCH (a)-[:references]->(b) WHERE b.tags CONTAINS "architecture" RETURN a, b'
```

## Editing across files

Half the real operations on a collection of files are writes: rename a field, fix a tag, update a status, migrate a schema. fmql edits frontmatter surgically, modifying the YAML block and leaving the markdown body, comments, formatting, and key ordering untouched:

```bash
# Set a field
fmql set ./docs/api-spec.md status=reviewed

# Rename a field across every file
fmql query ./vault '*' | fmql rename category=type --workspace ./vault

# Tag everything matching a query
fmql query ./vault 'status = "draft" AND modified < today-30d' \
  | fmql append tags=stale --workspace ./vault

# Remove a deprecated field from all files
fmql query ./vault '*' | fmql remove old_field --workspace ./vault
```

Bulk edits show a unified diff preview and ask for confirmation before writing. `--dry-run` shows what would change without touching anything. `--yes` skips the prompt for scripting. If the files happen to be in git (they often are), `git diff` after any edit shows you exactly what happened.

## Search is pluggable

Filter, traverse, and edit all operate on the structured side of the data (the frontmatter). Search over the *content* is a different problem, one with no single right answer: text scan, full-text index, dense vectors with embeddings, rerankers, external services like Elasticsearch or a vendor API. Each has different tradeoffs on cost, latency, accuracy, and infra. Baking one of them into the core would be the wrong call.

So fmql treats search as a plugin surface. Core defines a small protocol with two variants (`ScanSearch` for backends that scan the workspace at query time, `IndexedSearch` for backends that build a persistent index), and ships one default backend: `grep`. Everything else is a separately installable package:

```bash
pip install fmql-semantic
fmql index list-backends
# grep        (core)          scan
# semantic    (fmql-semantic) indexed
```

Every backend looks the same at the call site:

```bash
fmql search "authentication" --backend grep     --workspace ./vault
fmql search "authentication" --backend semantic --workspace ./vault
```

Indexed backends add a build step. By convention they write to `<workspace>/.fmql/<backend-name>.*`, so one `.gitignore` line covers everything:

```bash
fmql index ./vault --backend semantic
```

You can write a backend for your company's search service or swap the embedding model when a better one is released, without touching fmql itself. The [plugin protocol doc](https://github.com/buyuk-dev/fmql/blob/main/docs/plugins.md) has the full contract (about two dozen lines of Python) for anyone who wants to write one.

## Semantic search

The queries above are all structured: you know which field to filter on. But what if you want to ask "which tasks are about resolving tech debt?" when there's no `tech_debt` tag yet, just task titles and descriptions? That's the gap semantic search fills, and it lives in a plugin.

[fmql-semantic](https://pypi.org/project/fmql-semantic/) adds hybrid semantic search in a single SQLite file next to your markdown: dense vectors via LiteLLM embeddings (OpenAI, Voyage, Cohere, Ollama), sparse BM25 keyword matching, and reciprocal rank fusion over the two. Optional reranking on top candidates via a LiteLLM rerank provider (Cohere, Voyage, etc.). No external server, no infrastructure.

```bash
pip install fmql-semantic
fmql index ./board --backend semantic
fmql search "tech debt, refactoring, cleanup" --backend semantic --workspace ./board
```

It indexes each file's title (or `summary` or `name`, whichever is present) together with the body. Other frontmatter fields aren't indexed: they're already queryable with the structured filters above. Builds are incremental: unchanged files are skipped.

Search output is one file path per line, so it composes with the editing commands from earlier (and with the rest of the Unix toolbox). Semantic retrieval always returns its top-k, so the hit list will include some false positives. Drop `fzf` into the middle for a per-item review:

```bash
fmql search "tech debt, refactoring, cleanup" --backend semantic --workspace ./board -k 30 \
  | fzf -m --preview 'head -20 {}' \
  | fmql append tags=tech-debt --workspace ./board
```

TAB to toggle candidates (with a file preview on the right), ENTER to commit. `fmql append` still shows a unified diff of the curated list before writing anything.

Semantic search also narrows with structured filters in the Python API:

```python
from fmql import Workspace, Query

ws = Workspace("./board")

# Semantic search narrowed to open tasks
Query(ws).where(type="task", status="active").search("tech debt", index="semantic")
```

Longer term, classification is a natural next plugin surface: instead of retrieval + human filter, a classifier plugin could label each document directly (LLM, trained model, whatever works). Whether that fits the search protocol or wants its own is an open question.

## Inspecting a directory

Before querying an unfamiliar directory, it helps to see what's in it:

```bash
fmql describe ./vault
```

`describe` scans every file and shows which fields exist, what types they have across files (and where they're inconsistent), and sample values. It's the "I just inherited this directory of 200 markdown files, what am I looking at?" command.

```bash
$ fmql describe .
workspace: ~/project/
  packets: 89
  no-frontmatter: 0

fields:
  category     present=89  types={str: 89}  top: node (23), workspaces (16), architecture (13)
  title        present=88  types={str: 88}  top: Agent Architecture Refactoring (1)
  tags         present=13  types={list: 13}
  resolves     present=6  types={list: 6}
  depends_on   present=4  types={list: 4}
  status       present=4  types={str: 4}  top: active (4)
  items        present=3  types={list: 3}
  blocked_by   present=1  types={list: 1}
  commits      present=1  types={list: 1}
  priority     present=1  types={str: 1}  top: high (1)
```

## The Python API

The CLI is for quick operations. For anything more complex, there's a Python API with Django-style query syntax:

```python
from fmql import Workspace, Query, Count, Sum

ws = Workspace("./vault")

# Filter with typed operators
recent = Query(ws).where(
    status="active",
    modified__gt="today-7d",
    tags__contains="python"
)

# Follow references transitively
chain = (
    Query(ws)
    .where(title="API Design")
    .follow("references", depth="*")
)

# Aggregate
by_type = (
    Query(ws)
    .where(status="active")
    .group_by("type")
    .aggregate(count=Count())
)

# Bulk edit: query results pipe directly into mutations
(
    Query(ws)
    .where(draft=True, modified__lt="today-30d")
    .set(status="stale")
)

# Order results
Query(ws).where(type="note").order_by("-modified", "title")
```

The `__` operator syntax works like this: `field__gt=2` is "greater than", `field__contains="python"` is substring/list membership, `field__matches=r"^\[WIP\]"` is regex. If you've used Django's ORM, you already know the pattern.

## Why not just use X?

**grep/ripgrep**: great for text search, no concept of types, dates, relationships, or structured metadata. `rg "status" | something something awk` is not a query language.

**Obsidian + Dataview**: different layer. Obsidian is a knowledge-management app for personal vaults; its Dataview plugin adds a live query language rendered inside notes. fmql is a shell-level query/edit tool for the same directory of frontmatter files, aimed at workflows that happen outside an app: scripts, CI, agents. They coexist rather than compete.

**Datasette**: needs a database. The whole point here is that the files *are* the database. No ETL step, no sync, no import.

**jq/yq**: per-file tools. They don't understand a directory as a collection, don't do cross-file relationships, and can't edit frontmatter while preserving the markdown body.

**GNU recutils**: closest in spirit. Same thesis: plain text files are databases, give them database tools. But recutils requires you to use its own .rec format. fmql works with frontmatter markdown, the format people are already using in Obsidian vaults, Hugo sites, documentation repos, and agent configurations. No format adoption required.

**Custom Python scripts**: this is what I was doing before. fmql is the script I kept rewriting, extracted into a tool.

## Beyond notes: agile board for your projects

Frontmatter markdown works for more than just notes. Anything shaped like structured metadata plus prose fits the same primitives: blog posts, agent configs, research archives, CRM records, incident logs. One worked example: an agile project board.

Tasks and epics as individual files with frontmatter like `status`, `assignee`, `priority`, `sprint`, `parent`, `blocks`. Sprints as directories. Dependency chains via `--follow blocks`. Cycle detection via Cypher. Bulk status transitions via piped edits.

Think JIRA, but your data is files in a git repo. JQL, but for frontmatter.

A deeper dive is coming next: task/epic/sprint templates, the agents, and the directory layout.

## Try it

```bash
pip install fmql
pip install fmql-semantic  # optional: adds semantic search
```

Point it at any directory with frontmatter files: your Obsidian vault, your Hugo site, your docs repo, your knowledge base. Run `fmql describe` and see what's in there. Then start querying.

Thoughts, feedback, and contributions welcome on [GitHub](https://github.com/buyuk-dev/fmql). Especially curious what queries you find yourself wanting that aren't there yet.
