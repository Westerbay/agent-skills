# One implementation plan

Gate B approves the implementation logic and task graph together. Technical JSON owns
design entries; implementation JSON owns requirements, tasks and checks. Render them
together; do not produce two approval documents or repeat narrative across them.

## Inspect before proposing

Use [reuse scouting](reuse-scouting.md) to find relevant owners, contracts, components
and tests. Inspect affected consumers. Show only reuse decisions that affect the change,
with exact paths; keep exhaustive search logs out of the plan. Extend local code where
practical and check compatibility for shared changes.

For substantial functionality commonly provided by maintained libraries, verify current
official documentation before designing it from scratch. Compare repository fit, missing
behavior and material costs. Do not research packages for a trivial helper or present an
exhaustive survey. Surface consequential contradictions before approval.

## Explain the logic

Lead with the proposed flow and rule ownership, using repository/domain names. Include
changed contracts, invariants and failure paths that affect implementation. Show formulas
or compound decisions with meaningful inputs and one small example; add units, rounding,
null/zero behavior or ordering where relevant.

Use UML-style Mermaid as the primary explanation when interactions or state are easier
to understand visually:

- sequence diagram for the main request/event flow and significant failure/retry paths;
- class/domain diagram for meaningful entities, relationships and invariants that change;
- state diagram for a lifecycle or transition rule;
- component/dependency view when ownership or dependency direction changes.

Choose the smallest useful set. A diagram must answer an implementation question and
agree with contracts and task ownership. Follow it with a short explanation of the
non-obvious point, not a prose transcription. Omit irrelevant diagram types without a
section explaining each omission. The renderer derives the task DAG.

Describe consequential decisions in a few sentences: recommendation, why it fits, and
material cost. Include one alternative only if it could realistically change the decision.
No mandatory pattern catalog, ADR field table or speculative framework. Add migration,
auth, rollout, observability or deployment details only when affected.

For UI work, capture the agreed journey, screen/component hierarchy, interactions and
relevant states, responsive behavior and design-system choices in concise plan entries.
Reference existing mockups or designs by exact file/frame/section and revision or local
snapshot; distinguish approved requirements from illustrative examples and open choices.
Put observable UI expectations in acceptance criteria. Link the relevant entries to each
implementing task with `planRefs`, including UML and API/data schemas it must obey; use
`refs` for related contracts and `global: true` only for actual cross-cutting decisions.
Decisions left only in conversation or an unlinked visual will not reach a task excerpt.
Before Gate B, inspect representative task excerpts for this coverage. Do not add a
separate design document or duplicate the plan to achieve it.

Before presentation, apply a read-only SOLID critique through
[specialist routing](../modules/review/references/specialist-reviews.md), or use the
[bundled modular design guide](../modules/development/references/modular-design.md).
Check responsibility, dependencies and one actual extension/variation scenario. Resolve
concrete weaknesses without creating interfaces for imagined needs. Use the
[security adapter](../modules/review/references/security-audit-integration.md) for focused
trust-boundary guidance when relevant, not an automatic full audit. This preparation
adds no formal review round or gate and authorizes no feature-code edits.

## Decompose for parallel implementation and small PRs

Each CODE task owns one coherent behavior, prerequisite refactor, or integration change
that a human can understand in its own diff. Include directly related behavioral tests.
Avoid separate test-only tasks for every implementation task or arbitrary file-count
splits that leave each PR incomprehensible or broken.

1. Identify the minimal shared contract/primitive, if needed. Reuse existing contracts;
   do not make an artificial framework task a universal blocker.
2. Separate independently implementable consumers, adapters or behavior slices with
   disjoint write scopes. Describe shared interfaces before dispatch.
3. Add `dependsOn` only when a task consumes another task's output. A sequence number,
   shared language or common requirement is not a dependency.
4. Give shared wiring/configuration to one named task or coordinator-owned integration
   task. Serialize that surface, not the entire feature. Narrow overlapping ownership
   safely or add a real dependency; no concurrent writes to the same file.
5. Inspect graph width and proposed PR boundaries before Gate B. Show parallel groups.
   If a chain is unavoidable, state the specific dependency briefly.

Example: `contract -> {CSV adapter, HTML view} -> route wiring`, with behavioral tests
inside each implementation task and human acceptance after delivery. If the contract
already exists, the adapters may start immediately. Use concrete paths in `scope`, with
a trailing slash for owned subtrees; avoid `src/` as every task's blanket scope.
Record excluded/shared surfaces with `forbiddenScope` when needed.

Use [delivery guidance](delivery.md) to check PR size and dependency bases. Prefer a few
hundred handwritten changed lines when practical; around 400 merits a split check and
around 1,000 usually needs decomposition or a specific indivisible reason. These are
local planning alerts, not Git rules or hard ceilings. Account for generated/vendor/lock
changes separately. Never target a 15,000-line handwritten feature PR.

## Acceptance and approval

Every requirement has a task and an appropriate check route in structured JSON. The
renderer supplies traceability; do not maintain a duplicate matrix. Keep seeds minimal,
deterministic, idempotent and guarded from production, with setup/cleanup. No seed is
required where it adds no validation value. Tests protect behavior; meaningful accessor
invariants count, trivial getters/setters do not.

Author both JSON sources using the [compact contract](../modules/prd/references/authoring.md).
Render one combined HTML with logic/UML, concise acceptance requirements, task DAG and
checks. Present the link and material open decisions; ask once for Gate B approval of
that exact pair of sources. No separate Gate C. Source changes invalidate run fingerprints;
reopen affected approvals for substantive changes rather than editing approved history.
