#!/usr/bin/env node

/**
 * Verify orchestrator: register, run, and report check families.
 * Rule bodies live in verify-*.mjs and must not return here.
 */

import { pathToFileURL } from "node:url";
import { failures, warnings } from "./verify-shared.mjs";
import { checkJsonFiles } from "./verify-json.mjs";
import { checkPackageBoundary } from "./verify-package-boundary.mjs";
import { checkSkillFiles, spineProviderFindings } from "./verify-skill-files.mjs";
import { checkOpenAiInvocationPolicies } from "./verify-explicit-only.mjs";
import { checkMirroredReferences } from "./verify-mirrored-refs.mjs";
import {
  checkReferenceIndex,
  checkRequiredSkillReferences,
  REQUIRED_SKILL_REFERENCES,
} from "./verify-references.mjs";
import { checkFamilySectionContract, sectionContractFindings } from "./verify-section-contract.mjs";
import {
  checkTerminology,
  matchesFilePattern,
  terminologyFindings,
  terminologyRules,
} from "./verify-terminology.mjs";
import { checkDocumentationPaths } from "./verify-documentation-paths.mjs";
import { checkPackDryRun } from "./verify-pack-dry-run.mjs";

function main() {
  checkJsonFiles();
  checkPackageBoundary();
  checkSkillFiles();
  checkOpenAiInvocationPolicies();
  checkMirroredReferences();
  checkReferenceIndex();
  checkRequiredSkillReferences();
  checkFamilySectionContract();
  checkTerminology();
  checkDocumentationPaths();
  checkPackDryRun();

  for (const warning of warnings) {
    console.warn(`warning: ${warning}`);
  }

  if (failures.length > 0) {
    console.error("verify failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("verify passed");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { sectionContractFindings, matchesFilePattern, terminologyFindings, terminologyRules, spineProviderFindings, REQUIRED_SKILL_REFERENCES };
