// 输出格式化：json（默认，给 agent 解析）/ text / markdown（给人看）。

export const FORMATS = ["json", "text", "markdown"];

export function isFormat(value) {
  return FORMATS.includes(value);
}

export function formatJson(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function clip(text, max) {
  const value = String(text ?? "");
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function formatSearchText(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  if (results.length === 0) return "No results.\n";

  const lines = results.map((item, index) => {
    const score = item.rerank_score ?? "-";
    const date = item.date ?? "-";
    return [
      `${index + 1}. ${item.title ?? "(untitled)"}`,
      `   url: ${item.url ?? "-"}`,
      `   score: ${score}  authority: ${item.authority ?? "-"}  date: ${date}`,
      `   ${clip(item.snippet, 220)}`,
    ].join("\n");
  });
  return `${lines.join("\n\n")}\n`;
}

function formatSearchMarkdown(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  if (results.length === 0) return "No results.\n";

  const lines = results.map((item, index) => {
    const score = item.rerank_score ?? "-";
    const date = item.date ?? "-";
    return [
      `${index + 1}. **[${item.title ?? "(untitled)"}](${item.url ?? "#"})**`,
      `   score \`${score}\` · authority \`${item.authority ?? "-"}\` · date \`${date}\``,
      `   ${clip(item.summary || item.snippet, 400).replace(/\n+/gu, " ")}`,
    ].join("\n");
  });
  return `${lines.join("\n\n")}\n`;
}

function formatFetchText(data) {
  const title = data?.title ?? "";
  const content = data?.content ?? "";
  return `${title ? `# ${title}\n\n` : ""}${content}\n`;
}

function formatFetchMarkdown(data) {
  const title = data?.title ?? "";
  const content = data?.content ?? "";
  return `${title ? `# ${title}\n\n` : ""}${content}\n`;
}

// 按 kind 选择渲染器；未知格式回退 json。
export function render(kind, data, format) {
  if (format === "text") {
    return kind === "search" ? formatSearchText(data) : formatFetchText(data);
  }
  if (format === "markdown") {
    return kind === "search" ? formatSearchMarkdown(data) : formatFetchMarkdown(data);
  }
  return formatJson(data);
}

// 错误也按格式输出，方便 agent 解析失败原因。
export function renderError(error, format) {
  const payload = {
    error: {
      message: error.message,
      name: error.name ?? "Error",
      status: error.status ?? null,
      code: error.code ?? null,
    },
  };
  if (format === "json") return formatJson(payload);
  const head = `${error.name ?? "Error"}: ${error.message}`;
  const detail = error.status ? ` (HTTP ${error.status}${error.code ? `, ${error.code}` : ""})` : "";
  return `${head}${detail}\n`;
}
