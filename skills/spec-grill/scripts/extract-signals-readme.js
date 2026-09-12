/**
 * README first-paragraph summary for extract-signals.js.
 *
 * Kept in its own module so extractSignals orchestration stays in core
 * while README summary extraction is a separate seam.
 */

function summarizeReadme(readme) {
  if (!readme) return null;
  for (const line of readme.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("[!")) continue;
    if (trimmed.startsWith("<!--")) continue;
    if (/^<\/?div\b/i.test(trimmed)) continue;
    if (/^<p\b/i.test(trimmed) || /^<\/p>/i.test(trimmed)) continue;
    if (/^<br\s*\/?>$/i.test(trimmed)) continue;
    if (/^\[.+\]\(.+\)(\s*[•|·]\s*\[.+\]\(.+\))*$/.test(trimmed)) continue;
    return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
  }
  return null;
}

export { summarizeReadme };
