---
name: deepseek-web-search
description: Search the web with DeepSeek's official Search API. Use when the user asks for current information, news, documentation, or any fact that may have changed recently. Supports query syntax (site:, -site:, -term, "phrase", lang:, after:/before:) and returns ranked results with title, url, snippet, summary and optional page body.
---

# DeepSeek 联网搜索

用 DeepSeek 官方 Search API 做实时联网检索。所有调用都走本插件自带的零依赖 CLI，不直连 HTTP。

## 何时使用

- 用户问的是可能已过期的信息：新闻、版本、价格、文档、赛事、政策。
- 需要权威来源交叉验证，或要给出可点击的原文链接。
- 用户明确说「联网搜」「查一下最新」「搜一下」。

不确定信息是否过期时，先搜再答，不要凭记忆编。

## 定位 CLI

按顺序尝试，命中即停：

1. PATH 中是否已全局安装：

   ```bash
   command -v deepseek-web-search
   ```

2. 未命中则用本技能目录推导插件根。本文件位于 `<插件根>/skills/deepseek-web-search/SKILL.md`，因此：

   ```bash
   node "<本文件所在目录>/../../cli/src/index.mjs"
   ```

把下面示例里的 `CLI` 替换成上面解析出的调用形式。

## 基本用法

```bash
CLI search "DeepSeek V4 发布" --count 5
CLI search "site:github.com deepseek harness" --count 10
CLI search "AI 新闻" --format markdown
CLI search "deepseek after:2026-10-01" --count 20
```

参数：

- `--count <n>`：返回条数，1-50，默认 10。
- `--need-content`：结果里带网页正文（token 消耗更高，按需使用）。
- `--ori-question <s>`：原始问题，改善排序。
- `--localization <ip>`：按 IP 本地化结果。
- `--format json|text|markdown`：默认 `json`。给用户看用 `markdown`，喂给后续处理用 `json`。

## 搜索语法

query 里可直接写：

- `site:github.com OR site:huggingface.co` 限定站点
- `-site:csdn.net` 排除站点
- `-广告` 或 `-"推广"` 排除含词页面
- `"exact phrase"` 精确短语
- `lang:zh` 或 `lang:zh,en` 限定语言
- `after:2026-10-01` / `before:2026-10-31` 限定日期

## 结果怎么用

返回的每条结果含 `title`、`url`、`snippet`（短摘要，适合展示）、`summary`（长摘要，适合喂给模型）、`rerank_score`（0-3，越高越相关）、`authority`（0-4，越高越权威）、`date`。

- 给用户的回复里保留原文链接，不要只给结论。
- `rerank_score` 低于 1.5 的结果要标注为低置信，或换 query 重搜。
- 需要深入内容时，拿 `url` 走 `deepseek-web-fetch` 技能抓正文。
- 不要一次性把 20 条结果全贴出来，挑最相关的 3-5 条，其余说明数量。

## 失败处理

- 退出码 2：参数或配置错误（多为缺 `DEEPSEEK_API_KEY`）。先确认环境变量已设置，再原样重试。
- 退出码 3：HTTP 402，账号余额不足。提示用户充值，不要重试。
- 退出码 1：其他 API 错误。读 stderr 里的 `status` 与 `code`，408/429/5xx 可稍后重试一次，其余不要盲目重试。
- 搜索无结果是正常情况，如实说明，不要编造。

## 边界

- 只做检索，不写回 DeepSeek，不碰用户账号设置。
- 不输出 API Key、不读取本地配置文件内容。
- 计费按成功请求计（5 元 / 1000 次），避免无意义的重复调用。
