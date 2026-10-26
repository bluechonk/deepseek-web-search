#!/usr/bin/env node
// deepseek-web-search CLI 入口：解析参数并分发到 Search / Fetch / doctor。
// 零依赖，只用 Node 内置模块。

import { ApiError, ConfigError, DEFAULT_VERSION, doctor, fetchPage, resolveConfig, search } from "./api.mjs";
import { isFormat, render, renderError } from "./output.mjs";

const HELP = `deepseek-web-search — DeepSeek official web search & page fetch CLI

Usage:
  deepseek-web-search <command> [options]

Commands:
  search <query>        Search the web (supports site:, -site:, -term, "phrase", lang:, after:/before:)
  fetch <url>           Fetch a page and return its Markdown body
  doctor                Verify API key and connectivity

Options:
  --count <n>           Results per search, 1-50 (default 10)
  --need-content        Include page bodies in search results
  --ori-question <s>    Original user question for better ranking
  --localization <ip>   IP used to localize search results
  --format <fmt>        json (default) | text | markdown
  --api-key <key>       Override DEEPSEEK_API_KEY
  --base-url <url>      Override API base URL
  -h, --help            Show this help
  -V, --version         Show version

Environment:
  DEEPSEEK_API_KEY      Required API key
  DEEPSEEK_BASE_URL     Optional base URL override

Examples:
  deepseek-web-search search "DeepSeek V4 发布" --count 5
  deepseek-web-search search "site:github.com deepseek" --need-content
  deepseek-web-search fetch https://api-docs.deepseek.com/zh-cn/guides/search
  deepseek-web-search search "AI 新闻" --format markdown
`;

function parseArgs(argv) {
  const options = {
    command: null,
    positional: [],
    count: undefined,
    needContent: false,
    oriQuestion: undefined,
    localization: undefined,
    format: "json",
    apiKey: undefined,
    baseUrl: undefined,
    help: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = () => {
      const value = argv[index + 1];
      if (value === undefined) throw new ConfigError(`Missing value for ${token}.`);
      index += 1;
      return value;
    };

    switch (token) {
      case "search":
      case "fetch":
      case "doctor":
        if (options.command) throw new ConfigError(`Multiple commands given: ${options.command}, ${token}.`);
        options.command = token;
        break;
      case "--count": {
        const value = Number(next());
        if (!Number.isInteger(value) || value < 1 || value > 50) {
          throw new ConfigError("--count must be an integer between 1 and 50.");
        }
        options.count = value;
        break;
      }
      case "--need-content":
        options.needContent = true;
        break;
      case "--ori-question":
        options.oriQuestion = next();
        break;
      case "--localization":
        options.localization = next();
        break;
      case "--format": {
        const value = next();
        if (!isFormat(value)) throw new ConfigError(`Unknown --format "${value}". Use json, text or markdown.`);
        options.format = value;
        break;
      }
      case "--api-key":
        options.apiKey = next();
        break;
      case "--base-url":
        options.baseUrl = next();
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-V":
      case "--version":
        options.version = true;
        break;
      default:
        if (token.startsWith("-")) throw new ConfigError(`Unknown option: ${token}`);
        options.positional.push(token);
    }
  }
  return options;
}

function validate(options) {
  if (options.help || options.version) return;

  if (!options.command) throw new ConfigError("No command given. Use search, fetch or doctor.");

  if (options.command === "search" && options.positional.length === 0) {
    throw new ConfigError("search requires a <query> argument.");
  }
  if (options.command === "fetch" && options.positional.length === 0) {
    throw new ConfigError("fetch requires a <url> argument.");
  }
  if (options.command === "fetch" && options.positional.length > 1) {
    throw new ConfigError("fetch accepts exactly one <url> argument.");
  }
  if (options.command === "search" && options.positional.length > 1) {
    throw new ConfigError("search accepts exactly one <query> argument.");
  }
  if (options.command === "doctor" && options.positional.length > 0) {
    throw new ConfigError("doctor takes no positional arguments.");
  }
  if (options.command === "fetch" && !/^https?:\/\//u.test(options.positional[0])) {
    throw new ConfigError("fetch <url> must start with http:// or https://");
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(renderError(error, "text"));
    process.stderr.write(`\nRun "deepseek-web-search --help" for usage.\n`);
    process.exitCode = 2;
    return;
  }

  if (options.version) {
    process.stdout.write(`${DEFAULT_VERSION}\n`);
    return;
  }
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  try {
    validate(options);
  } catch (error) {
    process.stderr.write(renderError(error, "text"));
    process.stderr.write(`\nRun "deepseek-web-search --help" for usage.\n`);
    process.exitCode = 2;
    return;
  }

  let config;
  try {
    config = resolveConfig(options);
  } catch (error) {
    process.stderr.write(renderError(error, options.format));
    process.exitCode = 2;
    return;
  }

  try {
    if (options.command === "search") {
      const data = await search(
        {
          query: options.positional[0],
          count: options.count,
          oriQuestion: options.oriQuestion,
          localization: options.localization,
          needContent: options.needContent,
        },
        config,
      );
      process.stdout.write(render("search", data, options.format));
      return;
    }

    if (options.command === "fetch") {
      const data = await fetchPage({ url: options.positional[0] }, config);
      process.stdout.write(render("fetch", data, options.format));
      return;
    }

    const data = await doctor(config);
    process.stdout.write(render("search", data, options.format));
  } catch (error) {
    process.stderr.write(renderError(error, options.format));
    process.exitCode = error instanceof ApiError && error.status === 402 ? 3 : 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error?.stack ?? error}\n`);
  process.exitCode = 1;
});
