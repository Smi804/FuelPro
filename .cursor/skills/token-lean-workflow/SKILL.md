---
name: token-lean-workflow
description: Use for coding, debugging, reviewing, or answering questions in this repository when conserving Cursor context and token usage matters.
---

# Token-Lean Workflow

Use the smallest useful context for the task.

## Search & read

- Target with globs / `rg` / semantic search before opening files; read narrow ranges when the match is known.
- Don't re-read files already in context, and skip generated output (`dist/`, `node_modules/`, `docs/screenshots/`) unless required.
- Lean on always-applied rules and the `fuel-pro-recipes` skill instead of restating project facts.

## Implement

- Prefer small, local edits that follow nearby patterns; reuse `src/components/crud/*` and `src/api/*` rather than hand-rolling.
- Add abstractions only to remove real duplication or match an existing pattern.
- Verify the changed surface only (lint the files you touched); broaden only when editing shared code.

## Edit surgically (don't rewrite unchanged lines)

- Change **only** the lines that must change. Never re-emit lines that aren't actually changing — leave untouched code exactly as-is.
- In `StrReplace`, keep `old_string`/`new_string` tight: include just enough surrounding context to be unique, not whole functions/files. If a 1-line change is enough, make it a 1-line change.
- Preserve the existing formatting of untouched code: same indentation, quotes, spacing, import order, comments, and trailing commas. Don't reflow, re-wrap, re-sort, or reformat lines you aren't modifying.
- Don't rename variables, reorder members, or "tidy" nearby code unless the task requires it.
- Prefer several small targeted replacements over one large block that restates unchanged code. Only rewrite a whole file when creating it or when the change genuinely spans most of it.
- Keep diffs reviewable: the smaller the diff, the cheaper and safer the change.

## Communicate

- Keep progress notes brief and specific; summarize outcomes and residual risks, not large diffs or file dumps.
- Batch independent tool calls in one turn.
- Ask only when the next safe action is genuinely blocked.
