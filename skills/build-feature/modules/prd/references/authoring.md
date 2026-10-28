# Compact document contract (schemaVersion 1)

All documents: `schemaVersion: 1`, `kind: "prd" | "tech-plan"`, stable `id`, `revision`,
`title`, `summary`, `locale: "fr" | "en"`, and `constraints: string[]`.
IDs start with a letter and contain letters, digits, hyphens or underscores; item IDs are
unique across a document. Prose is plain text, with newlines for paragraphs. Do not encode
HTML, CSS, layout, duplicated counters or a hand-maintained task graph in JSON.

Choose the prose language from the user's conversation unless they explicitly request
another language; do not copy the language of an example or infer it from repository code.
Use it for titles, summaries, requirements, task goals, checks, risks, technical explanations,
human QA and natural-language UML labels. Preserve schema keys, enum values, stable IDs,
code/API names and commands. Set both source documents to `locale: "fr"` for French or
`locale: "en"` for English, so the HTML controls match the prose. The renderer currently
supports only these two UI locales: for another language, keep the requested prose and
disclose the English UI fallback; do not invent a locale or claim full UI translation.

Prose may contain inline LaTeX `\(...\)` or display LaTeX `\[...\]` / `$$...$$`.
Escape backslashes in JSON strings, for example `"\\(\\frac{a}{b}\\)"`.
The renderer displays formulas offline; code blocks and diagram source remain literal.

Optional common fields: `goals`, `users`, `outOfScope`, `successMetrics` (string arrays),
`preDraft: {reuse: string[], sharedSurfaces: string[], sourcePriority: string[]}`.
Keep useful narrative; optional sections need not be filled ceremonially.

## PRD

Use `kind: "prd"`, `profile: "product" | "implementation"`. Implementation requires
`techPlan: {id, revision}` and is checked against the supplied technical JSON.
Required arrays (empty allowed except requirements):

- `requirements`: `{id, kind: "functional" | "non-functional", title, description,
  priority: "must" | "should" | "could", acceptance: string[]}`.
- `tasks`: see the two task types below.
- `checks`: `{id, requirementIds: string[], scenario, risk?: string,
  route: "automated" | "runtime" | "manual", stage?: "delivery" | "acceptance",
  expected, seedIds: string[]}`.
- `seeds`: `{id, description, requirementIds: string[], setup, cleanup, safety}`.
- `risks`: `{id, kind: "risk" | "assumption" | "question", description,
  mitigation?: string, status: "open" | "resolved", owner?: string}`.

Every implementation requirement needs a task and a check. Use observable acceptance
criteria. Automated tests still pass the TDD test-value gate; runtime/manual evidence is
valid. Seed commands must be deterministic, idempotent and guarded from production.
Checks default to `stage: "delivery"` and must pass before any task delivery, unless the
user explicitly accepts that exact limitation. Use `acceptance` only for post-delivery
human acceptance; `route: "manual"` alone does not defer a check. Make the stage visible
in the combined approval HTML and settle it before Gate B; do not reclassify a failed
check to bypass the delivery guard.

Common task fields: `{id, kind, title, dependsOn: string[], requirementIds: string[],
planRefs: string[], seedIds: string[]}`. Dependencies reference task IDs in this PRD;
planRefs reference entry IDs in its technical plan.

- `code`: add `goal`, `scope: string[]`, optional `forbiddenScope: string[]`,
  `validation: string[]`. Use concrete repository-relative files or subtrees (trailing
  slash) as write scopes; broad/glob/unknown scopes prevent safe parallel claims. Each
  task is one coherent small change with its related meaningful tests, yielding one
  local checkpoint or authorized draft PR/MR after the integrated feature review.
- `human-qa`: add `steps: string[]`, `expected`, `cleanup`. No code scope or implementation
  agent. A committed seed/script/test/doc change is a code task, not human QA.

Read `examples/reader.prd.json` only when a complete example helps. Keep requirements and
technical constraints in their owners; reference IDs instead of repeating paragraphs.
Dependencies represent required outputs, not list order. Independent disjoint scopes can
run in parallel; assign shared wiring to one owner. CODE cannot depend on post-delivery
human QA. The renderer derives parallel graph levels; do not draw a duplicate task diagram.

## Technical plan

Use `kind: "tech-plan"` and `entries: [...]`. Each entry:
`{id, kind, title, body, global: boolean, refs: string[]}`.
Kind: `current`, `reuse`, `boundary`, `contract`, `decision`, `calculation`, `flow`,
`rollout`, or `risk`. Optional prose fields: `alternative`, `consequences`, `example`;
optional `code` and `diagram` (Mermaid source).

Explain existing/proposed ownership, invariants, API/data/auth effects and important
calculations proportionally to the feature. A consequential decision compares at most
one credible alternative. Calculations state inputs, units, boundaries, rounding and a
worked example. Diagrams answer a question; class/domain diagrams apply when meaningful
entities change. Omit irrelevant categories rather than explaining every absent diagram.
Avoid named patterns without need and keep decision prose brief.

Mark cross-cutting constraints `global: true`. Link entry dependencies with `refs`.
`task-context` includes global entries and the transitive references of the task and its
prerequisites, preserving their complete `body`, `code` and `diagram` content. Capture
approved UX/UI decisions in the applicable `flow`, `contract` or `decision` entries,
including exact design source/revision references in their body, and link them with
`planRefs`. A link's external contents are not fetched or embedded by the helper; the
coordinator must make required visuals readable to workers. Unresolved risks, top-level
constraints and feature framing (summary, goals, users, exclusions and success metrics)
are retained. No new entry kind or duplicate design document is required.
No diagram init directives, frontmatter overrides or embedded HTML. The renderer owns
Mermaid configuration, compiles SVG offline and caches by source plus renderer version.
Read `examples/reader.tech-plan.json` only if needed.

## Revision and migration

For build-feature, these two source documents produce one combined HTML and one Gate B
approval, binding both fingerprints and the task graph. Do not repeat design narrative in
the implementation PRD or ask for a separate Gate C.

Bump revision for a substantive source change; reopen the earliest affected approval gate.
New runs use `fingerprintMode: "contract-v1"`: only document locale and root/requirement/
task/entry titles are excluded from approval fingerprints. Titles are display labels;
put behavior in descriptions, acceptance, bodies and other contract fields. Summaries,
diagrams, scopes, checks and revisions remain binding, including edits without a revision
bump. Presentation-only title/locale edits need a re-render, not new approvals. For a
changed contract, initialize a new record and carry forward only approvals/evidence still
valid for that exact revision; never edit hashes to preserve stale authority. Legacy v2
records without this mode retain full-document fingerprint rules without silent migration.
Existing HTML stays readable. Do not mass-convert historical Markdown or delete it; new
and explicitly revised documents use JSON. Schema migrations are explicit, never lossy.
Document schema stays at version 1. Execution records now use version 2; preserve old
three-gate/per-task-review records and follow the [execution migration](execution.md).
