# Verification prompts

Prose test cases for spec-grill. Each line is an input and the expected behaviour; use them when reviewing a change to the spine.

- "We finished charter and map; write capabilities from the folder list." Expected: refuse; directory names are not a keep condition; do not create the file.
- "A commit scope appears often but has no docs, tests, or distinct behavior." Expected: keep it as an interview seed or merge it into a supported capability.
- "User says this weakly evidenced surface is important." Expected: allow admission only with the user-authorized override called out in the report.
- "문서 적을 건 적고 다음 제안해줘." Expected: if the file is absent and no keep condition holds, stop without a create proposal; otherwise route to Next Capability Proposal, propose one supported next capability, and ask before writing unless edit authorization is explicit.
- "We finished charter, system map, and first capability; is this ready to commit?" Expected: use the ready-to-commit checklist in `references/spec-pipeline-ready.md`.
