/**
 * Tiny `key: value` frontmatter parse/strip for craft-handoff pending files.
 * Not a full YAML parser — just enough for our own format.
 *
 * load-pending-hook.mjs keeps currentWorktree / archive / main flow.
 */

function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0] !== "---") return {};
  const out = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") return out;
    const m = lines[i].match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return {};
}

function stripFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0] !== "---") return content;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      return lines
        .slice(i + 1)
        .join("\n")
        .replace(/^\n+/, "");
    }
  }
  return content;
}

export { parseFrontmatter, stripFrontmatter };
