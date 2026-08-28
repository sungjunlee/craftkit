import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { beforeEach } from "node:test";
import {
  fail,
  warn,
  failures,
  warnings,
  listFiles,
  relative,
  readText,
  parseFrontmatter,
  root,
} from "../scripts/verify-shared.mjs";

beforeEach(() => {
  failures.length = 0;
  warnings.length = 0;
});

test("parseFrontmatter returns the inner YAML when both fences are present", () => {
  const text = "---\nname: example\ndescription: Example.\n---\n\n# Body\n";
  assert.equal(parseFrontmatter(text), "name: example\ndescription: Example.");
});

test("parseFrontmatter returns null when the opening fence is missing", () => {
  assert.equal(parseFrontmatter("# Example\n"), null);
  assert.equal(parseFrontmatter("--\nname: example\n---\n"), null);
});

test("parseFrontmatter returns null when the closing fence is missing", () => {
  assert.equal(parseFrontmatter("---\nname: example\n"), null);
});

test("fail and warn append to the exported arrays", () => {
  fail("first failure");
  fail("second failure");
  warn("a warning");

  assert.deepEqual(failures, ["first failure", "second failure"]);
  assert.deepEqual(warnings, ["a warning"]);
});

test("listFiles walks nested directories, skips .git and node_modules, and honors the predicate", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "craftkit-verify-shared-list-"));
  const keep = path.join(dir, "keep.json");
  const nested = path.join(dir, "nested", "dir", "a.json");
  const gitHidden = path.join(dir, ".git", "hidden.json");
  const nmHidden = path.join(dir, "node_modules", "pkg", "x.json");
  const skippedTxt = path.join(dir, "notes.txt");

  fs.mkdirSync(path.dirname(nested), { recursive: true });
  fs.mkdirSync(path.dirname(gitHidden), { recursive: true });
  fs.mkdirSync(path.dirname(nmHidden), { recursive: true });
  fs.writeFileSync(keep, "{}\n");
  fs.writeFileSync(nested, "{}\n");
  fs.writeFileSync(gitHidden, "{}\n");
  fs.writeFileSync(nmHidden, "{}\n");
  fs.writeFileSync(skippedTxt, "nope\n");

  const found = listFiles(dir, (item) => item.endsWith(".json")).sort();

  assert.deepEqual(found, [keep, nested].sort());
});

test("readText returns utf8 file contents", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "craftkit-verify-shared-read-"));
  const filePath = path.join(dir, "note.md");
  fs.writeFileSync(filePath, "hello\n");

  assert.equal(readText(filePath), "hello\n");
});

test("relative is relative to the exported root (process cwd at import)", () => {
  assert.equal(relative(path.join(root, "scripts/verify-shared.mjs")), "scripts/verify-shared.mjs");
});
