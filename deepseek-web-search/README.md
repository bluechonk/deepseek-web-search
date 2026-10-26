# deepseek-web-search

把 DeepSeek 官方联网搜索能力（Search / Fetch 独立 API）接入 ZCode。

架构上是「CLI 为唯一事实来源」：`cli/` 是一个零依赖 npm 包，`commands`、`skills`、`mcpServers` 全部基于它的子命令构建。脱离 ZCode 时，其他 agent 也能通过 `npm i -g deepseek-web-search` 直接调用。

## 组件

| 组件 | 位置 | 作用 |
| --- | --- | --- |
| CLI | `cli/src/index.mjs` | 零依赖命令行，`search` / `fetch` / `doctor` |
| MCP | `cli/src/mcp-search.mjs`、`cli/src/mcp-fetch.mjs` | 两个 stdio MCP server |
| Command | `commands/deepseek_web_search.md`、`commands/deepseek_web_fetch.md` | 斜杠命令，委托给对应 skill |
| Skill | `skills/deepseek-web-search/`、`skills/deepseek-web-fetch/` | 引导 agent 正确使用 CLI |

## 前置条件

- Node.js >= 18（用到内置 `fetch`）。
- DeepSeek API Key，通过环境变量 `DEEPSEEK_API_KEY` 提供。
- 可选：`DEEPSEEK_BASE_URL` 覆盖 API 地址（代理或测试用）。

API Key 只走环境变量或 `--api-key`，不写进任何配置文件。

## 独立使用 CLI

```bash
npm i -g deepseek-web-search

dws search "DeepSeek V4 发布" --count 5
dws search "site:github.com deepseek harness" --need-content
dws fetch https://api-docs.deepseek.com/zh-cn/guides/search
dws doctor
```

命令名是 `dws`。npm 上的 `dws` 包是另一个无关项目，`npx dws` 不会运行本工具；不安装时用包名：

```bash
npx deepseek-web-search search "AI 新闻" --format markdown
```

## 在 ZCode 里使用

安装插件后：

- 斜杠命令：`/deepseek_web_search <query>`、`/deepseek_web_fetch <url>`。
- Skill：在输入框选择 `deepseek-web-search` 或 `deepseek-web-fetch`。
- MCP：两个 server 自动注册为 `deepseek_web_search` 与 `deepseek_web_fetch` 工具，模型可直接调用。

插件自带 CLI，不需要全局安装；全局安装只是给非 ZCode 场景用。

## 接口说明

| 接口 | 端点 |
| --- | --- |
| Search | `POST https://api.deepseek.com/v1/tools/search` |
| Fetch | `POST https://api.deepseek.com/v1/tools/fetch` |

- 鉴权：`Authorization: Bearer <API Key>`，与普通 DeepSeek API 同一个 Key。
- 计费：按成功请求计，Search / Fetch 各 5 元 / 1000 次，失败与无结果不计费。
- 限速：Search 100 QPS，Fetch 25 QPS（按账号）。
- 官方文档：<https://api-docs.deepseek.com/zh-cn/guides/search>

## 输出格式

- `json`（默认）：结构化 JSON，适合程序解析。
- `text`：紧凑文本，适合日志。
- `markdown`：带链接的排版，适合直接展示或写文档。

## 退出码

| 退出码 | 含义 |
| --- | --- |
| 0 | 成功 |
| 1 | API 错误（408/429/5xx 可重试一次） |
| 2 | 参数或配置错误，不重试 |
| 3 | HTTP 402，余额不足，充值后再试 |

## Claude Code 用户

本插件的 MCP 配置写在 `.zcode-plugin/plugin.json` 里，供 ZCode 使用。Claude Code 用户可参照同一份 CLI 自行配置：

```json
{
  "mcpServers": {
    "deepseek_web_search": {
      "command": "node",
      "args": ["<插件根>/cli/src/mcp-search.mjs"],
      "env": { "DEEPSEEK_API_KEY": "sk-..." }
    },
    "deepseek_web_fetch": {
      "command": "node",
      "args": ["<插件根>/cli/src/mcp-fetch.mjs"],
      "env": { "DEEPSEEK_API_KEY": "sk-..." }
    }
  }
}
```

## 边界

只做检索与抓取，不写回 DeepSeek，不碰账号设置。不引入任何 npm 运行时依赖。
