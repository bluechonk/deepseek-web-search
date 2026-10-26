# deepseek-web-search CLI

DeepSeek 官方联网搜索与网页抓取的命令行工具。零依赖，只用 Node 内置模块。

## 安装

```bash
npm i -g deepseek-web-search
```

或不安装直接用：

```bash
npx deepseek-web-search --help
```

## 配置

| 环境变量 | 必填 | 说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API Key，与普通 DeepSeek API 共用 |
| `DEEPSEEK_BASE_URL` | 否 | 覆盖 API 地址，默认 `https://api.deepseek.com` |

## 命令

```bash
deepseek-web-search search <query> [options]
deepseek-web-search fetch <url> [options]
deepseek-web-search doctor
```

### search

```bash
deepseek-web-search search "DeepSeek V4 发布" --count 5
deepseek-web-search search "site:github.com deepseek" --need-content
deepseek-web-search search "AI 新闻" --format markdown
deepseek-web-search search "deepseek after:2026-10-01" --count 20
```

| 选项 | 说明 |
| --- | --- |
| `--count <n>` | 返回条数，1-50，默认 10 |
| `--need-content` | 结果中附带网页正文 |
| `--ori-question <s>` | 原始问题，改善排序 |
| `--localization <ip>` | 按 IP 本地化结果 |
| `--format <fmt>` | `json`（默认）/ `text` / `markdown` |

query 支持搜索语法：`site:`、`-site:`、`-关键词`、`"精确短语"`、`lang:zh,en`、`after:`、`before:`。

### fetch

```bash
deepseek-web-search fetch https://api-docs.deepseek.com/zh-cn/guides/search
deepseek-web-search fetch https://example.com/article --format json
```

| 选项 | 说明 |
| --- | --- |
| `--format <fmt>` | `json`（默认）/ `text` / `markdown` |

### doctor

```bash
deepseek-web-search doctor
```

用一次最小 Search 探测 Key 与连通性。

## 退出码

| 退出码 | 含义 |
| --- | --- |
| 0 | 成功 |
| 1 | API 错误 |
| 2 | 参数或配置错误 |
| 3 | 余额不足（HTTP 402） |

## MCP server

同一份代码也提供两个 stdio MCP server：

```bash
node src/mcp-search.mjs   # 暴露 deepseek_web_search
node src/mcp-fetch.mjs    # 暴露 deepseek_web_fetch
```

## 计费

Search / Fetch 各按成功请求计费（5 元 / 1000 次），失败与无结果不计费。限速 Search 100 QPS、Fetch 25 QPS。

官方文档：<https://api-docs.deepseek.com/zh-cn/guides/search>
