---
description: Fetch a web page with DeepSeek's official fetch API and return its Markdown body. Pass the URL as the argument.
argument-hint: "<url> [--format json|text|markdown]"
skills: deepseek-web-fetch
---

Use the `deepseek-web-fetch` skill for this request:

$ARGUMENTS

Run the fetch through the DeepSeek CLI and return the page title plus Markdown body. Use `--format markdown` for readable output and `--format json` when the content feeds into further processing. If the fetch fails, report the HTTP status and the CLI error message instead of retrying blindly.
