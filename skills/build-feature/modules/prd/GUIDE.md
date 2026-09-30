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

Before rendering a document containing Mermaid, verify Node 22+, the module's local
`playwright-core` dependency, and an available Chrome executable. Install the locked
dependencies once in this module, or in a persistent writable copy of the complete
module when the installed skill is read-only. Reuse that runtime for subsequent documents;
do not install it only in one project's temporary directory and assume other projects
are ready. Skill updates that replace the module may require setup again. Run the normal
`render` command so diagrams are compiled automatically; do not choose source-only output
merely to avoid setup. Respect the host's permission requirements for package installation
and browser execution; if already authorized, proceed without asking again.

After rendering, verify that every diagram entry has an SVG in the HTML's embedded
`document-data` payload and inspect its displayed result when browser access permits.
If installation or browser execution is blocked, use `render --diagram-source` only as
an explicit degraded fallback. Tell the user alongside the HTML link that diagrams are
shown as Mermaid text, why compilation was skipped, and how to enable it. This fallback
requires only Node; never present source-only diagrams as completed images.

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

## Copy a diagram and mathematical formulas

Each compiled SVG has a **Copy diagram as image** button below it (in French,
**Copier le diagramme en image**). It copies only that diagram as a PNG to the clipboard,
without the surrounding document. If clipboard access is unavailable or denied, the
reader downloads that diagram as a PNG named after its entry ID and reports the outcome.
Source-only diagrams have no copy button. Browser canvas size limits still apply to
very large diagrams.

Write inline LaTeX as `\(a^2 + b^2 = c^2\)` and display formulas as
`\[\frac{a}{b}\]` or `$$\sum_{i=1}^{n} i$$` in prose fields, including array items.
In JSON strings, escape backslashes: `"Cost: \\(\\frac{a}{b}\\)"`.
KaTeX produces native MathML bundled into the standalone HTML, with no CDN or
network fonts. Modern browsers render the formulas offline and expose mathematical
structure to assistive technology. Code and diagram source blocks remain literal;
single dollar signs remain ordinary text. Invalid formulas stay visible, and math
commands cannot execute HTML or load remote content.

## Execution and handoff

For build-feature, use [references/execution.md](references/execution.md). Preserve the
approved source; record observed checks and task phases separately in `<feature>.run.json`.
The CLI checks document fingerprints, references, dependencies and bounded review passes.
It does not establish user consent or judge the truth of evidence. Copy only explicit
user decisions and actual observations into the record. Never execute JSON commands.

Present the HTML path, key unresolved issues and any required approval. Agents consume
JSON or `task-context`; generated HTML and Markdown exports are not implementation sources.
