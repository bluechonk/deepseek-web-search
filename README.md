# deepseek-web-search

一个 ZCode 插件市场，内含「DeepSeek 联网搜索」插件：把 DeepSeek 官方联网搜索与网页抓取能力接入 ZCode。

## 仓库结构

```text
marketplace.json              市场清单（仓库根即市场根）
deepseek-web-search/
  .zcode-plugin/plugin.json   插件清单
  cli/                        零依赖 npm CLI（search / fetch / doctor）
  commands/                   斜杠命令
  skills/                     技能
```

## 添加为 ZCode 插件市场

1. 打开 **插件市场 / Plugin Marketplace**。
2. 点击 **添加 / Add → 添加插件市场 / Add Plugin Marketplace**。
3. 粘贴仓库地址：`https://github.com/bluechonk/deepseek-web-search`
4. 添加后到 **个人 / Personal** 找到「DeepSeek 联网搜索」，点击 **安装 / Install**。

## 前置条件

- Node.js >= 18。
- DeepSeek API Key，通过环境变量 `DEEPSEEK_API_KEY` 提供。
- 可选 `DEEPSEEK_BASE_URL` 覆盖 API 地址。

## 插件能力

| 组件 | 内容 |
| --- | --- |
| Command | `/deepseek_web_search <query>`、`/deepseek_web_search <url>` |
| Skill | `deepseek-web-search`（联网搜索）、`deepseek-web-fetch`（网页抓取） |
| MCP | `deepseek_web_search`、`deepseek_web_fetch` 两个 stdio server |
| CLI | `dws search / fetch / doctor` |

## 脱离 ZCode 使用 CLI

```bash
npm i -g deepseek-web-search

dws search "DeepSeek V4 发布" --count 5
dws fetch https://api-docs.deepseek.com/zh-cn/guides/search
dws doctor
```

命令名是 `dws`。npm 上的 `dws` 包是另一个无关项目，`npx dws` 不会运行本工具；不安装时用包名：

```bash
npx deepseek-web-search search "AI 新闻" --format markdown
```

## 接口说明

| 接口 | 端点 |
| --- | --- |
| Search | `POST https://api.deepseek.com/v1/tools/search` |
| Fetch | `POST https://api.deepseek.com/v1/tools/fetch` |

- 鉴权：`Authorization: Bearer <API Key>`，与普通 DeepSeek API 同一个 Key。
- 计费：按成功请求计，Search / Fetch 各 5 元 / 1000 次，失败与无结果不计费。
- 限速：Search 100 QPS，Fetch 25 QPS（按账号）。
- 限时免费：2026-11-01 00:00（北京时间）起正式按次收费。
- 官方文档：<https://api-docs.deepseek.com/zh-cn/guides/search>

## 输出格式

- `json`（默认）：结构化 JSON，适合程序解析。
- `text`：紧凑文本，适合日志。
- `markdown`：带链接排版，适合直接展示或写文档。

## 退出码

| 退出码 | 含义 |
| --- | --- |
| 0 | 成功 |
| 1 | API 错误（408/429/5xx 可重试一次） |
| 2 | 参数或配置错误，不重试 |
| 3 | HTTP 402，余额不足，充值后再试 |

## 许可

MIT
