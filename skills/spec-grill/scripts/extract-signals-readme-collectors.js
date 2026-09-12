/**
 * README collectors for extract-signals.js.
 *
 * collectReadmeCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectReadmeCandidates so public names stay stable.
 */

import { slugifyCandidate } from "./extract-signals-shared.js";

function collectReadmeCandidates(readme) {
  if (!readme) return [];
  const candidates = [];
  let activeHeading = null;
  for (const line of readme.split("\n")) {
    const heading = line.match(/^#{2,4}\s+(.+?)\s*$/);
    if (heading) {
      activeHeading = /capabilit|feature|support|command|skill/i.test(heading[1])
        ? heading[1].trim()
        : null;
      continue;
    }
    if (!activeHeading) continue;
    const bullet = line.match(/^-\s+(?:`([^`]+)`|([A-Za-z][A-Za-z0-9 -]{2,60}))(?:\s+[-:\u2013\u2014]\s+(.+))?/);
    if (!bullet) continue;
    const rawName = bullet[1] || bullet[2];
    const name = slugifyCandidate(rawName.split(/\s+/).slice(0, 4).join("-"));
    if (!name) continue;
    candidates.push({
      name,
      signal: `README:${activeHeading}: ${line.trim()}`,
    });
  }
  return candidates;
}

export {
  collectReadmeCandidates,
};
