# Implementation orchestration

## Preconditions and checkpoints

Confirm Gate C and unchanged PRD/plan fingerprints. Inspect the repository and preserve
unrelated work. Read [delivery modes](delivery.md) and keep the Gate A choice explicit.
Do not stage, commit, push, or create external review requests without recorded authority.

Before each task, capture its baseline and owned files in a unique local scratch directory.
Keep scratch and planning documents outside the code diff. For local delivery, retain
before/after copies or patches, including new and deleted files. Record pre-existing edits
separately; never count them as the task's work. Expand the baseline before editing a newly
identified shared file. These snapshots allow review without staging or checkpoint commits.
In review-request mode, record the exact branch/base and the authorized dependency strategy:
merged predecessor or explicit stacked base. Never infer a default branch name.

## Classify and select

Every task is either `code` (changes repository content, including seeds, docs, tests and
migrations) or `human-qa` (a person exercises and judges existing behavior).
Human acceptance is never implemented, simplified, reviewed as code, or given its own PR/MR.

Use `<skill-dir>/modules/prd/scripts/prd.mjs next` with PRD, plan and run record to select
one ready task. Use `task-context` to produce its exact constraints and transitive references.
Complete the whole pipeline before starting another code task, even when several are ready.

## Implementation role

Give one implementation agent, when available and permitted:

- task/context paths, task ID, goal and acceptance IDs;
- exact owned files, shared surfaces, excluded scope and completed dependencies;
- the absolute path to `modules/development/GUIDE.md` and relevant references;
- seed/fixture responsibility and meaningful validation commands;
- a prohibition on unrelated cleanup, commits, pushes or external writes;
- a return contract: changed files, behavior, actual checks and unresolved risks.

Without subagents, follow the same contract in the current agent. Never fabricate delegation.
Only one writer owns a shared surface at a time. The coordinator owns integration unless
that ownership was explicitly assigned.

## Per-task pipeline

1. Implement the selected behavior and inspect the actual diff for scope drift.
2. Run its narrow meaningful validation; record `implemented`, then `validated` with evidence.
3. Apply [simplifier](simplifier.md) in a separate pass or available agent. Record
   `simplified`; a justified no-change pass is valid.
4. Repeat the affected validation and record `revalidated`.
5. Follow [review](../modules/review/GUIDE.md), light by default. This pass is read-only.
6. Record `reviewed` and triage concrete findings against the approved contract. Fix
   accepted findings in a distinct implementation pass or agent, then rerun the pipeline.
   Review may go from `reviewed` to `implemented` once; at most two review passes.
   Unresolved warnings/criticals or incomplete review coverage block dependent tasks.
7. Record actual check results using `record-check`. When the task is reviewable and its
   checks pass or a stated limitation is accepted, record `ready-to-open` (the historical
   phase name also means ready for local delivery).
8. Local mode: save the exact checkpoint, evidence, and handoff; record `delivered-local`.
   Review-request mode: create an authorized draft PR/MR using the chosen provider and
   verify its result; record `published` with the actual URL. Without authority, stop
   at `ready-to-open`. Do not mark an uncreated request published.

Nits alone do not block unless they reveal a concrete repeated maintainability risk.
The execution tool records observations; it cannot determine whether claims are true.
Never use its successful exit as a substitute for implementation, review or consent.

## Integrated verification

After all code deliveries, inspect cross-task contracts and replay the impact map and
acceptance matrix. Run proportionate integrated checks and safe seeds where available.
Use full review only for remaining cross-task risk. A necessary integration fix is a
scoped code task and requires the affected specification approvals to be updated before
implementation; do not silently edit an approved task graph.

Record observed evidence in the run JSON and re-render HTML. Present behavior, local
checkpoints or PR/MR links, actual checks, residual risks, and separate human-QA steps.
Only an actual human acceptance message permits an `accepted` record. Do not manufacture
acceptance or keep polling a person; hand off reproducible steps.
