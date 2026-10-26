---
description: Search the web with DeepSeek's official search API. Pass the query as arguments, optionally with --count, --need-content, --format.
argument-hint: "<query> [--count n] [--need-content] [--format json|text|markdown]"
skills: deepseek-web-search
---

Use the `deepseek-web-search` skill for this request:

$ARGUMENTS

Run the search through the DeepSeek CLI and return the ranked results. Prefer `--format markdown` when the user wants to read the results directly, and `--format json` when the results feed into further processing. Keep the default result count at 10 unless the user asks for more.
