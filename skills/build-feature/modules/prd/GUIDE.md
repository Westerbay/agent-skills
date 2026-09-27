# Feature documents

Author content once as JSON; present only the generated HTML to the user. Keep source
JSON, execution records and generated planning documents local unless publication was
explicitly requested. Never hand-write HTML or create a parallel `.prd.md`.

## Before drafting

Inspect the repository before asking for facts. Use the bundled [reuse scouting](../../references/reuse-scouting.md).
Identify shared surfaces, their consumers and backward-compatibility checks. Resolve
source disagreements with the user (user instruction > supplied design > business document > code).
Ask one to three questions only when a material decision remains unresolved.

Use the compact contract in [references/authoring.md](references/authoring.md). Read only
the relevant profile and example; do not load the renderer or full schema in context.
`product` PRDs cover outcomes, users, requirements and macro tasks. `implementation`
PRDs operationalize an approved technical plan without copying its narrative.

## Commands

Resolve `<prd-skill>` as `<skill-dir>/modules/prd`; paths below are relative to this module.
Node 22+ is required. The checked-in assets support validation and PRD rendering without
installing packages. SVG diagram compilation and rebuilding assets additionally require
`npm ci --ignore-scripts` in this skill directory and Chrome (`--browser` overrides it).
Dependencies are pinned in package-lock.json. Never run `npx latest` per document.
When browser or optional dependencies are unavailable, use `render --diagram-source`
to show the original Mermaid source explicitly and report that SVG compilation was
skipped. This fallback requires only Node; never silently discard a required diagram.

```bash
node <prd-skill>/scripts/prd.mjs validate <feature>.prd.json --plan <feature>.tech-plan.json
node <prd-skill>/scripts/prd.mjs render <feature>.tech-plan.json
node <prd-skill>/scripts/prd.mjs render <feature>.prd.json --plan <feature>.tech-plan.json
node <prd-skill>/scripts/prd.mjs task-context <feature>.prd.json CODE-001 --plan <feature>.tech-plan.json
```

Omit `--plan` for a standalone product PRD. Use `--out` to place HTML or context elsewhere;
use `--plan-html` when the linked technical HTML is not beside its JSON. Re-render after
source changes. Validate before rendering and fix errors; coverage gaps are warnings
while drafting and blockers at implementation approval.

The HTML is portable, offline, printable, searchable and keyboard accessible. Importing
JSON is a preview, not a filesystem save or approval. Imported Mermaid remains visible
as source until compiled with `render`. Design skills are needed to change the shared
template, not to produce each PRD. Examples live in `examples/`.

## Execution and handoff

For build-feature, use [references/execution.md](references/execution.md). Preserve the
approved source; record observed checks and task phases separately in `<feature>.run.json`.
The CLI checks document fingerprints, references, dependencies and bounded review passes.
It does not establish user consent or judge the truth of evidence. Copy only explicit
user decisions and actual observations into the record. Never execute JSON commands.

Present the HTML path, key unresolved issues and any required approval. Agents consume
JSON or `task-context`; generated HTML and Markdown exports are not implementation sources.
