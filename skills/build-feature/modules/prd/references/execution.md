# Execution record (version 2)

`<feature>.run.json` records observations separately from PRD and technical-plan JSON.
Resolve `prd.mjs` once; supply `--plan <plan.json>` throughout implementation. The helper
never starts agents, edits feature code, creates Git commits or publishes requests.

## Approvals and source identity

1. `init-run <prd.json> --state <run.json> --plan <plan.json>` creates a new record,
   refuses overwrite and accepts `--delivery local|review-request` (default local).
2. `approve <prd.json> --state <run.json> --plan <plan.json> --gate A --revision <scope-rev>
   --evidence <explicit-user-reference>` records actual scope/delivery approval. Optional
   `--authority branch,commit,push,draft-pr` records only authorized actions.
3. After showing the combined HTML, repeat with `--gate B --revision <prd-revision>` and
   the actual approval evidence. B binds both source contracts and their revisions and
   requires complete requirement/task/check coverage. No separate Gate C exists.

New records use `fingerprintMode: "contract-v1"`. Gate A has a separate product-scope
fingerprint; Gate B binds PRD/plan contract fingerprints. Only document locale and root,
requirement, task and technical-entry titles are excluded. Titles are display labels;
put behavior in descriptions, acceptance, bodies and other contract fields. Summaries,
diagrams, scopes, checks and revisions remain binding. Title/locale-only edits need a
re-render, not reapproval; behavior edits without a revision bump still invalidate state.

Legacy v2 records without `fingerprintMode` retain full-document hashing. Never silently
upgrade them or edit stored hashes. For material source changes, start an explicit revision
and carry forward only decisions/evidence still valid for that scope and contract.
Evidence strings record human decisions; they cannot establish consent by themselves.

## Parallel CODE work

`next <prd.json> --state <run.json> --plan <plan.json>` reports ready task IDs, a conservative
`parallelTaskIds` batch, active work and scope conflicts; otherwise it reports the feature,
delivery or human-QA phase, completion or a blocker. Feature results include delivery-check
blockers and `continuationRequiresAuthorization` when the review allowance is exhausted.
A clean result can still deliver; only further correction/review needs that authorization.

Generate `task-context <prd.json> CODE-001 --plan <plan.json> --state <run.json>
--out <context.json>` for each worker. It carries readable source paths, feature framing,
selected full technical entries, applicable `checkWaivers` and `reviewAuthorizations`.
Top-level `specDigest`/`planDigest`
identify the raw current documents; `execution` carries the approval fingerprint mode
and contract digests. These can differ after a presentation edit. Without `--state`, the
excerpt is for planning and grants no execution authority. The helper cannot fetch design
attachments or prove reading; follow the [dispatch contract](../../../references/implementation-orchestration.md#carry-the-approved-contract-into-each-assignment).

Record CODE observations with `record-task <prd.json> CODE-001 --state <run.json>
--plan <plan.json> --phase <phase> --evidence <actual-observation>`:
`started -> implemented -> validated`. Starting claims scope and checks dependencies;
validation releases dependent implementation, not delivery. Literal file/subtree scopes
support parallelism; unknown/glob scopes serialize. The coordinator also checks symlinks,
generated outputs and shared non-file resources. CODE never depends on human acceptance.

## Integrated review and bounded continuation

Use `record-feature <prd.json> --state <run.json> --plan <plan.json>
--phase <phase> --evidence <actual-observation>` for:

```text
integrated -> validated -> simplified -> revalidated -> reviewed -> ready-to-deliver
                                                   -> corrected -> revalidated -> reviewed
```

All CODE tasks validate first. `simplified` can record that inspection found no useful
change; `revalidated` can reference still-valid checks for unchanged code/inputs. No extra
writer or duplicate test run is required solely to advance those states. `reviewed` records
one aggregate of the selected general/specialist reviewers, not one phase per reviewer.

Two rounds may run autonomously. If more correction/review is needed after that allowance
is consumed, obtain explicit user authorization for the specific unresolved work, then run:

```bash
node <prd-dir>/scripts/prd.mjs authorize-review <prd.json> --state <run.json> --plan <plan.json> --evidence <actual-user-authorization> --reason <specific-unresolved-finding>
```

This grants one additional round while retaining history, only before task delivery begins.
Never reset the run to evade the limit or treat exhausting it as a clean verdict. Review
identity is checked by the separate review helper; the coordinator still resolves material
findings, verifies coverage and compares the final tree with the reviewed snapshot.

## Delivery checks and accepted limitations

Use `record-check <prd.json> CHECK-001 --state <run.json> --plan <plan.json>
--result passed|failed|blocked --evidence <actual-result>` for observations. Checks default
to `stage: "delivery"`. Every such check must pass before `ready-to-deliver`, task delivery
and delivery suggestions from `next`; missing, failed or blocked results prevent progress.
Explicit `stage: "acceptance"` checks belong to post-delivery human acceptance and do not
block delivery. A manual route alone does not defer a check. Set stages in the approved plan.

If the user explicitly accepts one unresolved delivery check's exact limitation, record:

```bash
node <prd-dir>/scripts/prd.mjs waive-check <prd.json> CHECK-001 --state <run.json> --plan <plan.json> --evidence <actual-user-acceptance> --reason <specific-limitation>
```

The waiver binds that check and current observation (or absence); it does not turn failure
into success. A new observation invalidates it. Never infer acceptance, waive other checks
by analogy or change a check's stage to bypass the guard. Disclose accepted limitations.

## Deliver and preserve history

After `ready-to-deliver`, record each CODE task's `ready-to-open`, then `delivered-local`
or `published` in dependency order. Local delivery needs a saved attributable checkpoint;
publication needs recorded push/draft-pr authority and `--pr <actual-https-url>`, unique
per CODE. These names also cover draft MRs. No command itself publishes a request.

Before delivery starts, a newly discovered problem can re-enter `corrected` using the
remaining or explicitly extended review allowance. Once any task enters `ready-to-open`,
feature evidence freezes: preserve delivered snapshots and assess a new scoped revision.
Human QA receives `accepted` only after all CODE deliveries and actual human acceptance.
Re-render with `--state` to show observed results and waiver reasons/evidence. A waived
check retains its actual failed/blocked status; acceptance must not be displayed as a pass.

Schema v1 execution records used three gates and per-task reviews. Preserve them, prepare
the combined plan and obtain its actual approval before initializing a separate v2 run;
never relabel old B/C approvals or erase delivered history. Document schema remains v1.
The writer locks state and uses atomic replacement. Before removing an abandoned lock,
confirm its owner is gone and target only that lock. Never edit hashes to force approval.
