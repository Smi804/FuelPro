---
name: token-lean-workflow
description: Use for coding, debugging, reviewing, or answering questions in this repository when conserving Cursor context and token usage matters.
---

# Token-Lean Workflow

Use the smallest useful context for the task.

## Search and reading

- Start with targeted file globs or `rg` searches before opening files.
- Read narrow file ranges when a match is known; avoid loading whole large files unless structure is unknown.
- Do not inspect generated or dependency output such as `dist/`, `node_modules/`, or `docs/screenshots/` unless the task explicitly needs it.
- Reuse this project's always-applied rules instead of restating them in responses.

## Implementation

- Prefer small, local edits that follow nearby patterns.
- Add new abstractions only when they remove meaningful duplication or match an existing project pattern.
- Keep verification focused on the changed surface area; broaden only when touching shared behavior.

## Communication

- Keep progress updates brief and specific.
- Summarize outcomes, tests, and residual risks without dumping large diffs or file contents.
- Ask for clarification only when the next safe action is genuinely blocked.
