# Execution record

`<feature>.run.json` is separate from the specification. All commands below also accept
`--plan <feature>.tech-plan.json`; supply it for implementation work. Resolve the installed
`prd.mjs` once. `--help` lists all flags.

1. `init-run <prd.json> --state <run.json> --plan <plan.json>` accepts `--delivery local|review-request` (default local), creates a new record and
   refuses to overwrite one. Capture Gate A/B approvals from their actual earlier user
   messages once the PRD exists; do not invent new consent.
2. `approve <prd.json> --state <run.json> --plan <plan.json> --gate A --revision <scope-rev>
   --evidence <explicit-user-message-reference>` records scope approval. Optional
   `--authority branch,commit,push,draft-pr` records only actions the user authorized. `draft-pr` includes a draft MR; Gate A also binds the chosen delivery mode.
3. Repeat for Gate B with the approved plan revision, then Gate C with the PRD revision.
   Gate C requires complete requirement-to-task/check coverage. Evidence is a plain text
   reference, not an automatic consent mechanism.
4. `next <prd.json> --state <run.json> --plan <plan.json>` returns one ready task, the active
   task, pending human QA, or a blocker. It does not spawn an agent or mutate the repo.
5. `task-context <prd.json> CODE-001 --plan <plan.json> --state <run.json> --out <context.json>`
   produces derived context, source paths and fingerprints. Without `--state` it is a
   planning excerpt, not evidence that execution is authorized.
6. `record-task <prd.json> CODE-001 --state <run.json> --plan <plan.json> --phase <phase>
   --evidence <actual-observation>` records the sequential pipeline:
   `implemented -> validated -> simplified -> revalidated -> reviewed -> ready-to-open`,
   then `delivered-local` in local mode or `published` in review-request mode.
   Verified review fixes may go from `reviewed` back to `implemented`, bounded to two
   review passes. A pending review concern remains at `reviewed`; don't advance until
   the coordinator judges it resolved. `published` additionally requires `--pr <actual-url>`
   and recorded push/draft-pr authority. This records a real PR/MR; it never creates one. Local delivery requires a saved checkpoint and evidence, not an external URL. Only the selected terminal phase releases dependent tasks.
   Human tasks can only receive `accepted`, with evidence of actual human acceptance.
7. `record-check <prd.json> CHECK-001 --state <run.json> --result passed|failed|blocked
   --evidence <actual-result>` records observed checks. Planned checks live only in the PRD.
8. `render <prd.json> --plan <plan.json> --state <run.json>` combines the unchanged spec
   with the latest evidence in HTML. Task-chain completion does not prove integrated
   verification or human acceptance; perform those separately.

The state writer uses a lock and atomic replacement. If a crashed process leaves a lock,
confirm the owning process is gone before removing that exact lock. Never ignore stale
fingerprints or copy an old approval onto changed content without a valid user decision.
