#!/usr/bin/env bash
# copy-clipboard.sh — read stdin, copy to system clipboard.
#
# Why bash and not Node (CraftKit's default tooling language):
#   This is a thin shim over native binaries (pbcopy, wl-copy, xclip,
#   xsel, clip.exe). Node would add a fork() + JS startup with no
#   functional benefit — bash's command -v + pipe is the right shape.
#
# Detection order:
#   1. pbcopy        — macOS (bundled)
#   2. wl-copy       — Linux Wayland (wl-clipboard package)
#   3. xclip         — Linux X11 (most distros)
#   4. xsel          — Linux X11 fallback
#   5. clip.exe      — Windows / WSL (bundled with Windows)
#
# Exit codes:
#   0 — copied successfully
#   1 — no clipboard tool found (message on stderr)

set -e

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy
elif [ -n "${WAYLAND_DISPLAY:-}" ] && command -v wl-copy >/dev/null 2>&1; then
  wl-copy
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard
elif command -v xsel >/dev/null 2>&1; then
  xsel --clipboard --input
elif command -v clip.exe >/dev/null 2>&1; then
  clip.exe
else
  echo "copy-clipboard: no clipboard tool found." >&2
  echo "  Install one of: pbcopy (macOS), wl-clipboard, xclip, xsel, clip.exe (Windows)." >&2
  echo "  Prompt is still saved to ~/.craftkit/handoff/pending.md." >&2
  exit 1
fi
