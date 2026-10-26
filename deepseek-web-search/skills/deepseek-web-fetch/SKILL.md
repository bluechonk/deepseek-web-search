---
name: deepseek-web-fetch
description: Fetch a single web page with DeepSeek's official Fetch API and return its Markdown body. Use after deepseek-web-search when a result's snippet is not enough, when the user gives a URL to read, or when a page must be converted to clean Markdown for analysis.
---

# DeepSeek 网页抓取

用 DeepSeek 官方 Fetch API 把一个网页抓成 Markdown。所有调用都走本插件自带的零依赖 CLI，不直连 HTTP。

## 何时使用

- `deepseek-web-search` 搜到了目标，但 snippet 不够，需要读全文。
- 用户直接给了一个 URL，要求阅读、总结、提取或比对内容。
- 需要把网页转成干净 Markdown 再交给后续处理（写文档、做摘要、抽结构化数据）。

## 定位 CLI

按顺序尝试，命中即停：

1. PATH 中是否已全局安装：

   ```bash
   command -v dws
   ```

2. 未命中则用本技能目录推导插件根。本文件位于 `<插件根>/skills/deepseek-web-fetch/SKILL.md`，因此：

   ```bash
   node "<本文件所在目录>/../../cli/src/index.mjs"
   ```

把下面示例里的 `CLI` 替换成上面解析出的调用形式。

## 基本用法

```bash
CLI fetch "https://api-docs.deepseek.com/zh-cn/guides/search"
CLI fetch "https://api-docs.deepseek.com/zh-cn/guides/search" --format markdown
CLI fetch "https://example.com/article" --format json
```

参数：

- 位置参数：目标 URL，必须以 `http://` 或 `https://` 开头，不能带用户名密码。
- `--format json|text|markdown`：默认 `json`。`json` 含 `title` 与 `content` 两个字段；`text`/`markdown` 直接输出正文。

## 结果怎么用

- `content` 是抓取后的 Markdown 正文，`title` 是页面标题（可能为空）。
- 抓长文时先看结构（标题层级、列表），再决定是全文输出还是按段提取。
- 用户要总结就给总结，要原文就给原文，不要默认全文倾倒。
- 抓取失败时不要换 URL 瞎试，把状态码和错误原样报给用户。

## 失败处理

- 退出码 2：参数或配置错误（多为缺 `DEEPSEEK_API_KEY`）。先确认环境变量已设置，再原样重试。
- 退出码 3：HTTP 402，账号余额不足。提示用户充值，不要重试。
- 退出码 1：其他 API 错误。常见 404 表示目标不可用或被策略拦截；403 表示被安全策略拒绝；429 是触发限速，稍后重试一次。
- 抓取结果受目标站点可用性与访问策略影响，抓不到不等于页面不存在。

## 边界

- 只抓用户明确给出或搜索命中的 URL，不主动扩大抓取范围，不递归爬站。
- 不输出 API Key、不读取本地配置文件内容。
- 计费按成功请求计（5 元 / 1000 次），同一 URL 短时间内的重复抓取先复用上次结果。
