# Execution record (version 2)

`<feature>.run.json` records actual evidence separately from the two specification JSON
files. Resolve the installed `prd.mjs` once. All execution commands accept
`--plan <feature>.tech-plan.json`; supply it throughout implementation.
The helper never starts agents, edits code, creates Git commits or publishes requests.

## Approve once after scope

1. `init-run <prd.json> --state <run.json> --plan <plan.json>` creates a version 2 run,
   refuses overwrite and accepts `--delivery local|review-request` (default local).
2. `approve <prd.json> --state <run.json> --plan <plan.json> --gate A --revision <scope-rev>
   --evidence <explicit-user-message-reference>` records scope approval and delivery mode.
   Optional `--authority branch,commit,push,draft-pr` records only authorized actions.
3. After presenting the combined HTML, repeat with `--gate B --revision <prd-revision>`
   and the actual combined approval evidence. B binds both the PRD and plan fingerprints,
   records the plan revision, and requires complete requirement/task/check coverage.
   There is no Gate C. Evidence text is not an automatic consent mechanism.

## Parallel implementation

`next <prd.json> --state <run.json> --plan <plan.json>` returns:

- `ready`: all eligible `taskIds`, a conservative disjoint `parallelTaskIds` batch,
  active tasks and any `blockedByScope` entries;
- `in-progress`: active tasks when no new disjoint task can start;
- `feature`: the combined phase and `nextPhases` after all CODE tasks validate;
- `delivery`: dependency-ready task IDs after the final feature review;
- `human-qa`, `task-chain-complete`, or an explicit blocker.

Use `task-context <prd.json> CODE-001 --plan <plan.json> --state <run.json>
--out <context.json>` for each worker's requirements, owned scope and technical references.
Without state, this is a planning excerpt, not execution authority.

Record each CODE task with `record-task <prd.json> CODE-001 --state <run.json>
--plan <plan.json> --phase <phase> --evidence <actual-observation>`:
`started -> implemented -> validated`. Starting checks prerequisites and claims its scope
against active writers; validation releases dependencies before review or publication.
Concrete file/subtree scopes support parallelism; ambiguous/glob scopes serialize.
Path matching is conservative and textual: the coordinator must also check symlinks,
shared generated outputs and non-file resources. No task may depend on human acceptance.

## One feature review, then task deliveries

Use `record-feature <prd.json> --state <run.json> --plan <plan.json>
--phase <phase> --evidence <actual-observation>` for the integrated sequence:

```text
integrated -> validated -> simplified -> revalidated -> reviewed -> ready-to-deliver
                                                   -> corrected -> revalidated -> reviewed
```

All CODE tasks must be validated first. `reviewed` records the aggregate of all selected
specialists, not an individual reply. The correction path allows at most two feature
review rounds. Evidence does not prove a clean verdict: the coordinator must resolve
material findings, verify coverage and compare the actual tree to the reviewed snapshot
before advancing. No third loop or resetting the run to evade the limit.
If preparing task diffs reveals a problem after the first `ready-to-deliver`, `corrected`
is still allowed before any task enters `ready-to-open`; revalidation and the second
review are required before delivery can resume.

After `ready-to-deliver`, record each CODE task's `ready-to-open`, then `delivered-local`
or `published` according to mode. Delivery follows dependency order. `published` requires
recorded push/draft-pr authority and `--pr <actual-https-url>`; each task has its own URL.
`draft-pr` also means draft MR. Local delivery requires an actual saved checkpoint.
Global evidence freezes when task delivery starts; substantive subsequent changes require
an explicit scoped revision, not rewriting delivered review history.

Use `record-check <prd.json> CHECK-001 --state <run.json> --plan <plan.json>
--result passed|failed|blocked --evidence <actual-result>` for observations.
Planned checks remain in the specification. Human QA can receive only `accepted`, after
all CODE deliveries and with an actual human acceptance message; never infer acceptance.

Re-render `render <prd.json> --plan <plan.json> --state <run.json>` to show the combined
plan, global review evidence and each delivery. Scripts cannot judge evidence truth.

## Compatibility and state safety

Document schema remains version 1. Legacy execution version 1 used three approvals and
per-task review; the new helper rejects it with a migration message. Preserve that record
and its delivered work. Prepare the combined plan and obtain its explicit approval,
then initialize a separate version 2 run. Carry forward only verified observations;
never copy old B/C approvals as if they approved the new workflow, fabricate reviews,
or reset a review limit. Historical HTML stays readable.

The state writer uses a lock and atomic replacement. If a crashed process leaves a lock,
confirm its owner is gone before removing that exact lock. Stale fingerprints require
valid approval of the changed source; never edit hashes to force an old approval through.
