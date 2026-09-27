# Compact document contract (schemaVersion 1)

All documents: `schemaVersion: 1`, `kind: "prd" | "tech-plan"`, stable `id`, `revision`,
`title`, `summary`, `locale: "fr" | "en"`, and `constraints: string[]`.
IDs start with a letter and contain letters, digits, hyphens or underscores; item IDs are
unique across a document. Prose is plain text, with newlines for paragraphs. Do not encode
HTML, CSS, layout, duplicated counters or a hand-maintained task graph in JSON.

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
  route: "automated" | "runtime" | "manual", expected, seedIds: string[]}`.
- `seeds`: `{id, description, requirementIds: string[], setup, cleanup, safety}`.
- `risks`: `{id, kind: "risk" | "assumption" | "question", description,
  mitigation?: string, status: "open" | "resolved", owner?: string}`.

Every implementation requirement needs a task and a check. Use observable acceptance
criteria. Automated tests still pass the TDD test-value gate; runtime/manual evidence is
valid. Seed commands must be deterministic, idempotent and guarded from production.

Common task fields: `{id, kind, title, dependsOn: string[], requirementIds: string[],
planRefs: string[], seedIds: string[]}`. Dependencies reference task IDs in this PRD;
planRefs reference entry IDs in its technical plan.

- `code`: add `goal`, `scope: string[]`, optional `forbiddenScope: string[]`,
  `validation: string[]`. A code task has a local delivery checkpoint or one authorized draft PR/MR, according to the selected delivery mode.
- `human-qa`: add `steps: string[]`, `expected`, `cleanup`. No code scope or implementation
  agent. A committed seed/script/test/doc change is a code task, not human QA.

Read `examples/reader.prd.json` only when a complete example helps. Keep requirements and
technical constraints in their owners; reference IDs instead of repeating paragraphs.

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
entities change. Otherwise explain the omission in prose. Avoid named patterns without need.

Mark cross-cutting constraints `global: true`. Link entry dependencies with `refs`.
`task-context` includes global entries and the transitive references of the task and its
prerequisites. Unresolved risks and top-level constraints are always retained.
No diagram init directives, frontmatter overrides or embedded HTML. The renderer owns
Mermaid configuration, compiles SVG offline and caches by source plus renderer version.
Read `examples/reader.tech-plan.json` only if needed.

## Revision and migration

Bump revision for a substantive source change; reopen the earliest affected approval gate.
The execution fingerprint also detects edits that forgot to bump revision. Initialize a
new run record and record only approvals still valid for this exact scope/plan revision.
Existing HTML stays readable. Do not mass-convert historical Markdown or delete it; new
and explicitly revised documents use JSON. Schema migrations are explicit, never lossy.
