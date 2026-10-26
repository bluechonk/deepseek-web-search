# deepseek-web-search CLI

DeepSeek 官方联网搜索与网页抓取的命令行工具。零依赖，只用 Node 内置模块。

命令名是 `dws`，短，好敲。

## 安装

```bash
npm i -g deepseek-web-search
```

装完直接用 `dws`：

```bash
dws search "DeepSeek V4 发布" --count 5
dws fetch https://api-docs.deepseek.com/zh-cn/guides/search
dws doctor
```

也可以不安装，用 npx 直接跑包名：

```bash
npx deepseek-web-search search "AI 新闻" --format markdown
```

注意：npm 上的 `dws` 包是另一个无关项目，`npx dws` 不会运行本工具。

## 配置

| 环境变量 | 必填 | 说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API Key，与普通 DeepSeek API 共用 |
| `DEEPSEEK_BASE_URL` | 否 | 覆盖 API 地址，默认 `https://api.deepseek.com` |

## 命令

```bash
dws search <query> [options]
dws fetch <url> [options]
dws doctor
```

### search

```bash
dws search "DeepSeek V4 发布" --count 5
dws search "site:github.com deepseek" --need-content
dws search "AI 新闻" --format markdown
dws search "deepseek after:2026-10-01" --count 20
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
dws fetch https://api-docs.deepseek.com/zh-cn/guides/search
dws fetch https://example.com/article --format json
```

| 选项 | 说明 |
| --- | --- |
| `--format <fmt>` | `json`（默认）/ `text` / `markdown` |

### doctor

```bash
dws doctor
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
