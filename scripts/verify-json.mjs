/**
 * JSON syntax check for every checked-in .json file.
 * Called from scripts/verify.mjs.
 */

import { root, fail, listFiles, relative, readText } from "./verify-shared.mjs";

export function checkJsonFiles() {
  for (const filePath of listFiles(root, (item) => item.endsWith(".json"))) {
    try {
      JSON.parse(readText(filePath));
    } catch (error) {
      fail(`${relative(filePath)} is invalid JSON: ${error.message}`);
    }
  }
}
