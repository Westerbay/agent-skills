# Implementation orchestration

## Baselines and ownership

Confirm Gate A/B and unchanged plan/implementation fingerprints. Preserve unrelated work
and keep [delivery mode](delivery.md) and Git authority explicit. Capture a cumulative
feature baseline and each task's attributable before/after patch or snapshot in local
scratch, including added/deleted/binary files. Keep planning files outside code diffs.

Record pre-existing user edits separately. Before first touching a newly identified file,
extend the baseline from its unmodified state. Do not stage, commit or switch branches
just to capture a patch. Use isolated worktrees only when supported and authorized.
Never have concurrent agents switch the branch of a shared checkout.

## Dispatch a safe parallel batch

Use `prd.mjs next` with both source documents and the run record. It returns dependency-
ready `taskIds`, a conservative disjoint `parallelTaskIds` batch, active work and scope
conflicts. The command records no claim and launches no agent. Recheck scope/dependencies
when starting each task; `record-task --phase started` claims its declared write scope.
The state writer serializes claims, not implementation work.

A task cannot start before its CODE prerequisites are `validated`. Select up to the
available worker count from the safe batch; do not wait for unrelated active tasks to
finish. Inspect actual shared resources as well as path overlap: schema contracts,
generated outputs, test databases and shared build steps may need coordination.
Unknown/glob scopes serialize conservatively; use concrete files/subtrees for parallelism.

Give each implementation worker:

- `task-context`, task ID, behavior and acceptance IDs;
- exact owned paths, excluded/shared surfaces and validated prerequisite outputs;
- the absolute bundled development guide path and relevant references;
- meaningful validation and any safe fixture responsibilities;
- no unrelated cleanup, Git publication or edits outside ownership;
- a return contract: patch/checkpoint, changed files, checks and unresolved risks.

The coordinator owns integration and shared-surface scheduling. Workers follow
[development guidance](../modules/development/GUIDE.md), record `implemented`, run targeted
checks, then record `validated`. A failed local check is fixed before validation.
There is no per-task specialist review, simplifier ceremony or PR publication here.
Validated dependencies release implementation work, not delivery.

With unavailable subagents, use the same graph and contracts sequentially; disclose
that no independent implementation/review agents ran. `human-qa` tasks are never coding
assignments; CODE tasks must not depend on post-delivery human acceptance.

## Integrate, simplify and review once

After every CODE task is validated:

1. Combine their exact outputs, resolve integration issues within approved behavior,
   and record feature phase `integrated` using `record-feature`.
2. Run the relevant combined behavior, type/build, integration and risk checks. Record
   actual check results and feature phase `validated`; report blocked checks honestly.
3. Apply the [simplifier](simplifier.md) once to the combined feature. Give each justified
   refactor an owning task and preserve attributable delivery patches. Record `simplified`.
4. Re-run affected checks, save an immutable cumulative result and record `revalidated`.
5. Follow [review](../modules/review/GUIDE.md), selecting light/full coverage and relevant
   [specialists](../modules/review/references/specialist-reviews.md) for the full feature.
   All reviewers use the same baseline/result and are read-only. Pause implementation
   writers during capture, review and verification.
6. Aggregate once and record feature phase `reviewed` once, not once per specialist or
   task. Triage supported findings against the approved contract.

Use the feature's starting baseline, not the latest task patch. Keep snapshots immutable
and label each result uniquely with fresh content hashes/patch digest. The review helper
does not automatically bind a reply to the patch digest; the coordinator must verify
matching run labels and snapshot identity and reject stale replies.

## Correct accepted findings

Verify cited code and impact, deduplicate root causes, and assign each accepted finding
an owner, focused repair and behavioral check. Supported maintainability problems deserve
actual refactors, not just recommendations. Metrics or the test ratio alone do not justify
rewrites or deleting useful coverage.

Assign separate writers the accepted fixes and bounded ownership. Quality/SOLID/web skills
can run in explicit review-and-refactor mode here; security review stays read-only with
remediation by an authorized implementation writer. Shared-file changes have one owner.
Ordinary internal refactors in the approved scope need no new permission. Material changes
to architecture, public/persisted contracts, auth, scope or other approved behavior return
to the affected gate.

Update the owning task patches after cross-task repairs; do not leave all corrections in
a large catch-all PR. Check each task against its intended base so redistribution does
not introduce missing imports, broken intermediate states or duplicated dependency diffs.
Re-run affected task and combined checks. Record `corrected -> revalidated`, save a new
snapshot, and review the entire corrected feature against the original feature baseline.

At most two feature review rounds. The second verifies prior fixes and their consequences.
Do not restart a per-task loop, reset the count with a new run, or make unreviewed edits
after the final pass. Unresolved material findings/incomplete coverage stay blocked at
`reviewed`; report the specific decision needed. A malformed reply may use the review
module's one retry on the unchanged snapshot, without a new implementation round.

## Deliver and hand off

When concerns are resolved or an explicit limitation accepted, compare the actual result
with the final reviewed snapshot and record feature phase `ready-to-deliver`. That phase
unlocks per-task `ready-to-open -> delivered-local | published`; dependencies determine
delivery order, while independent tasks may be prepared independently.

Follow [delivery guidance](delivery.md) for one small checkpoint/PR/MR per CODE task.
Splitting or rebasing changes can invalidate review evidence: verify exact content against
the reviewed snapshot and run checks on each actual base/head composition. A substantive
new change needs renewed affected review, not a claim that the old review covered it.
Do not exceed the two-round limit; disclose the blocker if new corrections are needed.

Record actual results, re-render the combined HTML, and hand off task checkpoints/links,
checks, risks and reproducible human-QA steps. Only actual human acceptance permits
`accepted`. Do not poll or manufacture a person's acceptance.